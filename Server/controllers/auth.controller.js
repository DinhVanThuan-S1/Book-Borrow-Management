const AuthService = require("../services/auth.service");
const ApiResponse = require("../utils/response");
const { USER_ROLES } = require("../utils/constants");

/**
 * Authentication Controller
 * Controller xử lý các request liên quan đến xác thực
 */
class AuthController {
  /**
   * Đăng ký độc giả
   */
  static async registerDocGia(req, res) {
    try {
      const docGia = await AuthService.registerDocGia(req.body);

      // Tạo token
      const token = AuthService.generateToken(docGia, USER_ROLES.DOC_GIA);

      const userData = {
        id: docGia._id,
        HoLot: docGia.HoLot,
        Ten: docGia.Ten,
        Email: docGia.Email,
        role: USER_ROLES.DOC_GIA,
        token,
      };

      return ApiResponse.created(res, userData, "Đăng ký thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Đăng nhập độc giả
   */
  static async loginDocGia(req, res) {
    try {
      const { Email, Password } = req.body;

      if (!Email || !Password) {
        return ApiResponse.badRequest(res, "Email và mật khẩu là bắt buộc");
      }

      const docGia = await AuthService.loginDocGia(Email, Password);

      // Tạo token
      const token = AuthService.generateToken(docGia, USER_ROLES.DOC_GIA);

      const userData = {
        id: docGia._id,
        HoLot: docGia.HoLot,
        Ten: docGia.Ten,
        Email: docGia.Email,
        role: USER_ROLES.DOC_GIA,
        token,
      };

      return ApiResponse.success(res, userData, "Đăng nhập thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Đăng nhập nhân viên/admin
   */
  static async loginNhanVien(req, res) {
    try {
      const { Email, Password } = req.body;

      if (!Email || !Password) {
        return ApiResponse.badRequest(res, "Email và mật khẩu là bắt buộc");
      }

      const nhanVien = await AuthService.loginNhanVien(Email, Password);

      // Tạo token
      const token = AuthService.generateToken(nhanVien, USER_ROLES.NHAN_VIEN);

      const userData = {
        id: nhanVien._id,
        HoTenNV: nhanVien.HoTenNV,
        Email: nhanVien.Email,
        ChucVu: nhanVien.ChucVu,
        role: USER_ROLES.NHAN_VIEN,
        token,
      };

      return ApiResponse.success(res, userData, "Đăng nhập thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Làm mới token
   */
  static async refreshToken(req, res) {
    try {
      const { token } = req.body;

      if (!token) {
        return ApiResponse.badRequest(res, "Token là bắt buộc");
      }

      const newToken = await AuthService.refreshToken(token);

      return ApiResponse.success(
        res,
        { token: newToken },
        "Làm mới token thành công"
      );
    } catch (error) {
      return ApiResponse.unauthorized(res, error.message);
    }
  }

  /**
   * Lấy thông tin user hiện tại
   */
  static async getMe(req, res) {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        return ApiResponse.unauthorized(res, "Không có token");
      }

      const { user, role } = await AuthService.getUserFromToken(token);

      const userData = {
        id: user._id,
        Email: user.Email,
        role,
      };

      if (role === USER_ROLES.DOC_GIA) {
        userData.HoLot = user.HoLot;
        userData.Ten = user.Ten;
        userData.NgaySinh = user.NgaySinh;
        userData.Phai = user.Phai;
        userData.DiaChi = user.DiaChi;
        userData.DienThoai = user.DienThoai;
        userData.Avatar = user.Avatar;
      } else {
        userData.HoTenNV = user.HoTenNV;
        userData.ChucVu = user.ChucVu;
        userData.DiaChi = user.DiaChi;
        userData.SoDienThoai = user.SoDienThoai;
        userData.Avatar = user.Avatar;
      }

      return ApiResponse.success(
        res,
        userData,
        "Lấy thông tin user thành công"
      );
    } catch (error) {
      return ApiResponse.unauthorized(res, error.message);
    }
  }

  /**
   * Đăng xuất
   */
  static async logout(req, res) {
    try {
      // Trong trường hợp này, việc đăng xuất chỉ là xóa token ở client
      // Có thể mở rộng để lưu blacklist token nếu cần
      return ApiResponse.success(res, null, "Đăng xuất thành công");
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Thay đổi mật khẩu
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;

      if (!currentPassword || !newPassword) {
        return ApiResponse.badRequest(
          res,
          "Mật khẩu hiện tại và mật khẩu mới là bắt buộc"
        );
      }

      if (newPassword.length < 6) {
        return ApiResponse.badRequest(
          res,
          "Mật khẩu mới phải có ít nhất 6 ký tự"
        );
      }

      let user;
      if (userRole === USER_ROLES.DOC_GIA) {
        user = await DocGia.findById(userId);
      } else {
        user = await NhanVien.findById(userId);
      }

      if (!user) {
        return ApiResponse.notFound(res, "Không tìm thấy người dùng");
      }

      // Kiểm tra mật khẩu hiện tại
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return ApiResponse.badRequest(res, "Mật khẩu hiện tại không đúng");
      }

      // Cập nhật mật khẩu mới
      user.Password = newPassword;
      await user.save();

      return ApiResponse.success(res, null, "Thay đổi mật khẩu thành công");
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = AuthController;
