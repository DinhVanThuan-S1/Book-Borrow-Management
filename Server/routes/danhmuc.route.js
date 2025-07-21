const express = require("express");
const DanhMucController = require("../controllers/danhmuc.controller");
const {
  authenticateToken,
  requireEmployee,
} = require("../middleware/auth.middleware");
const router = express.Router();

// Routes công khai
router.get("/all", DanhMucController.getAllDanhMucs); // Cho dropdown
router.get("/stats", DanhMucController.getDanhMucStats); // Thống kê
router.get("/", DanhMucController.getDanhMucs);
router.get("/:id", DanhMucController.getDanhMucById);

// Routes cần xác thực
router.post(
  "/",
  authenticateToken,
  requireEmployee,
  DanhMucController.createDanhMuc
);
router.put(
  "/:id",
  authenticateToken,
  requireEmployee,
  DanhMucController.updateDanhMuc
);
router.delete(
  "/:id",
  authenticateToken,
  requireEmployee,
  DanhMucController.deleteDanhMuc
);

module.exports = router;
