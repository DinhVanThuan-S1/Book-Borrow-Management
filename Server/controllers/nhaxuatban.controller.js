const NhaXuatBanService = require("../services/nhaxuatban.service");
const ApiResponse = require("../utils/response");

/**
 * NhaXuatBan Controller
 * Controller xử lý các request liên quan đến nhà xuất bản
 */
class NhaXuatBanController {
  /**
   * Lấy danh sách nhà xuất bản
   */
  static async getNhaXuatBans(req, res) {
    try {
      const result = await NhaXuatBanService.getNhaXuatBans(req.query);
      return ApiResponse.paginated(res, result.nhaxuatbans, result.pagination);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy tất cả nhà xuất bản (cho dropdown)
   */
  static async getAllNhaXuatBans(req, res) {
    try {
      const nhaxuatbans = await NhaXuatBanService.getAllNhaXuatBans();
      return ApiResponse.success(
        res,
        nhaxuatbans,
        "Lấy danh sách nhà xuất bản thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy nhà xuất bản theo ID
   */
  static async getNhaXuatBanById(req, res) {
    try {
      const nhaxuatban = await NhaXuatBanService.getNhaXuatBanById(
        req.params.id
      );
      return ApiResponse.success(
        res,
        nhaxuatban,
        "Lấy thông tin nhà xuất bản thành công"
      );
    } catch (error) {
      return ApiResponse.notFound(res, error.message);
    }
  }

  /**
   * Tạo nhà xuất bản mới
   */
  static async createNhaXuatBan(req, res) {
    try {
      const nhaxuatban = await NhaXuatBanService.createNhaXuatBan(req.body);
      return ApiResponse.created(
        res,
        nhaxuatban,
        "Tạo nhà xuất bản thành công"
      );
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Cập nhật nhà xuất bản
   */
  static async updateNhaXuatBan(req, res) {
    try {
      const nhaxuatban = await NhaXuatBanService.updateNhaXuatBan(
        req.params.id,
        req.body
      );
      return ApiResponse.success(
        res,
        nhaxuatban,
        "Cập nhật nhà xuất bản thành công"
      );
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Xóa nhà xuất bản
   */
  static async deleteNhaXuatBan(req, res) {
    try {
      await NhaXuatBanService.deleteNhaXuatBan(req.params.id);
      return ApiResponse.success(res, null, "Xóa nhà xuất bản thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Thống kê nhà xuất bản
   */
  static async getNhaXuatBanStats(req, res) {
    try {
      const stats = await NhaXuatBanService.getNhaXuatBanStats();
      return ApiResponse.success(
        res,
        stats,
        "Lấy thống kê nhà xuất bản thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Tìm kiếm nhà xuất bản theo tên
   */
  static async searchByName(req, res) {
    try {
      const { name } = req.query;

      if (!name) {
        return ApiResponse.badRequest(res, "Tên nhà xuất bản là bắt buộc");
      }

      const nhaxuatbans = await NhaXuatBanService.searchByName(name);
      return ApiResponse.success(
        res,
        nhaxuatbans,
        "Tìm kiếm nhà xuất bản thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy sách của nhà xuất bản
   */
  static async getBooksOfNXB(req, res) {
    try {
      const result = await NhaXuatBanService.getBooksOfNXB(
        req.params.id,
        req.query
      );
      return ApiResponse.paginated(
        res,
        result.saches,
        result.pagination,
        "Lấy sách của nhà xuất bản thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = NhaXuatBanController;
