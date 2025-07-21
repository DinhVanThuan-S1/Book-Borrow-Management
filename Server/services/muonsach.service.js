const TheoDoiMuonSach = require("../models/TheoDoiMuonSach.model");
const Sach = require("../models/Sach.model");
const SachService = require("./sach.service");
const {
  PAGINATION,
  MUON_SACH_STATUS,
  MAX_BOOKS_PER_USER,
  USER_ROLES,
} = require("../utils/constants");

/**
 * MuonSach Service
 * Service xử lý logic nghiệp vụ cho mượn sách
 */
class MuonSachService {
  /**
   * Lấy danh sách phiếu mượn (cho admin)
   */
  static async getPhieuMuons(queryParams) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      search = "",
      sort = "newest",
      trangthai = "",
    } = queryParams;

    const query = { deleted: false };

    // Lọc theo trạng thái
    if (trangthai && Object.values(MUON_SACH_STATUS).includes(trangthai)) {
      query.TrangThai = trangthai;
    }

    // Sắp xếp
    let sortOption = {};
    switch (sort) {
      case "newest":
        sortOption = { createdAt: -1 };
        break;
      case "oldest":
        sortOption = { createdAt: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    let phieuMuons = await TheoDoiMuonSach.find(query)
      .populate("MaDocGia", "HoLot Ten Email DienThoai")
      .populate("MaSach", "TenSach TacGia BiaSach DonGia")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Tìm kiếm theo tên độc giả hoặc tên sách
    if (search) {
      phieuMuons = phieuMuons.filter((phieu) => {
        const tenDocGia =
          `${phieu.MaDocGia.HoLot} ${phieu.MaDocGia.Ten}`.toLowerCase();
        const tenSach = phieu.MaSach.TenSach.toLowerCase();
        const searchTerm = search.toLowerCase();

        return tenDocGia.includes(searchTerm) || tenSach.includes(searchTerm);
      });
    }

    const total = await TheoDoiMuonSach.countDocuments(query);

    return {
      phieuMuons,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    };
  }

  /**
   * Lấy lịch sử mượn sách của độc giả
   */
  static async getLichSuMuonSach(docGiaId, queryParams) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      trangthai = "",
    } = queryParams;

    const query = {
      MaDocGia: docGiaId,
      deleted: false,
    };

    // Lọc theo trạng thái
    if (trangthai && Object.values(MUON_SACH_STATUS).includes(trangthai)) {
      query.TrangThai = trangthai;
    }

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    const [lichSu, total] = await Promise.all([
      TheoDoiMuonSach.find(query)
        .populate("MaSach", "TenSach TacGia BiaSach DonGia")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      TheoDoiMuonSach.countDocuments(query),
    ]);

    return {
      lichSu,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    };
  }

  /**
   * Đăng ký mượn sách
   */
  static async dangKyMuonSach(docGiaId, sachId) {
    // Kiểm tra sách có tồn tại và còn trong kho
    const sach = await SachService.checkBookAvailability(sachId);

    // Kiểm tra độc giả đã mượn sách này chưa (và chưa trả)
    const daMuon = await TheoDoiMuonSach.findOne({
      MaDocGia: docGiaId,
      MaSach: sachId,
      TrangThai: { $in: [MUON_SACH_STATUS.DA_DUYET, MUON_SACH_STATUS.DA_MUON] },
      deleted: false,
    });

    if (daMuon) {
      throw new Error("Bạn đã mượn sách này rồi");
    }

    // Kiểm tra độc giả đã mượn quá giới hạn chưa
    const soSachDangMuon = await TheoDoiMuonSach.countDocuments({
      MaDocGia: docGiaId,
      TrangThai: { $in: [MUON_SACH_STATUS.DA_DUYET, MUON_SACH_STATUS.DA_MUON] },
      deleted: false,
    });

    if (soSachDangMuon >= MAX_BOOKS_PER_USER) {
      throw new Error(
        `Bạn đã mượn tối đa ${MAX_BOOKS_PER_USER} quyển sách. Vui lòng trả sách trước khi mượn tiếp.`
      );
    }

    // Tạo phiếu mượn mới
    const phieuMuon = new TheoDoiMuonSach({
      MaDocGia: docGiaId,
      MaSach: sachId,
      TrangThai: MUON_SACH_STATUS.DA_DUYET, // Tự động duyệt nếu đủ điều kiện
    });

    await phieuMuon.save();

    // Giảm số lượng sách trong kho
    await SachService.updateBookQuantity(sachId, -1);

    await phieuMuon.populate("MaSach", "TenSach TacGia BiaSach DonGia");

    return phieuMuon;
  }

  /**
   * Hủy đăng ký mượn sách
   */
  static async huyDangKyMuonSach(docGiaId, phieuMuonId) {
    const phieuMuon = await TheoDoiMuonSach.findOne({
      _id: phieuMuonId,
      MaDocGia: docGiaId,
      TrangThai: MUON_SACH_STATUS.DA_DUYET, // Chỉ cho phép hủy khi đã duyệt
      deleted: false,
    });

    if (!phieuMuon) {
      throw new Error("Không tìm thấy phiếu mượn hoặc không thể hủy");
    }

    // Xóa mềm phiếu mượn
    phieuMuon.deleted = true;
    await phieuMuon.save();

    // Tăng lại số lượng sách trong kho
    await SachService.updateBookQuantity(phieuMuon.MaSach, 1);

    return phieuMuon;
  }

  /**
   * Thay đổi trạng thái phiếu mượn (cho admin)
   */
  static async changeStatus(phieuMuonId, newStatus) {
    if (!Object.values(MUON_SACH_STATUS).includes(newStatus)) {
      throw new Error("Trạng thái không hợp lệ");
    }

    const phieuMuon = await TheoDoiMuonSach.findOne({
      _id: phieuMuonId,
      deleted: false,
    }).populate("MaSach");

    if (!phieuMuon) {
      throw new Error("Không tìm thấy phiếu mượn");
    }

    const oldStatus = phieuMuon.TrangThai;

    // Xử lý logic thay đổi số lượng sách
    await this.handleStatusChange(phieuMuon, oldStatus, newStatus);

    // Cập nhật trạng thái
    phieuMuon.TrangThai = newStatus;
    await phieuMuon.save();

    await phieuMuon.populate("MaDocGia", "HoLot Ten Email");

    return phieuMuon;
  }

  /**
   * Xóa phiếu mượn (cho admin)
   */
  static async deletePhieuMuon(phieuMuonId) {
    const phieuMuon = await TheoDoiMuonSach.findOne({
      _id: phieuMuonId,
      deleted: false,
    });

    if (!phieuMuon) {
      throw new Error("Không tìm thấy phiếu mượn");
    }

    // Nếu phiếu mượn đang ở trạng thái đã duyệt hoặc đã mượn, cần tăng lại số lượng sách
    if (
      [MUON_SACH_STATUS.DA_DUYET, MUON_SACH_STATUS.DA_MUON].includes(
        phieuMuon.TrangThai
      )
    ) {
      await SachService.updateBookQuantity(phieuMuon.MaSach, 1);
    }

    // Xóa mềm
    phieuMuon.deleted = true;
    await phieuMuon.save();

    return phieuMuon;
  }

  /**
   * Xử lý thay đổi trạng thái và cập nhật số lượng sách
   */
  static async handleStatusChange(phieuMuon, oldStatus, newStatus) {
    const sachId = phieuMuon.MaSach._id;

    if (
      oldStatus === MUON_SACH_STATUS.DA_MUON &&
      newStatus === MUON_SACH_STATUS.DA_TRA
    ) {
      // Trả sách: tăng số lượng
      await SachService.updateBookQuantity(sachId, 1);
    } else if (
      oldStatus === MUON_SACH_STATUS.TU_CHOI &&
      newStatus === MUON_SACH_STATUS.DA_DUYET
    ) {
      // Duyệt lại sau khi từ chối: giảm số lượng
      await SachService.updateBookQuantity(sachId, -1);
    } else if (
      oldStatus === MUON_SACH_STATUS.DA_DUYET &&
      newStatus === MUON_SACH_STATUS.TU_CHOI
    ) {
      // Từ chối sau khi duyệt: tăng số lượng
      await SachService.updateBookQuantity(sachId, 1);
    }
  }

  /**
   * Lấy thống kê mượn sách
   */
  static async getStatistics() {
    const [totalPhieuMuon, statusStats, topBorrowedBooks, overdueBooks] =
      await Promise.all([
        // Tổng số phiếu mượn
        TheoDoiMuonSach.countDocuments({ deleted: false }),

        // Thống kê theo trạng thái
        TheoDoiMuonSach.aggregate([
          { $match: { deleted: false } },
          { $group: { _id: "$TrangThai", count: { $sum: 1 } } },
        ]),

        // Top sách được mượn nhiều nhất
        TheoDoiMuonSach.aggregate([
          { $match: { deleted: false } },
          { $group: { _id: "$MaSach", soLanMuon: { $sum: 1 } } },
          { $sort: { soLanMuon: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "saches",
              localField: "_id",
              foreignField: "_id",
              as: "sach",
            },
          },
          { $unwind: "$sach" },
          {
            $project: {
              _id: 1,
              TenSach: "$sach.TenSach",
              TacGia: "$sach.TacGia",
              soLanMuon: 1,
            },
          },
        ]),

        // Sách quá hạn
        this.getOverdueBooks(),
      ]);

    return {
      totalPhieuMuon,
      statusStats,
      topBorrowedBooks,
      overdueBooks: overdueBooks.length,
    };
  }

  /**
   * Lấy danh sách sách quá hạn
   */
  static async getOverdueBooks() {
    const now = new Date();

    return await TheoDoiMuonSach.find({
      TrangThai: { $in: [MUON_SACH_STATUS.DA_DUYET, MUON_SACH_STATUS.DA_MUON] },
      NgayTra: { $lt: now },
      deleted: false,
    })
      .populate("MaDocGia", "HoLot Ten Email DienThoai")
      .populate("MaSach", "TenSach TacGia")
      .sort({ NgayTra: 1 });
  }
}

module.exports = MuonSachService;
