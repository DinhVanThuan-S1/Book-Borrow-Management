const express = require("express");
const ThongKeController = require("../controllers/thongke.controller");
const {
  authenticateToken,
  requireEmployee,
} = require("../middleware/auth.middleware");
const router = express.Router();

// Tất cả routes thống kê đều cần quyền nhân viên
router.use(authenticateToken, requireEmployee);

// Dashboard tổng hợp
router.get("/dashboard", ThongKeController.getDashboard);

// Thống kê tổng quan
router.get("/overview", ThongKeController.getOverview);

// Thống kê theo thời gian
router.get("/monthly", ThongKeController.getMonthlyStats);
router.get("/yearly", ThongKeController.getYearlyStats);

// Top rankings
router.get("/top-books", ThongKeController.getTopBooks);
router.get("/top-readers", ThongKeController.getTopReaders);

// Thống kê khác
router.get("/categories", ThongKeController.getCategoryStats);
router.get("/low-stock", ThongKeController.getLowStockBooks);
router.get("/out-of-stock", ThongKeController.getOutOfStockBooks);

module.exports = router;
