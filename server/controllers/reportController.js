import pool from "../config/db.js";
import {
  createReportSchema,
  updateReportSchema,
} from "../validators/schemas.js";
import { logActivity } from "../services/auditService.js";

export async function listPublicReports(req, res, next) {
  try {
    const {
      q = "",
      type = "",
      category = "",
      location = "",
      status = "",
      dateFrom = "",
      sort = "newest",
      page = "1",
      limit = "12",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (q.trim()) {
      conditions.push(
        "(r.title LIKE ? OR r.description LIKE ? OR r.location_text LIKE ?)",
      );
      const like = `%${q.trim()}%`;
      params.push(like, like, like);
    }
    if (["LOST", "FOUND"].includes(String(type).toUpperCase())) {
      conditions.push("r.report_type = ?");
      params.push(String(type).toUpperCase());
    }
    if (category.trim() && category !== "ALL") {
      conditions.push("r.category = ?");
      params.push(category.trim());
    }
    if (location.trim() && location !== "ALL") {
      conditions.push("r.location_text = ?");
      params.push(location.trim());
    }
    if (
      ["OPEN", "CLAIM_PENDING", "CLAIMED", "RETURNED", "CLOSED"].includes(
        String(status).toUpperCase(),
      )
    ) {
      conditions.push("r.status = ?");
      params.push(String(status).toUpperCase());
    }
    if (dateFrom.trim()) {
      conditions.push("r.incident_date >= ?");
      params.push(dateFrom.trim());
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    let orderBy = "r.incident_date DESC, r.id DESC";
    if (sort === "oldest") orderBy = "r.incident_date ASC, r.id ASC";
    if (sort === "title") orderBy = "r.title ASC";

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM item_reports r ${whereClause}`,
      params,
    );
    const total = countRows[0].total;

    const [rows] = await pool.query(
      `SELECT
         r.id, r.reporter_id, u.full_name AS reporter_name,
         r.report_type, r.title, r.category, r.description,
         r.location_text, r.incident_date, r.image_path, r.status,
         r.created_at, r.updated_at
       FROM item_reports r
       JOIN users u ON u.id = r.reporter_id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset],
    );

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (err) {
    return next(err);
  }
}

export async function getReportById(req, res, next) {
  try {
    const reportId = Number(req.params.id);
    if (!Number.isInteger(reportId) || reportId <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid report ID." });
    }

    const [rows] = await pool.query(
      `SELECT
         r.id, r.reporter_id, u.full_name AS reporter_name,
         r.report_type, r.title, r.category, r.description,
         r.private_identifying_info, r.location_text, r.incident_date,
         r.image_path, r.status, r.created_at, r.updated_at
       FROM item_reports r
       JOIN users u ON u.id = r.reporter_id
       WHERE r.id = ? LIMIT 1`,
      [reportId],
    );

    const report = rows[0];
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found." });
    }

    const isOwnerOrAdmin =
      req.user &&
      (req.user.role === "ADMIN" || req.user.id === report.reporter_id);

    const responseData = { ...report };
    if (!isOwnerOrAdmin) {
      delete responseData.private_identifying_info;
    }

    return res.status(200).json({ success: true, data: responseData });
  } catch (err) {
    return next(err);
  }
}

export async function createReport(req, res, next) {
  try {
    const parsed = createReportSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const imagePath = req.file ? `/uploads/reports/${req.file.filename}` : null;
    const {
      report_type,
      title,
      category,
      description,
      private_identifying_info = null,
      location_text,
      incident_date,
    } = parsed.data;

    const [result] = await pool.query(
      `INSERT INTO item_reports
         (reporter_id, report_type, title, category, description, private_identifying_info, location_text, incident_date, image_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
      [
        req.user.id,
        report_type,
        title,
        category,
        description,
        private_identifying_info || null,
        location_text,
        incident_date,
        imagePath,
      ],
    );

    await logActivity(pool, {
      actorId: req.user.id,
      action: `CREATE_${report_type}_REPORT`,
      entityType: "item_reports",
      entityId: result.insertId,
      details: { title, category, location_text },
      ipAddress: req.ip,
    });

    return res.status(201).json({
      success: true,
      data: { id: result.insertId, status: "OPEN", image_path: imagePath },
    });
  } catch (err) {
    return next(err);
  }
}

export async function updateReport(req, res, next) {
  try {
    const reportId = Number(req.params.id);
    const parsed = updateReportSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const [rows] = await pool.query(
      "SELECT * FROM item_reports WHERE id = ? LIMIT 1",
      [reportId],
    );
    const report = rows[0];
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found." });
    }

    const isAdmin = req.user.role === "ADMIN";
    const isOwner = req.user.id === report.reporter_id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You cannot edit another user's report.",
      });
    }

    if (!isAdmin && report.status !== "OPEN") {
      return res.status(409).json({
        success: false,
        message: "Only OPEN reports can be edited by the student owner.",
      });
    }

    const nextImagePath = req.file
      ? `/uploads/reports/${req.file.filename}`
      : report.image_path;
    const nextTitle = parsed.data.title ?? report.title;
    const nextCategory = parsed.data.category ?? report.category;
    const nextDesc = parsed.data.description ?? report.description;
    const nextPrivate =
      parsed.data.private_identifying_info !== undefined
        ? parsed.data.private_identifying_info
        : report.private_identifying_info;
    const nextLocation = parsed.data.location_text ?? report.location_text;
    const nextDate = parsed.data.incident_date ?? report.incident_date;
    const nextStatus =
      isAdmin && parsed.data.status ? parsed.data.status : report.status;

    await pool.query(
      `UPDATE item_reports
       SET title = ?, category = ?, description = ?, private_identifying_info = ?,
           location_text = ?, incident_date = ?, image_path = ?, status = ?
       WHERE id = ?`,
      [
        nextTitle,
        nextCategory,
        nextDesc,
        nextPrivate,
        nextLocation,
        nextDate,
        nextImagePath,
        nextStatus,
        reportId,
      ],
    );

    await logActivity(pool, {
      actorId: req.user.id,
      action: "UPDATE_REPORT",
      entityType: "item_reports",
      entityId: reportId,
      ipAddress: req.ip,
    });

    return res
      .status(200)
      .json({ success: true, message: "Report updated successfully." });
  } catch (err) {
    return next(err);
  }
}

export async function listMyReports(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, report_type, title, category, description, location_text, incident_date, image_path, status, created_at
       FROM item_reports
       WHERE reporter_id = ?
       ORDER BY created_at DESC`,
      [req.user.id],
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    return next(err);
  }
}
