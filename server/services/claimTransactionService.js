import pool from "../config/db.js";
import { logActivity, createNotification } from "./auditService.js";

export async function processClaimDecision({
  claimId,
  adminId,
  decision,
  decisionReason,
  ipAddress,
}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [claimRows] = await conn.query(
      `SELECT id, report_id, claimant_id, status
       FROM claims
       WHERE id = ?
       FOR UPDATE`,
      [claimId],
    );
    const claim = claimRows[0];
    if (!claim) {
      const err = new Error("Claim not found.");
      err.statusCode = 404;
      throw err;
    }
    if (claim.status !== "PENDING") {
      const err = new Error(
        `Only PENDING claims can be decided. Current status: ${claim.status}.`,
      );
      err.statusCode = 409;
      throw err;
    }

    const [reportRows] = await conn.query(
      `SELECT id, reporter_id, report_type, title, status
       FROM item_reports
       WHERE id = ?
       FOR UPDATE`,
      [claim.report_id],
    );
    const report = reportRows[0];
    if (!report) {
      const err = new Error("Associated item report not found.");
      err.statusCode = 404;
      throw err;
    }
    if (report.status === "RETURNED" || report.status === "CLOSED") {
      const err = new Error(
        `Cannot decide claim because report is already ${report.status}.`,
      );
      err.statusCode = 409;
      throw err;
    }

    if (decision === "APPROVED") {
      const [approvedRows] = await conn.query(
        `SELECT id FROM claims
         WHERE report_id = ? AND status = 'APPROVED' AND id <> ?
         LIMIT 1
         FOR UPDATE`,
        [report.id, claim.id],
      );
      if (approvedRows.length > 0) {
        const err = new Error(
          "Another claim has already been approved for this item.",
        );
        err.statusCode = 409;
        throw err;
      }

      await conn.query(`UPDATE claims SET status = 'APPROVED' WHERE id = ?`, [
        claim.id,
      ]);
      await conn.query(
        `UPDATE claims
         SET status = 'REJECTED'
         WHERE report_id = ? AND id <> ? AND status = 'PENDING'`,
        [report.id, claim.id],
      );
      await conn.query(
        `UPDATE item_reports SET status = 'CLAIMED' WHERE id = ?`,
        [report.id],
      );

      await createNotification(conn, {
        userId: claim.claimant_id,
        title: "Ownership Claim Approved",
        message: `Your claim (#${claim.id}) for "${report.title}" was approved. Bring your UCU ID for physical collection.`,
        relatedType: "CLAIM",
        relatedId: claim.id,
      });
    } else {
      await conn.query(`UPDATE claims SET status = 'REJECTED' WHERE id = ?`, [
        claim.id,
      ]);
      const [remainingPending] = await conn.query(
        `SELECT id FROM claims WHERE report_id = ? AND status = 'PENDING' LIMIT 1`,
        [report.id],
      );
      const nextReportStatus =
        remainingPending.length > 0 ? "CLAIM_PENDING" : "OPEN";
      await conn.query(`UPDATE item_reports SET status = ? WHERE id = ?`, [
        nextReportStatus,
        report.id,
      ]);

      await createNotification(conn, {
        userId: claim.claimant_id,
        title: "Ownership Claim Update",
        message: `Your claim (#${claim.id}) for "${report.title}" was not approved. Reason: ${decisionReason}`,
        relatedType: "CLAIM",
        relatedId: claim.id,
      });
    }

    await conn.query(
      `INSERT INTO claim_decisions (claim_id, decided_by_admin_id, decision, decision_reason)
       VALUES (?, ?, ?, ?, ?)`,
      [claim.id, adminId, decision, decisionReason],
    );

    await logActivity(conn, {
      actorId: adminId,
      action: decision === "APPROVED" ? "APPROVE_CLAIM" : "REJECT_CLAIM",
      entityType: "claims",
      entityId: claim.id,
      details: {
        report_id: report.id,
        claimant_id: claim.claimant_id,
        decision,
      },
      ipAddress,
    });

    await conn.commit();
    return { claimId: claim.id, reportId: report.id, decision };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function processReturnConfirmation({
  claimId,
  adminId,
  collectorName,
  collectorIdNumber,
  verificationNotes,
  ipAddress,
}) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [claimRows] = await conn.query(
      `SELECT id, report_id, claimant_id, status
       FROM claims
       WHERE id = ?
       FOR UPDATE`,
      [claimId],
    );
    const claim = claimRows[0];
    if (!claim) {
      const err = new Error("Claim not found.");
      err.statusCode = 404;
      throw err;
    }
    if (claim.status !== "APPROVED") {
      const err = new Error(
        "Physical return can only be confirmed for an APPROVED claim.",
      );
      err.statusCode = 409;
      throw err;
    }

    const [reportRows] = await conn.query(
      `SELECT id, title, status
       FROM item_reports
       WHERE id = ?
       FOR UPDATE`,
      [claim.report_id],
    );
    const report = reportRows[0];
    if (!report) {
      const err = new Error("Associated report not found.");
      err.statusCode = 404;
      throw err;
    }
    if (report.status === "RETURNED") {
      const err = new Error(
        "This item has already been marked as physically returned.",
      );
      err.statusCode = 409;
      throw err;
    }

    const [existingReturn] = await conn.query(
      `SELECT id FROM item_returns WHERE report_id = ? OR claim_id = ? LIMIT 1 FOR UPDATE`,
      [report.id, claim.id],
    );
    if (existingReturn.length > 0) {
      const err = new Error(
        "A return record already exists for this item/claim.",
      );
      err.statusCode = 409;
      throw err;
    }

    const [insertRes] = await conn.query(
      `INSERT INTO item_returns
         (report_id, claim_id, confirmed_by_admin_id, collector_name, collector_id_number, verification_notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        report.id,
        claim.id,
        adminId,
        collectorName,
        collectorIdNumber,
        verificationNotes || null,
      ],
    );

    await conn.query(
      `UPDATE item_reports SET status = 'RETURNED' WHERE id = ?`,
      [report.id],
    );

    await createNotification(conn, {
      userId: claim.claimant_id,
      title: "Item Return Confirmed",
      message: `Physical handover of "${report.title}" has been recorded under ID ${collectorIdNumber}.`,
      relatedType: "RETURN",
      relatedId: report.id,
    });

    await logActivity(conn, {
      actorId: adminId,
      action: "CONFIRM_RETURN",
      entityType: "item_returns",
      entityId: insertRes.insertId,
      details: {
        report_id: report.id,
        claim_id: claim.id,
        collector_name: collectorName,
        collector_id_number: collectorIdNumber,
      },
      ipAddress,
    });

    await conn.commit();
    return {
      returnId: insertRes.insertId,
      reportId: report.id,
      claimId: claim.id,
      status: "RETURNED",
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
