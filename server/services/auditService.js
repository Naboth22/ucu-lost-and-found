import pool from "../config/db.js";

export async function logActivity(
  connOrPool,
  {
    actorId = null,
    action,
    entityType,
    entityId = null,
    details = null,
    ipAddress = null,
  },
) {
  const executor = connOrPool || pool;
  await executor.query(
    `INSERT INTO activity_logs (actor_id, action, entity_type, entity_id, details_json, ip_address)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      actorId,
      action,
      entityType,
      entityId,
      details ? JSON.stringify(details) : null,
      ipAddress,
    ],
  );
}

export async function createNotification(
  connOrPool,
  { userId, title, message, relatedType = "SYSTEM", relatedId = null },
) {
  const executor = connOrPool || pool;
  await executor.query(
    `INSERT INTO notifications (user_id, title, message, related_type, related_id)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, title, message, relatedType, relatedId],
  );
}
