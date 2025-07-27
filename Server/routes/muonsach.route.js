const express = require("express");
const MuonSachController = require("../controllers/muonsach.controller");
const {
  authenticateToken,
  requireEmployee,
} = require("../middleware/auth.middleware");
const { updateOverdueStatus } = require("../middleware/overdue.middleware");
const router = express.Router();

// Áp dụng middleware cập nhật trạng thái quá hạn cho tất cả routes
router.use(updateOverdueStatus);

// Routes cho admin
router.get(
  "/",
  authenticateToken,
  requireEmployee,
  MuonSachController.getPhieuMuons
);
router.get(
  "/statistics",
  authenticateToken,
  requireEmployee,
  MuonSachController.getStatistics
);
router.get(
  "/overdue",
  authenticateToken,
  requireEmployee,
  MuonSachController.getOverdueBooks
);
router.put(
  "/update-overdue-status",
  authenticateToken,
  requireEmployee,
  MuonSachController.updateOverdueStatus
);
router.get(
  "/sach/:id",
  authenticateToken,
  requireEmployee,
  MuonSachController.getBorrowHistoryByBook
);
router.put(
  "/status/:id",
  authenticateToken,
  requireEmployee,
  MuonSachController.changeStatus
);
router.delete(
  "/:id",
  authenticateToken,
  requireEmployee,
  MuonSachController.deletePhieuMuon
);

// Routes cho độc giả
router.get("/my-borrows", authenticateToken, MuonSachController.getMyBorrows);
router.get("/my-history", authenticateToken, MuonSachController.getMyHistory);
router.post("/register", authenticateToken, MuonSachController.registerBorrow);
router.delete(
  "/cancel/:id",
  authenticateToken,
  MuonSachController.cancelBorrow
);

module.exports = router;
