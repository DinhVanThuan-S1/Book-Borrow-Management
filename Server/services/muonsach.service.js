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
      .populate("MaDocGia", "MaDocGia HoLot Ten Email DienThoai")
      .populate({
        path: "MaSach",
        select: "MaSach TenSach TacGia BiaSach DonGia NamXuatBan MaNXB",
        populate: {
          path: "MaNXB",
          select: "TenNXB"
        }
      })
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
      status = "",
      overdue = false,
    } = queryParams;

    const query = {
      MaDocGia: docGiaId,
      deleted: false,
    };

    // Lọc theo trạng thái
    if (status && Object.values(MUON_SACH_STATUS).includes(status)) {
      query.TrangThai = status;
    } else if (trangthai && Object.values(MUON_SACH_STATUS).includes(trangthai)) {
      query.TrangThai = trangthai;
    }

    // Lọc theo quá hạn
    if (overdue === true || overdue === "true") {
      query.$or = [
        // Items that are actively borrowed but overdue
        {
          TrangThai: MUON_SACH_STATUS.DANG_MUON,
          NgayTraDuKien: { $lt: new Date() }
        },
        // Items with explicit overdue status
        {
          TrangThai: MUON_SACH_STATUS.QUA_HAN
        }
      ];
    }

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    const [lichSu, total] = await Promise.all([
      TheoDoiMuonSach.find(query)
        .populate({
          path: "MaSach",
          select: "MaSach TenSach TacGia BiaSach DonGia NamXuatBan MaNXB MaDM SoQuyen",
          populate: [
            {
              path: "MaNXB",
              select: "TenNXB"
            },
            {
              path: "MaDM",
              select: "TenDM"
            }
          ]
        })
        .populate({
          path: "MaDocGia",
          select: "HoTen Email"
        })
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
    // Kiểm tra sách có tồn tại
    let sach;
    let trangThai = MUON_SACH_STATUS.TU_CHOI; // Mặc định là từ chối
    let lyDoTuChoi = "";

    try {
      sach = await SachService.checkBookAvailability(sachId);
    } catch (error) {
      lyDoTuChoi = "Sách không còn trong kho hoặc đã hết";
    }

    // Kiểm tra độc giả đã mượn sách này chưa (và chưa trả)
    if (sach) {
      const daMuon = await TheoDoiMuonSach.findOne({
        MaDocGia: docGiaId,
        MaSach: sachId,
        TrangThai: { $in: [MUON_SACH_STATUS.DA_DUYET, MUON_SACH_STATUS.DANG_MUON] },
        deleted: false,
      });

      if (daMuon) {
        lyDoTuChoi = "Bạn đã mượn sách này rồi";
      }
    }

    // Kiểm tra độc giả đã mượn quá giới hạn chưa
    if (sach && !lyDoTuChoi) {
      const soSachDangMuon = await TheoDoiMuonSach.countDocuments({
        MaDocGia: docGiaId,
        TrangThai: { $in: [MUON_SACH_STATUS.DA_DUYET, MUON_SACH_STATUS.DANG_MUON] },
        deleted: false,
      });

      if (soSachDangMuon >= MAX_BOOKS_PER_USER) {
        lyDoTuChoi = `Bạn đã mượn tối đa ${MAX_BOOKS_PER_USER} quyển sách. Vui lòng trả sách trước khi mượn tiếp.`;
      }
    }

    // Nếu tất cả điều kiện đều OK thì tự động duyệt
    if (sach && !lyDoTuChoi) {
      trangThai = MUON_SACH_STATUS.DA_DUYET;
    }

    // Tạo phiếu mượn mới
    const phieuMuon = new TheoDoiMuonSach({
      MaDocGia: docGiaId,
      MaSach: sachId,
      TrangThai: trangThai,
      LyDoTuChoi: lyDoTuChoi || undefined,
    });

    await phieuMuon.save();

    // Chỉ giảm số lượng sách nếu được duyệt
    if (trangThai === MUON_SACH_STATUS.DA_DUYET) {
      await SachService.updateBookQuantity(sachId, -1);
    }

    await phieuMuon.populate({
      path: "MaSach",
      select: "MaSach TenSach TacGia BiaSach DonGia NamXuatBan MaNXB",
      populate: {
        path: "MaNXB",
        select: "TenNXB"
      }
    });

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
      throw new Error("Không tìm thấy phiếu mượn hoặc không thể hủy. Chỉ có thể hủy phiếu mượn đã được duyệt.");
    }

    // Xóa mềm phiếu mượn
    phieuMuon.deleted = true;
    await phieuMuon.save();

    // Tăng lại số lượng sách trong kho (chỉ khi phiếu mượn đã duyệt)
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

    // Kiểm tra quy trình chuyển trạng thái hợp lệ
    this.validateStatusTransition(oldStatus, newStatus);

    // Xử lý logic thay đổi số lượng sách
    await this.handleStatusChange(phieuMuon, oldStatus, newStatus);

    // Cập nhật trạng thái
    phieuMuon.TrangThai = newStatus;
    await phieuMuon.save();

    await phieuMuon.populate("MaDocGia", "MaDocGia HoLot Ten Email DienThoai");

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

    // Chỉ cho phép xóa phiếu mượn ở trạng thái "Đã duyệt" hoặc "Từ chối"
    if (![MUON_SACH_STATUS.DA_DUYET, MUON_SACH_STATUS.TU_CHOI].includes(phieuMuon.TrangThai)) {
      throw new Error("Chỉ có thể xóa phiếu mượn ở trạng thái 'Đã duyệt' hoặc 'Từ chối'");
    }

    // Nếu phiếu mượn đang ở trạng thái đã duyệt, cần tăng lại số lượng sách
    if (phieuMuon.TrangThai === MUON_SACH_STATUS.DA_DUYET) {
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

    // Từ "Đang mượn" sang "Đã trả": tăng số lượng sách
    if (
      oldStatus === MUON_SACH_STATUS.DANG_MUON &&
      newStatus === MUON_SACH_STATUS.DA_TRA
    ) {
      await SachService.updateBookQuantity(sachId, 1);
    }
    // Không cần xử lý thay đổi số lượng cho các trường hợp khác
    // vì số lượng đã được xử lý khi tạo phiếu mượn (tự động duyệt/từ chối)
  }

  /**
   * Kiểm tra quy trình chuyển trạng thái hợp lệ
   */
  static validateStatusTransition(oldStatus, newStatus) {
    const validTransitions = {
      [MUON_SACH_STATUS.DA_DUYET]: [MUON_SACH_STATUS.DANG_MUON], // Đã duyệt -> Đang mượn
      [MUON_SACH_STATUS.DANG_MUON]: [MUON_SACH_STATUS.DA_TRA, MUON_SACH_STATUS.QUA_HAN], // Đang mượn -> Đã trả hoặc Quá hạn
    };

    if (!validTransitions[oldStatus] || !validTransitions[oldStatus].includes(newStatus)) {
      throw new Error(`Không thể chuyển từ trạng thái "${oldStatus}" sang "${newStatus}"`);
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

    // Tự động cập nhật trạng thái quá hạn
    await this.updateOverdueStatus();

    return await TheoDoiMuonSach.find({
      TrangThai: MUON_SACH_STATUS.QUA_HAN,
      deleted: false,
    })
      .populate("MaDocGia", "MaDocGia HoLot Ten Email DienThoai")
      .populate({
        path: "MaSach",
        select: "MaSach TenSach TacGia BiaSach DonGia NamXuatBan MaNXB",
        populate: {
          path: "MaNXB",
          select: "TenNXB"
        }
      })
      .sort({ NgayTra: 1 });
  }

  /**
   * Tự động cập nhật trạng thái quá hạn
   */
  static async updateOverdueStatus() {
    const now = new Date();

    await TheoDoiMuonSach.updateMany(
      {
        TrangThai: MUON_SACH_STATUS.DANG_MUON,
        NgayTra: { $lt: now },
        deleted: false,
      },
      {
        TrangThai: MUON_SACH_STATUS.QUA_HAN,
      }
    );
  }

  /**
   * Lấy lịch sử mượn sách theo ID sách
   */
  static async getLichSuMuonTheoSach(sachId, queryParams = {}) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      trangthai = "",
    } = queryParams;

    const query = {
      MaSach: sachId,
      deleted: false,
    };

    // Lọc theo trạng thái
    if (trangthai && Object.values(MUON_SACH_STATUS).includes(trangthai)) {
      query.TrangThai = trangthai;
    }

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    const lichSu = await TheoDoiMuonSach.find(query)
      .populate("MaDocGia", "MaDocGia HoLot Ten Email DienThoai")
      .populate({
        path: "MaSach",
        select: "MaSach TenSach TacGia BiaSach DonGia NamXuatBan MaNXB",
        populate: {
          path: "MaNXB",
          select: "TenNXB"
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await TheoDoiMuonSach.countDocuments(query);

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
}

module.exports = MuonSachService;
