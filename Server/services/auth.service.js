const jwt = require("jsonwebtoken");
const DocGia = require("../models/DocGia.model");
const NhanVien = require("../models/NhanVien.model");
const { USER_ROLES } = require("../utils/constants");

/**
 * Authentication Service
 * Service xử lý logic xác thực
 */
class AuthService {
  /**
   * Đăng ký độc giả mới
   */
  static async registerDocGia(userData) {
    const { HoLot, Ten, Email, Password, NgaySinh, Phai, DiaChi, DienThoai } =
      userData;

    // Kiểm tra email đã tồn tại
    const existingDocGia = await DocGia.findOne({ Email, deleted: false });
    if (existingDocGia) {
      throw new Error("Email đã được sử dụng");
    }

    // Tạo độc giả mới
    const docGia = new DocGia({
      HoLot,
      Ten,
      Email,
      Password,
      NgaySinh: new Date(NgaySinh),
      Phai,
      DiaChi,
      DienThoai,
    });

    await docGia.save();
    return docGia;
  }

  /**
   * Đăng nhập độc giả
   */
  static async loginDocGia(email, password) {
    // Tìm độc giả
    const docGia = await DocGia.findOne({ Email: email, deleted: false });
    if (!docGia) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    // Kiểm tra mật khẩu
    const isMatch = await docGia.comparePassword(password);
    if (!isMatch) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    return docGia;
  }

  /**
   * Đăng nhập nhân viên/admin
   */
  static async loginNhanVien(email, password) {
    // Tìm nhân viên
    const nhanVien = await NhanVien.findOne({ Email: email, deleted: false });
    if (!nhanVien) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    // Kiểm tra mật khẩu
    const isMatch = await nhanVien.comparePassword(password);
    if (!isMatch) {
      throw new Error("Email hoặc mật khẩu không đúng");
    }

    return nhanVien;
  }

  /**
   * Tạo JWT token
   */
  static generateToken(user, role) {
    const payload = {
      id: user._id,
      role,
      email: user.Email,
    };

    // Thêm thông tin chức vụ cho nhân viên
    if (role === USER_ROLES.NHAN_VIEN) {
      payload.chucvu = user.ChucVu;
    }

    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
  }

  /**
   * Xác thực token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Token không hợp lệ");
    }
  }

  /**
   * Làm mới token
   */
  static async refreshToken(oldToken) {
    const decoded = this.verifyToken(oldToken);

    let user;
    if (decoded.role === USER_ROLES.DOC_GIA) {
      user = await DocGia.findById(decoded.id);
    } else {
      user = await NhanVien.findById(decoded.id);
    }

    if (!user || user.deleted) {
      throw new Error("Người dùng không tồn tại");
    }

    return this.generateToken(user, decoded.role);
  }

  /**
   * Lấy thông tin user từ token
   */
  static async getUserFromToken(token) {
    const decoded = this.verifyToken(token);

    let user;
    if (decoded.role === USER_ROLES.DOC_GIA) {
      user = await DocGia.findById(decoded.id).select("-Password");
    } else {
      user = await NhanVien.findById(decoded.id).select("-Password");
    }

    if (!user || user.deleted) {
      throw new Error("Người dùng không tồn tại");
    }

    return { user, role: decoded.role };
  }
}

module.exports = AuthService;
