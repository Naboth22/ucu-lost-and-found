import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { env } from '../config/env.js';

export async function requireAuth(req, res, next) {
  try {
    const cookieToken = req.cookies?.[env.cookieName];
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    const token = cookieToken || bearerToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, env.jwtSecret);
    const [rows] = await pool.query(
      'SELECT id, full_name, email, student_or_staff_id, phone, role, is_active FROM users WHERE id = ? LIMIT 1',
      [decoded.sub]
    );

    const user = rows[0];
    if (!user || !user.is_active) {
      return res.status(401).json({ success: false, message: 'Account is inactive or invalid.' });
    }

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
}
