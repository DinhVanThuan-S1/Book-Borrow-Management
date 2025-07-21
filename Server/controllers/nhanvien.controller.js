const NhanVienService = require("../services/nhanvien.service");
const UploadService = require("../services/upload.service");
const ApiResponse = require("../utils/response");
const { CHUC_VU } = require("../utils/constants");

/**
 * NhanVien Controller
 * Controller xử lý các request liên quan đến nhân viên
 */
class NhanVienController {
  /**
   * Lấy danh sách nhân viên
   */
  static async getNhanViens(req, res) {
    try {
      const result = await NhanVienService.getNhanViens(req.query);
      return ApiResponse.paginated(res, result.nhanviens, result.pagination);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy nhân viên theo ID
   */
  static async getNhanVienById(req, res) {
    try {
      const nhanvien = await NhanVienService.getNhanVienById(req.params.id);
      return ApiResponse.success(
        res,
        nhanvien,
        "Lấy thông tin nhân viên thành công"
      );
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  /**
   * Tạo nhân viên mới (chỉ admin)
   */
  static async createNhanVien(req, res) {
    try {
      const nhanvien = await NhanVienService.createNhanVien(req.body);
      return ApiResponse.created(res, nhanvien, "Tạo nhân viên thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Cập nhật thông tin nhân viên
   */
  static async updateNhanVien(req, res) {
    try {
      // Kiểm tra xem có phải chính chủ tài khoản không
      const isOwner =
        req.user.role === "nhanvien" && req.user.id === req.params.id;

      // Nếu không phải admin và không phải chính chủ thì từ chối
      if (!isOwner && req.user.chucvu !== CHUC_VU.ADMIN) {
        return ApiResponse.forbidden(
          res,
          "Bạn không có quyền cập nhật thông tin này"
        );
      }

      const nhanvien = await NhanVienService.updateNhanVien(
        req.params.id,
        req.body,
        isOwner
      );
      return ApiResponse.success(
        res,
        nhanvien,
        "Cập nhật thông tin nhân viên thành công"
      );
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Cập nhật avatar
   */
  static async updateAvatar(req, res) {
    try {
      if (!req.file) {
        return ApiResponse.badRequest(res, "Vui lòng chọn file ảnh");
      }

      // Kiểm tra quyền (chỉ chính chủ hoặc admin mới được cập nhật avatar)
      const isOwner =
        req.user.role === "nhanvien" && req.user.id === req.params.id;

      if (!isOwner && req.user.chucvu !== CHUC_VU.ADMIN) {
        UploadService.deleteFile(req.file.path);
        return ApiResponse.forbidden(
          res,
          "Bạn không có quyền cập nhật avatar này"
        );
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      const nhanvien = await NhanVienService.updateAvatar(
        req.params.id,
        avatarPath
      );

      return ApiResponse.success(res, nhanvien, "Cập nhật avatar thành công");
    } catch (error) {
      if (req.file) {
        UploadService.deleteFile(req.file.path);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Xóa nhân viên (chỉ admin)
   */
  static async deleteNhanVien(req, res) {
    try {
      await NhanVienService.deleteNhanVien(req.params.id);
      return ApiResponse.success(res, null, "Xóa nhân viên thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Thay đổi chức vụ (chỉ admin)
   */
  static async changeRole(req, res) {
    try {
      const { ChucVu } = req.body;

      if (!ChucVu) {
        return ApiResponse.badRequest(res, "Chức vụ là bắt buộc");
      }

      const nhanvien = await NhanVienService.changeRole(req.params.id, ChucVu);
      return ApiResponse.success(res, nhanvien, "Thay đổi chức vụ thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Lấy thống kê nhân viên
   */
  static async getNhanVienStats(req, res) {
    try {
      const stats = await NhanVienService.getNhanVienStats();
      return ApiResponse.success(
        res,
        stats,
        "Lấy thống kê nhân viên thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Tìm kiếm nhân viên theo email
   */
  static async findByEmail(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return ApiResponse.badRequest(res, "Email là bắt buộc");
      }

      const nhanvien = await NhanVienService.findByEmail(email);

      if (!nhanvien) {
        return ApiResponse.notFound(
          res,
          "Không tìm thấy nhân viên với email này"
        );
      }

      return ApiResponse.success(res, nhanvien, "Tìm thấy nhân viên");
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy thông tin profile của nhân viên hiện tại
   */
  static async getMyProfile(req, res) {
    try {
      if (req.user.role !== "nhanvien") {
        return ApiResponse.forbidden(
          res,
          "Chỉ nhân viên mới có thể xem profile"
        );
      }

      const nhanvien = await NhanVienService.getNhanVienById(req.user.id);
      return ApiResponse.success(
        res,
        nhanvien,
        "Lấy thông tin profile thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = NhanVienController;
