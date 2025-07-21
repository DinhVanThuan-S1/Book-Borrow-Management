const express = require("express");
const DocGiaController = require("../controllers/docgia.controller");
const UploadService = require("../services/upload.service");
const {
  authenticateToken,
  requireEmployee,
} = require("../middleware/auth.middleware");
const router = express.Router();

// Cấu hình upload avatar
const uploadAvatar = UploadService.getAvatarUploadConfig();

// Routes công khai
router.get("/search", DocGiaController.findByEmail);

// Routes cho độc giả (profile cá nhân)
router.get("/profile", authenticateToken, DocGiaController.getMyProfile);
router.put("/profile", authenticateToken, DocGiaController.updateDocGia);
router.put(
  "/avatar/:id",
  authenticateToken,
  uploadAvatar.single("Avatar"),
  DocGiaController.updateAvatar
);

// Routes cho admin/nhân viên
router.get(
  "/stats",
  authenticateToken,
  requireEmployee,
  DocGiaController.getDocGiaStats
);
router.get(
  "/",
  authenticateToken,
  requireEmployee,
  DocGiaController.getDocGias
);
router.get(
  "/:id",
  authenticateToken,
  requireEmployee,
  DocGiaController.getDocGiaById
);
router.get(
  "/:id/activity",
  authenticateToken,
  requireEmployee,
  DocGiaController.getDocGiaActivity
);
router.post(
  "/",
  authenticateToken,
  requireEmployee,
  DocGiaController.createDocGia
);
router.put(
  "/:id",
  authenticateToken,
  requireEmployee,
  DocGiaController.updateDocGia
);
router.delete(
  "/:id",
  authenticateToken,
  requireEmployee,
  DocGiaController.deleteDocGia
);

module.exports = router;
