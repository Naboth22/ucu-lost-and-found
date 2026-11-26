import { z } from "zod";

export const registerSchema = z.object({
  full_name: z.string().trim().min(3).max(120),
  email: z.string().trim().email().max(160),
  student_or_staff_id: z.string().trim().min(4).max(50),
  phone: z.string().trim().min(7).max(30),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  full_name: z.string().trim().min(3).max(120),
  phone: z.string().trim().min(7).max(30),
});

export const createReportSchema = z.object({
  report_type: z.enum(["LOST", "FOUND"]),
  title: z.string().trim().min(3).max(160),
  category: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(4000),
  private_identifying_info: z.string().trim().max(4000).optional().nullable(),
  location_text: z.string().trim().min(2).max(140),
  incident_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD date format"),
});

export const updateReportSchema = z.object({
  title: z.string().trim().min(3).max(160).optional(),
  category: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().min(10).max(4000).optional(),
  private_identifying_info: z.string().trim().max(4000).optional().nullable(),
  location_text: z.string().trim().min(2).max(140).optional(),
  incident_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});

export const createClaimSchema = z.object({
  report_id: z.coerce.number().int().positive(),
  ownership_explanation: z.string().trim().min(10).max(4000),
  private_evidence_details: z.string().trim().min(5).max(4000),
});

export const decideClaimSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  decision_reason: z.string().trim().min(5).max(2000),
});

export const confirmReturnSchema = z.object({
  claim_id: z.coerce.number().int().positive(),
  collector_name: z.string().trim().min(3).max(120),
  collector_id_number: z.string().trim().min(4).max(50),
  verification_notes: z.string().trim().max(2000).optional().nullable(),
});
