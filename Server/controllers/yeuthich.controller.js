const YeuThichService = require("../services/yeuthich.service");
const ApiResponse = require("../utils/response");
const { USER_ROLES } = require("../utils/constants");

/**
 * YeuThich Controller
 * Controller xử lý các request liên quan đến yêu thích
 */
class YeuThichController {
  /**
   * Lấy danh sách sách yêu thích của user hiện tại
   */
  static async getMyFavorites(req, res) {
    try {
      let docGiaId = null;

      // Chỉ lấy ID nếu là độc giả đã đăng nhập
      if (req.user && req.user.role === USER_ROLES.DOC_GIA) {
        docGiaId = req.user.id;
      }

      const result = await YeuThichService.getFavorites(docGiaId, req.query);

      return ApiResponse.paginated(
        res,
        result.DanhSachSach,
        result.pagination,
        "Lấy danh sách yêu thích thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Thêm sách vào yêu thích
   */
  static async addToFavorites(req, res) {
    try {
      // Chỉ độc giả mới có thể thêm yêu thích
      if (!req.user || req.user.role !== USER_ROLES.DOC_GIA) {
        return ApiResponse.forbidden(
          res,
          "Chỉ độc giả mới có thể thêm sách yêu thích"
        );
      }

      const { sachId } = req.params;

      if (!sachId) {
        return ApiResponse.badRequest(res, "ID sách là bắt buộc");
      }

      const result = await YeuThichService.addToFavorites(req.user.id, sachId);

      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Xóa sách khỏi yêu thích
   */
  static async removeFromFavorites(req, res) {
    try {
      // Chỉ độc giả mới có thể xóa yêu thích
      if (!req.user || req.user.role !== USER_ROLES.DOC_GIA) {
        return ApiResponse.forbidden(
          res,
          "Chỉ độc giả mới có thể xóa sách yêu thích"
        );
      }

      const { sachId } = req.params;

      if (!sachId) {
        return ApiResponse.badRequest(res, "ID sách là bắt buộc");
      }

      const result = await YeuThichService.removeFromFavorites(
        req.user.id,
        sachId
      );

      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Kiểm tra sách có trong yêu thích không
   */
  static async checkIsFavorite(req, res) {
    try {
      let docGiaId = null;

      if (req.user && req.user.role === USER_ROLES.DOC_GIA) {
        docGiaId = req.user.id;
      }

      const { sachId } = req.params;

      if (!sachId) {
        return ApiResponse.badRequest(res, "ID sách là bắt buộc");
      }

      const result = await YeuThichService.checkIsFavorite(docGiaId, sachId);

      return ApiResponse.success(res, result, "Kiểm tra yêu thích thành công");
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Xóa tất cả yêu thích
   */
  static async clearAllFavorites(req, res) {
    try {
      if (!req.user || req.user.role !== USER_ROLES.DOC_GIA) {
        return ApiResponse.forbidden(
          res,
          "Chỉ độc giả mới có thể xóa danh sách yêu thích"
        );
      }

      const result = await YeuThichService.clearAllFavorites(req.user.id);

      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Lấy số lượng sách yêu thích
   */
  static async getFavoriteCount(req, res) {
    try {
      let docGiaId = null;

      if (req.user && req.user.role === USER_ROLES.DOC_GIA) {
        docGiaId = req.user.id;
      }

      const result = await YeuThichService.getFavoriteCount(docGiaId);

      return ApiResponse.success(
        res,
        result,
        "Lấy số lượng yêu thích thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Thêm nhiều sách vào yêu thích
   */
  static async addMultipleToFavorites(req, res) {
    try {
      if (!req.user || req.user.role !== USER_ROLES.DOC_GIA) {
        return ApiResponse.forbidden(
          res,
          "Chỉ độc giả mới có thể thêm sách yêu thích"
        );
      }

      const { sachIds } = req.body;

      if (!sachIds || !Array.isArray(sachIds)) {
        return ApiResponse.badRequest(res, "Danh sách ID sách là bắt buộc");
      }

      const result = await YeuThichService.addMultipleToFavorites(
        req.user.id,
        sachIds
      );

      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Lấy thống kê yêu thích (admin)
   */
  static async getFavoriteStats(req, res) {
    try {
      const stats = await YeuThichService.getFavoriteStats();
      return ApiResponse.success(
        res,
        stats,
        "Lấy thống kê yêu thích thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Đồng bộ yêu thích từ localStorage
   */
  static async syncFromLocal(req, res) {
    try {
      if (!req.user || req.user.role !== USER_ROLES.DOC_GIA) {
        return ApiResponse.forbidden(
          res,
          "Chỉ độc giả mới có thể đồng bộ yêu thích"
        );
      }

      const { localFavorites } = req.body;

      if (!localFavorites || !Array.isArray(localFavorites)) {
        return ApiResponse.badRequest(res, "Dữ liệu localStorage không hợp lệ");
      }

      const result = await YeuThichService.syncFavoritesFromLocal(
        req.user.id,
        localFavorites
      );

      return ApiResponse.success(res, result, result.message);
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }
}

module.exports = YeuThichController;
