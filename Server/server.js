const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Phục vụ file tĩnh (ảnh upload)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
require("./config/database");

// Import routes chính
const apiRoutes = require("./routes/index.route");

// Sử dụng routes
app.use("/api", apiRoutes);

// Route mặc định
app.get("/", (req, res) => {
  res.json({
    message: "Server Quản lý mượn sách đang hoạt động",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    api_docs: "/api",
  });
});

// Middleware xử lý lỗi 404
app.use("/*splat", (req, res) => {
  res.status(404).json({
    message: "Route không tồn tại",
    path: req.originalUrl,
  });
});

// Middleware xử lý lỗi toàn cục
app.use((error, req, res, next) => {
  console.error("Lỗi server:", error);
  res.status(500).json({
    message: "Lỗi server nội bộ",
    error: process.env.NODE_ENV === "production" ? {} : error.message,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy trên port ${PORT}`);
  console.log(`📚 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🌍 Server URL: http://localhost:${PORT}`);
});

module.exports = app;
