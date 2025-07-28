const DocGiaService = require("../services/docgia.service");
const UploadService = require("../services/upload.service");
const ApiResponse = require("../utils/response");

/**
 * DocGia Controller
 * Controller xử lý các request liên quan đến độc giả
 */
class DocGiaController {
  /**
   * Lấy danh sách độc giả
   */
  static async getDocGias(req, res) {
    try {
      const result = await DocGiaService.getDocGias(req.query);
      return ApiResponse.paginated(res, result.docgias, result.pagination);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy độc giả theo ID
   */
  static async getDocGiaById(req, res) {
    try {
      const docgia = await DocGiaService.getDocGiaById(req.params.id);
      return ApiResponse.success(
        res,
        docgia,
        "Lấy thông tin độc giả thành công"
      );
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  /**
   * Tạo độc giả mới (admin)
   */
  static async createDocGia(req, res) {
    try {
      const docgia = await DocGiaService.createDocGia(req.body);
      return ApiResponse.created(res, docgia, "Tạo độc giả thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Cập nhật thông tin độc giả
   */
  static async updateDocGia(req, res) {
    try {
      // Kiểm tra xem có phải chính chủ tài khoản không
      const isOwner =
        req.user.role === "docgia" && req.user.id === req.params.id;

      // Nếu không phải admin và không phải chính chủ thì từ chối
      if (!isOwner && req.user.role !== "nhanvien") {
        return ApiResponse.forbidden(
          res,
          "Bạn không có quyền cập nhật thông tin này"
        );
      }

      const docgia = await DocGiaService.updateDocGia(
        req.params.id,
        req.body,
        isOwner
      );
      return ApiResponse.success(
        res,
        docgia,
        "Cập nhật thông tin độc giả thành công"
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

      // Kiểm tra quyền (chỉ chính chủ mới được cập nhật avatar)
      const isOwner =
        req.user.role === "docgia" && req.user.id === req.params.id;

      if (!isOwner && req.user.role !== "nhanvien") {
        UploadService.deleteFile(req.file.path);
        return ApiResponse.forbidden(
          res,
          "Bạn không có quyền cập nhật avatar này"
        );
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      const docgia = await DocGiaService.updateAvatar(
        req.params.id,
        avatarPath
      );

      return ApiResponse.success(res, docgia, "Cập nhật avatar thành công");
    } catch (error) {
      if (req.file) {
        UploadService.deleteFile(req.file.path);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Xóa độc giả
   */
  static async deleteDocGia(req, res) {
    try {
      await DocGiaService.deleteDocGia(req.params.id);
      return ApiResponse.success(res, null, "Xóa độc giả thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Lấy thống kê độc giả
   */
  static async getDocGiaStats(req, res) {
    try {
      const stats = await DocGiaService.getDocGiaStats();
      return ApiResponse.success(res, stats, "Lấy thống kê độc giả thành công");
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Tìm kiếm độc giả theo email
   */
  static async findByEmail(req, res) {
    try {
      const { email } = req.query;

      if (!email) {
        return ApiResponse.badRequest(res, "Email là bắt buộc");
      }

      const docgia = await DocGiaService.findByEmail(email);

      if (!docgia) {
        return ApiResponse.notFound(
          res,
          "Không tìm thấy độc giả với email này"
        );
      }

      return ApiResponse.success(res, docgia, "Tìm thấy độc giả");
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy lịch sử hoạt động của độc giả
   */
  static async getDocGiaActivity(req, res) {
    try {
      const activity = await DocGiaService.getDocGiaActivity(req.params.id);
      return ApiResponse.success(
        res,
        activity,
        "Lấy lịch sử hoạt động thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy thông tin profile của độc giả hiện tại
   */
  static async getMyProfile(req, res) {
    try {
      if (req.user.role !== "docgia") {
        return ApiResponse.forbidden(res, "Chỉ độc giả mới có thể xem profile");
      }

      const docgia = await DocGiaService.getDocGiaById(req.user.id);
      return ApiResponse.success(
        res,
        docgia,
        "Lấy thông tin profile thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy thống kê hoạt động của độc giả
   */
  static async getDocGiaActivity(req, res) {
    try {
      const activity = await DocGiaService.getDocGiaActivity(req.params.id);
      return ApiResponse.success(
        res,
        activity,
        "Lấy thống kê hoạt động thành công"
      );
    } catch (error) {
      console.error("Error in getDocGiaActivity:", error);
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = DocGiaController;
