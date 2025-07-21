const express = require("express");
const NhanVienController = require("../controllers/nhanvien.controller");
const UploadService = require("../services/upload.service");
const {
  authenticateToken,
  requireEmployee,
  requireAdmin,
} = require("../middleware/auth.middleware");
const router = express.Router();

// Cấu hình upload avatar
const uploadAvatar = UploadService.getAvatarUploadConfig();

// Routes công khai
router.get(
  "/search",
  authenticateToken,
  requireEmployee,
  NhanVienController.findByEmail
);

// Routes cho nhân viên (profile cá nhân)
router.get("/profile", authenticateToken, NhanVienController.getMyProfile);
router.put("/profile", authenticateToken, NhanVienController.updateNhanVien);
router.put(
  "/avatar/:id",
  authenticateToken,
  uploadAvatar.single("Avatar"),
  NhanVienController.updateAvatar
);

// Routes cho admin
router.get(
  "/stats",
  authenticateToken,
  requireAdmin,
  NhanVienController.getNhanVienStats
);
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  NhanVienController.getNhanViens
);
router.get(
  "/:id",
  authenticateToken,
  requireEmployee,
  NhanVienController.getNhanVienById
);
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  NhanVienController.createNhanVien
);
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  NhanVienController.updateNhanVien
);
router.put(
  "/:id/role",
  authenticateToken,
  requireAdmin,
  NhanVienController.changeRole
);
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  NhanVienController.deleteNhanVien
);

module.exports = router;
