const express = require("express");
const AuthController = require("../controllers/auth.controller");
const { authenticateToken } = require("../middleware/auth.middleware");
const router = express.Router();

// Routes công khai
router.post("/register/docgia", AuthController.registerDocGia);
router.post("/login/docgia", AuthController.loginDocGia);
router.post("/login/nhanvien", AuthController.loginNhanVien);
router.post("/refresh-token", AuthController.refreshToken);

// Routes cần xác thực
router.get("/me", AuthController.getMe);
router.post("/logout", authenticateToken, AuthController.logout);
router.put(
  "/change-password",
  authenticateToken,
  AuthController.changePassword
);

module.exports = router;
