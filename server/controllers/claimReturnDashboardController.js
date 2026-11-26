import pool from "../config/db.js";
import {
  createClaimSchema,
  decideClaimSchema,
  confirmReturnSchema,
} from "../validators/schemas.js";
import {
  processClaimDecision,
  processReturnConfirmation,
} from "../services/claimTransactionService.js";
import { logActivity } from "../services/auditService.js";

export async function submitClaim(req, res, next) {
  try {
    const parsed = createClaimSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { report_id, ownership_explanation, private_evidence_details } =
      parsed.data;
    const evidencePath = req.file
      ? `/uploads/claims/${req.file.filename}`
      : null;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [reportRows] = await conn.query(
        "SELECT id, reporter_id, report_type, status FROM item_reports WHERE id = ? FOR UPDATE",
        [report_id],
      );
      const report = reportRows[0];
      if (!report) {
        await conn.rollback();
        return res
          .status(404)
          .json({ success: false, message: "Item report not found." });
      }
      if (report.report_type !== "FOUND") {
        await conn.rollback();
        return res
          .status(400)
          .json({
            success: false,
            message: "Claims can only be submitted against FOUND items.",
          });
      }
      if (report.reporter_id === req.user.id) {
        await conn.rollback();
        return res
          .status(400)
          .json({
            success: false,
            message: "You cannot claim your own reported item.",
          });
      }
      if (["RETURNED", "CLAIMED", "CLOSED"].includes(report.status)) {
        await conn.rollback();
        return res
          .status(409)
          .json({
            success: false,
            message: "This item is no longer accepting claims.",
          });
      }

      const [insertClaim] = await conn.query(
        `INSERT INTO claims
           (report_id, claimant_id, ownership_explanation, private_evidence_details, evidence_file_path, status)
         VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [
          report_id,
          req.user.id,
          ownership_explanation,
          private_evidence_details,
          evidencePath,
        ],
      );

      if (report.status === "OPEN") {
        await conn.query(
          `UPDATE item_reports SET status = 'CLAIM_PENDING' WHERE id = ?`,
          [report_id],
        );
      }

      await logActivity(conn, {
        actorId: req.user.id,
        action: "SUBMIT_CLAIM",
        entityType: "claims",
        entityId: insertClaim.insertId,
        details: { report_id },
        ipAddress: req.ip,
      });

      await conn.commit();
      return res.status(201).json({
        success: true,
        data: { id: insertClaim.insertId, report_id, status: "PENDING" },
      });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (err) {
    return next(err);
  }
}

export async function listMyClaims(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
         c.id, c.report_id, r.title AS report_title, r.location_text, r.status AS report_status,
         c.ownership_explanation, c.status, c.created_at,
         cd.decision_reason, cd.decided_at
       FROM claims c
       JOIN item_reports r ON r.id = c.report_id
       LEFT JOIN claim_decisions cd ON cd.claim_id = c.id
       WHERE c.claimant_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id],
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return next(err);
  }
}

export async function listAllClaimsForAdmin(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
         c.id, c.report_id, r.title AS report_title, r.location_text,
         r.private_identifying_info AS report_private_info, r.status AS report_status,
         c.claimant_id, u.full_name AS claimant_name, u.student_or_staff_id AS claimant_id_number,
         c.ownership_explanation, c.private_evidence_details, c.evidence_file_path,
         c.status, c.created_at,
         cd.decision_reason, cd.decided_at, adm.full_name AS decided_by_name
       FROM claims c
       JOIN item_reports r ON r.id = c.report_id
       JOIN users u ON u.id = c.claimant_id
       LEFT JOIN claim_decisions cd ON cd.claim_id = c.id
       LEFT JOIN users adm ON adm.id = cd.decided_by_admin_id
       ORDER BY FIELD(c.status, 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'), c.created_at DESC`,
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return next(err);
  }
}

export async function decideClaim(req, res, next) {
  try {
    const claimId = Number(req.params.id);
    const parsed = decideClaimSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Decision and reason (min 5 characters) are required.",
      });
    }

    const result = await processClaimDecision({
      claimId,
      adminId: req.user.id,
      decision: parsed.data.decision,
      decisionReason: parsed.data.decision_reason,
      ipAddress: req.ip,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

export async function confirmReturn(req, res, next) {
  try {
    const parsed = confirmReturnSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const result = await processReturnConfirmation({
      claimId: parsed.data.claim_id,
      adminId: req.user.id,
      collectorName: parsed.data.collector_name,
      collectorIdNumber: parsed.data.collector_id_number,
      verificationNotes: parsed.data.verification_notes,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
}

export async function listReturns(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT
         ir.id, ir.report_id, ir.claim_id, r.title AS item_title,
         ir.collector_name, ir.collector_id_number, ir.verification_notes, ir.returned_at,
         adm.full_name AS confirmed_by_name
       FROM item_returns ir
       JOIN item_reports r ON r.id = ir.report_id
       JOIN users adm ON adm.id = ir.confirmed_by_admin_id
       ORDER BY ir.returned_at DESC`,
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return next(err);
  }
}

export async function getStudentDashboard(req, res, next) {
  try {
    const userId = req.user.id;
    const [[reportCounts]] = await pool.query(
      `SELECT
         COUNT(*) AS total_reports,
         SUM(CASE WHEN report_type = 'LOST' THEN 1 ELSE 0 END) AS lost_items,
         SUM(CASE WHEN report_type = 'FOUND' THEN 1 ELSE 0 END) AS found_items
       FROM item_reports WHERE reporter_id = ?`,
      [userId],
    );
    const [[claimCounts]] = await pool.query(
      `SELECT
         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_claims,
         SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_claims
       FROM claims WHERE claimant_id = ?`,
      [userId],
    );
    const [[returnedCount]] = await pool.query(
      `SELECT COUNT(DISTINCT r.id) AS returned_items
       FROM item_reports r
       LEFT JOIN claims c ON c.report_id = r.id
       WHERE r.status = 'RETURNED' AND (r.reporter_id = ? OR c.claimant_id = ?)`,
      [userId, userId],
    );
    const [notifications] = await pool.query(
      `SELECT id, title, message, related_type, related_id, is_read, created_at
       FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10`,
      [userId],
    );

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          total_reports: Number(reportCounts.total_reports || 0),
          lost_items: Number(reportCounts.lost_items || 0),
          found_items: Number(reportCounts.found_items || 0),
          pending_claims: Number(claimCounts.pending_claims || 0),
          approved_claims: Number(claimCounts.approved_claims || 0),
          returned_items: Number(returnedCount.returned_items || 0),
        },
        notifications,
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function getAdminDashboard(req, res, next) {
  try {
    const [[studentsRow]] = await pool.query(
      `SELECT COUNT(*) AS total_students FROM users WHERE role = 'STUDENT'`,
    );
    const [[reportsRow]] = await pool.query(
      `SELECT
         COUNT(*) AS total_reports,
         SUM(CASE WHEN report_type = 'LOST' THEN 1 ELSE 0 END) AS lost_items,
         SUM(CASE WHEN report_type = 'FOUND' THEN 1 ELSE 0 END) AS found_items,
         SUM(CASE WHEN status = 'RETURNED' THEN 1 ELSE 0 END) AS returned_items
       FROM item_reports`,
    );
    const [[claimsRow]] = await pool.query(
      `SELECT
         SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) AS pending_claims,
         SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) AS approved_claims,
         SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_claims
       FROM claims`,
    );
    const [categoryBreakdown] = await pool.query(
      `SELECT category AS name, COUNT(*) AS value
       FROM item_reports GROUP BY category ORDER BY value DESC`,
    );
    const [monthlyActivity] = await pool.query(
      `SELECT
         DATE_FORMAT(incident_date, '%b') AS month,
         SUM(CASE WHEN report_type = 'LOST' THEN 1 ELSE 0 END) AS lost,
         SUM(CASE WHEN report_type = 'FOUND' THEN 1 ELSE 0 END) AS found
       FROM item_reports
       GROUP BY YEAR(incident_date), MONTH(incident_date), DATE_FORMAT(incident_date, '%b')
       ORDER BY YEAR(incident_date), MONTH(incident_date)
       LIMIT 6`,
    );
    const [auditLogs] = await pool.query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at, u.full_name AS actor_name, u.role
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.actor_id
       ORDER BY al.created_at DESC LIMIT 25`,
    );

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          total_students: Number(studentsRow.total_students || 0),
          total_reports: Number(reportsRow.total_reports || 0),
          lost_items: Number(reportsRow.lost_items || 0),
          found_items: Number(reportsRow.found_items || 0),
          pending_claims: Number(claimsRow.pending_claims || 0),
          approved_claims: Number(claimsRow.approved_claims || 0),
          rejected_claims: Number(claimsRow.rejected_claims || 0),
          returned_items: Number(reportsRow.returned_items || 0),
        },
        categoryBreakdown,
        monthlyActivity,
        auditLogs,
      },
    });
  } catch (err) {
    return next(err);
  }
}
