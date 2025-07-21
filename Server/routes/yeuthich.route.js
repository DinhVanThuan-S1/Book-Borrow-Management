const express = require("express");
const YeuThichController = require("../controllers/yeuthich.controller");
const {
  authenticateToken,
  requireEmployee,
} = require("../middleware/auth.middleware");
const router = express.Router();

// Routes công khai (có thể không cần đăng nhập)
router.get("/my-favorites", YeuThichController.getMyFavorites);
router.get("/count", YeuThichController.getFavoriteCount);
router.get("/check/:sachId", YeuThichController.checkIsFavorite);

// Routes cho độc giả đã đăng nhập
router.post(
  "/add/:sachId",
  authenticateToken,
  YeuThichController.addToFavorites
);
router.delete(
  "/remove/:sachId",
  authenticateToken,
  YeuThichController.removeFromFavorites
);
router.delete(
  "/clear",
  authenticateToken,
  YeuThichController.clearAllFavorites
);
router.post(
  "/add-multiple",
  authenticateToken,
  YeuThichController.addMultipleToFavorites
);
router.post("/sync-local", authenticateToken, YeuThichController.syncFromLocal);

// Routes cho admin
router.get(
  "/stats",
  authenticateToken,
  requireEmployee,
  YeuThichController.getFavoriteStats
);

module.exports = router;
