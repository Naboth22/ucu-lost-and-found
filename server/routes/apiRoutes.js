import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  reportImageUpload,
  claimEvidenceUpload,
} from "../middleware/uploadMiddleware.js";
import {
  register,
  login,
  logout,
  me,
  updateProfile,
} from "../controllers/authController.js";
import {
  listPublicReports,
  getReportById,
  createReport,
  updateReport,
  listMyReports,
} from "../controllers/reportController.js";
import {
  submitClaim,
  listMyClaims,
  listAllClaimsForAdmin,
  decideClaim,
  confirmReturn,
  listReturns,
  getStudentDashboard,
  getAdminDashboard,
} from "../controllers/claimReturnDashboardController.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Try again later.",
  },
});

router.post("/auth/register", authLimiter, register);
router.post("/auth/login", authLimiter, login);
router.post("/auth/logout", logout);
router.get("/auth/me", requireAuth, me);
router.put("/auth/profile", requireAuth, updateProfile);

router.get("/reports", listPublicReports);
router.get("/reports/mine", requireAuth, listMyReports);
router.get("/reports/:id", (req, res, next) => {
  if (req.cookies?.ucu_lf_token || req.headers.authorization) {
    return requireAuth(req, res, () => getReportById(req, res, next));
  }
  return getReportById(req, res, next);
});
router.post(
  "/reports",
  requireAuth,
  reportImageUpload.single("image"),
  createReport,
);
router.put(
  "/reports/:id",
  requireAuth,
  reportImageUpload.single("image"),
  updateReport,
);

router.post(
  "/claims",
  requireAuth,
  requireRole("STUDENT"),
  claimEvidenceUpload.single("evidence"),
  submitClaim,
);
router.get("/claims/mine", requireAuth, listMyClaims);

router.get(
  "/dashboard/student",
  requireAuth,
  requireRole("STUDENT"),
  getStudentDashboard,
);

router.get(
  "/admin/dashboard",
  requireAuth,
  requireRole("ADMIN"),
  getAdminDashboard,
);
router.get(
  "/admin/claims",
  requireAuth,
  requireRole("ADMIN"),
  listAllClaimsForAdmin,
);
router.post(
  "/admin/claims/:id/decision",
  requireAuth,
  requireRole("ADMIN"),
  decideClaim,
);
router.get("/admin/returns", requireAuth, requireRole("ADMIN"), listReturns);
router.post(
  "/admin/returns/confirm",
  requireAuth,
  requireRole("ADMIN"),
  confirmReturn,
);

export default router;
