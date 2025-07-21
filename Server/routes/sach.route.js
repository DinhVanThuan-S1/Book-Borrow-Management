const express = require("express");
const SachController = require("../controllers/sach.controller");
const UploadService = require("../services/upload.service");
const {
  authenticateToken,
  requireEmployee,
} = require("../middleware/auth.middleware");
const router = express.Router();

// Cấu hình upload
const upload = UploadService.getBookUploadConfig();

// Routes
router.get("/", SachController.getSaches);
router.get("/popular/top", SachController.getPopularBooks);
router.get("/:id", SachController.getSachById);

// Routes cần xác thực
router.post(
  "/",
  authenticateToken,
  requireEmployee,
  upload.single("BiaSach"),
  SachController.createSach
);
router.put(
  "/:id",
  authenticateToken,
  requireEmployee,
  upload.single("BiaSach"),
  SachController.updateSach
);
router.delete(
  "/:id",
  authenticateToken,
  requireEmployee,
  SachController.deleteSach
);

module.exports = router;
