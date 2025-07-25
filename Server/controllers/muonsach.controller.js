const MuonSachService = require("../services/muonsach.service");
const ApiResponse = require("../utils/response");
const { USER_ROLES } = require("../utils/constants");

/**
 * MuonSach Controller
 * Controller xử lý các request liên quan đến mượn sách
 */
class MuonSachController {
  /**
   * Lấy danh sách phiếu mượn (cho admin)
   */
  static async getPhieuMuons(req, res) {
    try {
      const result = await MuonSachService.getPhieuMuons(req.query);
      return ApiResponse.paginated(res, result.phieuMuons, result.pagination);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy lịch sử mượn sách của độc giả hiện tại
   */
  static async getMyHistory(req, res) {
    try {
      // Chỉ cho phép độc giả xem lịch sử của chính mình
      if (req.user.role !== USER_ROLES.DOC_GIA) {
        return ApiResponse.forbidden(
          res,
          "Chỉ độc giả mới có thể xem lịch sử mượn sách"
        );
      }

      const result = await MuonSachService.getLichSuMuonSach(
        req.user.id,
        req.query
      );
      return ApiResponse.paginated(res, result.lichSu, result.pagination);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy danh sách sách đang mượn của độc giả hiện tại
   */
  static async getMyBorrows(req, res) {
    try {
      // Chỉ cho phép độc giả xem sách mượn của chính mình
      if (req.user.role !== USER_ROLES.DOC_GIA) {
        return ApiResponse.forbidden(
          res,
          "Chỉ độc giả mới có thể xem danh sách sách mượn"
        );
      }

      // Convert client query parameters to server format
      const queryParams = { ...req.query };
      if (queryParams.status) {
        queryParams.trangthai = queryParams.status;
        delete queryParams.status;
      }

      const result = await MuonSachService.getLichSuMuonSach(
        req.user.id,
        queryParams
      );
      return ApiResponse.paginated(res, result.lichSu, result.pagination);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Đăng ký mượn sách (cho độc giả)
   */
  static async registerBorrow(req, res) {
    try {
      // Chỉ cho phép độc giả đăng ký mượn sách
      if (req.user.role !== USER_ROLES.DOC_GIA) {
        return ApiResponse.forbidden(res, "Chỉ độc giả mới có thể mượn sách");
      }

      const { MaSach } = req.body;

      if (!MaSach) {
        return ApiResponse.badRequest(res, "Mã sách là bắt buộc");
      }

      const phieuMuon = await MuonSachService.dangKyMuonSach(
        req.user.id,
        MaSach
      );

      return ApiResponse.created(
        res,
        phieuMuon,
        "Đăng ký mượn sách thành công"
      );
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Hủy đăng ký mượn sách (cho độc giả)
   */
  static async cancelBorrow(req, res) {
    try {
      // Chỉ cho phép độc giả hủy đăng ký của chính mình
      if (req.user.role !== USER_ROLES.DOC_GIA) {
        return ApiResponse.forbidden(
          res,
          "Bạn không có quyền thực hiện hành động này"
        );
      }

      await MuonSachService.huyDangKyMuonSach(req.user.id, req.params.id);

      return ApiResponse.success(res, null, "Hủy đăng ký mượn sách thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Thay đổi trạng thái phiếu mượn (cho admin)
   */
  static async changeStatus(req, res) {
    try {
      const { TrangThai } = req.body;

      if (!TrangThai) {
        return ApiResponse.badRequest(res, "Trạng thái là bắt buộc");
      }

      const phieuMuon = await MuonSachService.changeStatus(
        req.params.id,
        TrangThai
      );

      return ApiResponse.success(
        res,
        phieuMuon,
        "Cập nhật trạng thái thành công"
      );
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Xóa phiếu mượn (cho admin)
   */
  static async deletePhieuMuon(req, res) {
    try {
      await MuonSachService.deletePhieuMuon(req.params.id);

      return ApiResponse.success(res, null, "Xóa phiếu mượn thành công");
    } catch (error) {
      return ApiResponse.badRequest(res, error.message);
    }
  }

  /**
   * Lấy thống kê mượn sách
   */
  static async getStatistics(req, res) {
    try {
      const stats = await MuonSachService.getStatistics();
      return ApiResponse.success(
        res,
        stats,
        "Lấy thống kê mượn sách thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy danh sách sách quá hạn
   */
  static async getOverdueBooks(req, res) {
    try {
      const overdueBooks = await MuonSachService.getOverdueBooks();
      return ApiResponse.success(
        res,
        overdueBooks,
        "Lấy danh sách sách quá hạn thành công"
      );
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }

  /**
   * Lấy lịch sử mượn sách theo ID sách (cho admin)
   */
  static async getBorrowHistoryByBook(req, res) {
    try {
      const { id: sachId } = req.params;

      if (!sachId) {
        return ApiResponse.badRequest(res, "ID sách là bắt buộc");
      }

      const result = await MuonSachService.getLichSuMuonTheoSach(
        sachId,
        req.query
      );
      return ApiResponse.paginated(res, result.lichSu, result.pagination);
    } catch (error) {
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = MuonSachController;
