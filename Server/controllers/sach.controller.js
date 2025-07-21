const SachService = require("../services/sach.service");
const UploadService = require("../services/upload.service");
const ApiResponse = require("../utils/response");

/**
 * Sach Controller
 * Controller xử lý các request liên quan đến sách
 */
class SachController {
  /**
   * Lấy danh sách sách
   */
  static async getSaches(req, res) {
    try {
      const result = await SachService.getSaches(req.query);
      return ApiResponse.paginated(res, result.saches, result.pagination);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy sách theo ID
   */
  static async getSachById(req, res) {
    try {
      const sach = await SachService.getSachById(req.params.id);
      return ApiResponse.success(res, sach, "Lấy thông tin sách thành công");
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  /**
   * Tạo sách mới
   */
  static async createSach(req, res) {
    try {
      // Xử lý upload ảnh
      let biaSachPath = "";
      if (req.file) {
        biaSachPath = `/uploads/books/${req.file.filename}`;
      }

      const sach = await SachService.createSach(
        req.body,
        req.user.id,
        biaSachPath
      );

      return ApiResponse.created(res, sach, "Tạo sách thành công");
    } catch (error) {
      // Xóa file nếu có lỗi
      if (req.file) {
        UploadService.deleteFile(req.file.path);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Cập nhật sách
   */
  static async updateSach(req, res) {
    try {
      let biaSachPath = null;
      if (req.file) {
        biaSachPath = `/uploads/books/${req.file.filename}`;
      }

      const result = await SachService.updateSach(
        req.params.id,
        req.body,
        biaSachPath
      );

      // Xóa ảnh cũ nếu có ảnh mới
      if (req.file && result.oldImagePath) {
        UploadService.deleteFileByPath(result.oldImagePath);
      }

      return ApiResponse.success(res, result.sach, "Cập nhật sách thành công");
    } catch (error) {
      // Xóa file mới nếu có lỗi
      if (req.file) {
        UploadService.deleteFile(req.file.path);
      }
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Xóa sách
   */
  static async deleteSach(req, res) {
    try {
      await SachService.deleteSach(req.params.id);
      return ApiResponse.success(res, null, "Xóa sách thành công");
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  /**
   * Lấy sách phổ biến
   */
  static async getPopularBooks(req, res) {
    try {
      const { limit = 10 } = req.query;
      const popularBooks = await SachService.getPopularBooks(limit);
      return ApiResponse.success(
        res,
        popularBooks,
        "Lấy sách phổ biến thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = SachController;
