const ThongKeService = require("../services/thongke.service");
const ApiResponse = require("../utils/response");

/**
 * ThongKe Controller
 * Controller xử lý các request liên quan đến thống kê
 */
class ThongKeController {
  /**
   * Lấy thống kê tổng quan
   */
  static async getOverview(req, res) {
    try {
      const stats = await ThongKeService.getOverviewStats();
      return ApiResponse.success(
        res,
        stats,
        "Lấy thống kê tổng quan thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Thống kê theo tháng
   */
  static async getMonthlyStats(req, res) {
    try {
      const { year = new Date().getFullYear() } = req.query;
      const stats = await ThongKeService.getMonthlyStats(year);
      return ApiResponse.success(
        res,
        stats,
        "Lấy thống kê theo tháng thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Thống kê theo năm
   */
  static async getYearlyStats(req, res) {
    try {
      const stats = await ThongKeService.getYearlyStats();
      return ApiResponse.success(
        res,
        stats,
        "Lấy thống kê theo năm thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Top sách được mượn nhiều nhất
   */
  static async getTopBooks(req, res) {
    try {
      const { limit = 10 } = req.query;
      const books = await ThongKeService.getTopBorrowedBooks(limit);
      return ApiResponse.success(
        res,
        books,
        "Lấy top sách được mượn nhiều nhất thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Top độc giả mượn nhiều sách nhất
   */
  static async getTopReaders(req, res) {
    try {
      const { limit = 10 } = req.query;
      const readers = await ThongKeService.getTopReaders(limit);
      return ApiResponse.success(
        res,
        readers,
        "Lấy top độc giả mượn nhiều sách nhất thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Thống kê danh mục
   */
  static async getCategoryStats(req, res) {
    try {
      const stats = await ThongKeService.getCategoryStats();
      return ApiResponse.success(
        res,
        stats,
        "Lấy thống kê danh mục thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Sách sắp hết hàng
   */
  static async getLowStockBooks(req, res) {
    try {
      const { threshold = 5 } = req.query;
      const books = await ThongKeService.getLowStockBooks(threshold);
      return ApiResponse.success(
        res,
        books,
        "Lấy danh sách sách sắp hết hàng thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Sách hết hàng
   */
  static async getOutOfStockBooks(req, res) {
    try {
      const books = await ThongKeService.getOutOfStockBooks();
      return ApiResponse.success(
        res,
        books,
        "Lấy danh sách sách hết hàng thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Dashboard stats tổng hợp
   */
  static async getDashboard(req, res) {
    try {
      const stats = await ThongKeService.getDashboardStats();
      return ApiResponse.success(
        res,
        stats,
        "Lấy dữ liệu dashboard thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = ThongKeController;
