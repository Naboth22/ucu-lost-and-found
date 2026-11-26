import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { env } from "../config/env.js";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../validators/schemas.js";
import { logActivity } from "../services/auditService.js";

function signAndSetCookie(res, user) {
  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

  res.cookie(env.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
}

export async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { full_name, email, student_or_staff_id, phone, password } =
      parsed.data;
    const normalizedEmail = email.toLowerCase();

    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ? OR student_or_staff_id = ? LIMIT 1",
      [normalizedEmail, student_or_staff_id],
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email or registration/staff ID already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, student_or_staff_id, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, 'STUDENT')`,
      [full_name, normalizedEmail, student_or_staff_id, phone, passwordHash],
    );

    const user = {
      id: result.insertId,
      full_name,
      email: normalizedEmail,
      student_or_staff_id,
      phone,
      role: "STUDENT",
    };

    const token = signAndSetCookie(res, user);
    await logActivity(pool, {
      actorId: user.id,
      action: "USER_REGISTER",
      entityType: "users",
      entityId: user.id,
      ipAddress: req.ip,
    });

    return res.status(201).json({ success: true, token, user });
  } catch (err) {
    return next(err);
  }
}

export async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required." });
    }

    const email = parsed.data.email.toLowerCase();
    const [rows] = await pool.query(
      `SELECT id, full_name, email, student_or_staff_id, phone, password_hash, role, is_active
       FROM users WHERE email = ? LIMIT 1`,
      [email],
    );

    const account = rows[0];
    if (!account || !account.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const validPassword = await bcrypt.compare(
      parsed.data.password,
      account.password_hash,
    );
    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const safeUser = {
      id: account.id,
      full_name: account.full_name,
      email: account.email,
      student_or_staff_id: account.student_or_staff_id,
      phone: account.phone,
      role: account.role,
    };

    const token = signAndSetCookie(res, safeUser);
    await logActivity(pool, {
      actorId: safeUser.id,
      action: "USER_LOGIN",
      entityType: "users",
      entityId: safeUser.id,
      ipAddress: req.ip,
    });

    return res.status(200).json({ success: true, token, user: safeUser });
  } catch (err) {
    return next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie(env.cookieName, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
  });
  return res
    .status(200)
    .json({ success: true, message: "Logged out successfully." });
}

export async function me(req, res) {
  return res.status(200).json({ success: true, user: req.user });
}

export async function updateProfile(req, res, next) {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid profile details." });
    }

    await pool.query("UPDATE users SET full_name = ?, phone = ? WHERE id = ?", [
      parsed.data.full_name,
      parsed.data.phone,
      req.user.id,
    ]);

    const updatedUser = {
      ...req.user,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
    };

    return res.status(200).json({ success: true, user: updatedUser });
  } catch (err) {
    return next(err);
  }
}
