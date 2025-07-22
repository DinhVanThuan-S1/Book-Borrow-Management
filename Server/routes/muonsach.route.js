const express = require("express");
const MuonSachController = require("../controllers/muonsach.controller");
const {
  authenticateToken,
  requireEmployee,
} = require("../middleware/auth.middleware");
const router = express.Router();

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
router.get("/my-history", authenticateToken, MuonSachController.getMyHistory);
router.post("/register", authenticateToken, MuonSachController.registerBorrow);
router.delete(
  "/cancel/:id",
  authenticateToken,
  MuonSachController.cancelBorrow
);

module.exports = router;
