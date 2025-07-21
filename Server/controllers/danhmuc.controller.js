const DanhMucService = require("../services/danhmuc.service");
const ApiResponse = require("../utils/response");

/**
 * DanhMuc Controller
 * Controller xử lý các request liên quan đến danh mục
 */
class DanhMucController {
  /**
   * Lấy danh sách danh mục
   */
  static async getDanhMucs(req, res) {
    try {
      const result = await DanhMucService.getDanhMucs(req.query);
      return ApiResponse.paginated(res, result.danhmucs, result.pagination);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy tất cả danh mục (cho dropdown)
   */
  static async getAllDanhMucs(req, res) {
    try {
      const danhmucs = await DanhMucService.getAllDanhMucs();
      return ApiResponse.success(
        res,
        danhmucs,
        "Lấy danh sách danh mục thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy danh mục theo ID
   */
  static async getDanhMucById(req, res) {
    try {
      const danhmuc = await DanhMucService.getDanhMucById(req.params.id);
      return ApiResponse.success(
        res,
        danhmuc,
        "Lấy thông tin danh mục thành công"
      );
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  /**
   * Tạo danh mục mới
   */
  static async createDanhMuc(req, res) {
    try {
      const danhmuc = await DanhMucService.createDanhMuc(req.body, req.user.id);
      return ApiResponse.created(res, danhmuc, "Tạo danh mục thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Cập nhật danh mục
   */
  static async updateDanhMuc(req, res) {
    try {
      const danhmuc = await DanhMucService.updateDanhMuc(
        req.params.id,
        req.body
      );
      return ApiResponse.success(res, danhmuc, "Cập nhật danh mục thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Xóa danh mục
   */
  static async deleteDanhMuc(req, res) {
    try {
      await DanhMucService.deleteDanhMuc(req.params.id);
      return ApiResponse.success(res, null, "Xóa danh mục thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Thống kê danh mục
   */
  static async getDanhMucStats(req, res) {
    try {
      const stats = await DanhMucService.getDanhMucStats();
      return ApiResponse.success(
        res,
        stats,
        "Lấy thống kê danh mục thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = DanhMucController;
