const express = require("express");
const router = express.Router();

// Import các route modules
const authRoutes = require("./auth.route");
const danhmucRoutes = require("./danhmuc.route");
const sachRoutes = require("./sach.route");
const docgiaRoutes = require("./docgia.route");
const nhanvienRoutes = require("./nhanvien.route");
const muonsachRoutes = require("./muonsach.route");
const nhaxuatbanRoutes = require("./nhaxuatban.route");
const thongkeRoutes = require("./thongke.route");

// Sử dụng các routes
router.use("/auth", authRoutes);
router.use("/danhmuc", danhmucRoutes);
router.use("/sach", sachRoutes);
router.use("/docgia", docgiaRoutes);
router.use("/nhanvien", nhanvienRoutes);
router.use("/muonsach", muonsachRoutes);
router.use("/nhaxuatban", nhaxuatbanRoutes);
router.use("/thongke", thongkeRoutes);

// Route mặc định cho API -> backend API
router.get("/", (req, res) => {
  res.json({
    message: "Chào mừng đến với API Quản lý mượn sách",
    version: "1.0.0",
    author: "DinhVanThuan-S1",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth - Xác thực người dùng",
      danhmuc: "/api/danhmuc - Quản lý danh mục sách",
      sach: "/api/sach - Quản lý sách",
      docgia: "/api/docgia - Quản lý độc giả",
      nhanvien: "/api/nhanvien - Quản lý nhân viên",
      muonsach: "/api/muonsach - Quản lý mượn sách",
      nhaxuatban: "/api/nhaxuatban - Quản lý nhà xuất bản",
      thongke: "/api/thongke - Thống kê hệ thống",
    },
  });
});

// Route xử lý 404 cho API
router.use("/*splat", (req, res) => {
  res.status(404).json({
    message: "Endpoint không tồn tại",
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
