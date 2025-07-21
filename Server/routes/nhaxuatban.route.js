const express = require("express");
const NhaXuatBanController = require("../controllers/nhaxuatban.controller");
const {
  authenticateToken,
  requireEmployee,
} = require("../middleware/auth.middleware");
const router = express.Router();

// Routes công khai
router.get("/all", NhaXuatBanController.getAllNhaXuatBans); // Cho dropdown
router.get("/search", NhaXuatBanController.searchByName); // Tìm kiếm
router.get("/", NhaXuatBanController.getNhaXuatBans);
router.get("/:id", NhaXuatBanController.getNhaXuatBanById);
router.get("/:id/books", NhaXuatBanController.getBooksOfNXB); // Sách của NXB

// Routes cần xác thực
router.get(
  "/stats/overview",
  authenticateToken,
  requireEmployee,
  NhaXuatBanController.getNhaXuatBanStats
);
router.post(
  "/",
  authenticateToken,
  requireEmployee,
  NhaXuatBanController.createNhaXuatBan
);
router.put(
  "/:id",
  authenticateToken,
  requireEmployee,
  NhaXuatBanController.updateNhaXuatBan
);
router.delete(
  "/:id",
  authenticateToken,
  requireEmployee,
  NhaXuatBanController.deleteNhaXuatBan
);

module.exports = router;
