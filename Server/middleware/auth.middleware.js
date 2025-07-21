const jwt = require("jsonwebtoken");
const DocGia = require("../models/DocGia.model");
const NhanVien = require("../models/NhanVien.model");
const { CHUC_VU } = require("../utils/constants");

// Middleware xác thực token
exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, truy cập bị từ chối" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};

// Middleware kiểm tra quyền admin
exports.requireAdmin = async (req, res, next) => {
  try {
    const nhanVien = await NhanVien.findById(req.user.id);

    if (!nhanVien || nhanVien.ChucVu !== CHUC_VU.ADMIN) {
      return res
        .status(403)
        .json({ message: "Chỉ admin mới có quyền truy cập" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Middleware kiểm tra quyền nhân viên
exports.requireEmployee = async (req, res, next) => {
  try {
    const nhanVien = await NhanVien.findById(req.user.id);

    if (!nhanVien) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Middleware xác thực token nhưng không bắt buộc (cho routes public nhưng có thể cần user info)
exports.optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token không hợp lệ nhưng không fail request
      req.user = null;
    }
  }

  next();
};
