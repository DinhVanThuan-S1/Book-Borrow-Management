const DocGia = require("../models/DocGia.model");
const Sach = require("../models/Sach.model");
const TheoDoiMuonSach = require("../models/TheoDoiMuonSach.model");
const NhanVien = require("../models/NhanVien.model");
const DanhMuc = require("../models/DanhMuc.model");

/**
 * ThongKe Service
 * Service xử lý logic nghiệp vụ cho thống kê
 */
class ThongKeService {
  /**
   * Lấy thống kê tổng quan
   */
  static async getOverviewStats() {
    const [
      tongDocGia,
      tongNhanVien,
      tongSach,
      sachTrongKho,
      sachDangMuon,
      thongKeeMuonSach,
      sachPhoBien,
      danhMucStats,
    ] = await Promise.all([
      // Đếm số lượng độc giả
      DocGia.countDocuments({ deleted: false }),

      // Đếm số lượng nhân viên
      NhanVien.countDocuments({ deleted: false }),

      // Đếm số lượng đầu sách
      Sach.countDocuments({ deleted: false }),

      // Tổng số sách trong kho
      Sach.aggregate([
        { $match: { deleted: false } },
        { $group: { _id: null, total: { $sum: "$SoQuyen" } } },
      ]),

      // Số sách đang được mượn (chỉ đếm trạng thái "Đang mượn")
      TheoDoiMuonSach.countDocuments({
        TrangThai: "Đang mượn",
        deleted: false,
      }),

      // Thống kê theo trạng thái mượn sách
      TheoDoiMuonSach.aggregate([
        { $match: { deleted: false } },
        { $group: { _id: "$TrangThai", count: { $sum: 1 } } },
      ]),

      // Top 5 sách được mượn nhiều nhất
      this.getTopBorrowedBooks(5),

      // Thống kê danh mục
      this.getCategoryStats(),
    ]);

    const tongTaiKhoan = tongDocGia + tongNhanVien;

    return {
      tongTaiKhoan,
      tongDocGia,
      tongNhanVien,
      tongSach,
      sachTrongKho: sachTrongKho[0]?.total || 0,
      sachDangMuon,
      thongKeeMuonSach: this.formatStatusStats(thongKeeMuonSach),
      sachPhoBien,
      danhMucStats,
    };
  }

  /**
   * Thống kê theo tháng
   */
  static async getMonthlyStats(year = new Date().getFullYear()) {
    const thongKeThang = await TheoDoiMuonSach.aggregate([
      {
        $match: {
          deleted: false,
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            thang: { $month: "$createdAt" },
            trangThai: "$TrangThai",
          },
          soLuong: { $sum: 1 },
        },
      },
      { $sort: { "_id.thang": 1 } },
    ]);

    // Tạo mảng 12 tháng với dữ liệu chi tiết
    const ketQua = Array.from({ length: 12 }, (_, index) => ({
      thang: index + 1,
      "Đã duyệt": 0,
      "Từ chối": 0,
      "Đã mượn": 0,
      "Đã trả": 0,
      tong: 0,
    }));

    // Điền dữ liệu thực tế
    thongKeThang.forEach((item) => {
      const monthIndex = item._id.thang - 1;
      ketQua[monthIndex][item._id.trangThai] = item.soLuong;
      ketQua[monthIndex].tong += item.soLuong;
    });

    return ketQua;
  }

  /**
   * Thống kê theo năm
   */
  static async getYearlyStats() {
    const thongKeNam = await TheoDoiMuonSach.aggregate([
      {
        $match: { deleted: false },
      },
      {
        $group: {
          _id: { $year: "$createdAt" },
          soLuong: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 5 },
    ]);

    return thongKeNam.map((item) => ({
      nam: item._id,
      soLuong: item.soLuong,
    }));
  }

  /**
   * Top sách được mượn nhiều nhất
   */
  static async getTopBorrowedBooks(limit = 10) {
    return await TheoDoiMuonSach.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: "$MaSach", soLanMuon: { $sum: 1 } } },
      { $sort: { soLanMuon: -1 } },
      { $limit: parseInt(limit) },
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
          BiaSach: "$sach.BiaSach",
          soLanMuon: 1,
        },
      },
    ]);
  }

  /**
   * Top độc giả mượn nhiều sách nhất
   */
  static async getTopReaders(limit = 10) {
    return await TheoDoiMuonSach.aggregate([
      { $match: { deleted: false } },
      { $group: { _id: "$MaDocGia", soLanMuon: { $sum: 1 } } },
      { $sort: { soLanMuon: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "docgias",
          localField: "_id",
          foreignField: "_id",
          as: "docgia",
        },
      },
      { $unwind: "$docgia" },
      {
        $project: {
          _id: 1,
          HoTen: { $concat: ["$docgia.HoLot", " ", "$docgia.Ten"] },
          Email: "$docgia.Email",
          soLanMuon: 1,
        },
      },
    ]);
  }

  /**
   * Thống kê danh mục
   */
  static async getCategoryStats() {
    return await DanhMuc.aggregate([
      { $match: { deleted: false } },
      {
        $lookup: {
          from: "saches",
          localField: "_id",
          foreignField: "MaDM",
          as: "saches",
        },
      },
      {
        $addFields: {
          soLuongSach: {
            $size: {
              $filter: {
                input: "$saches",
                cond: { $eq: ["$$this.deleted", false] },
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: "theodoiuonsaches",
          let: { categoryBooks: "$saches._id" },
          pipeline: [
            {
              $match: {
                $expr: { $in: ["$MaSach", "$$categoryBooks"] },
                deleted: false,
              },
            },
          ],
          as: "luotMuon",
        },
      },
      {
        $addFields: {
          soLuotMuon: { $size: "$luotMuon" },
        },
      },
      {
        $project: {
          TenDM: 1,
          soLuongSach: 1,
          soLuotMuon: 1,
        },
      },
      { $sort: { soLuotMuon: -1 } },
    ]);
  }

  /**
   * Thống kê sách sắp hết
   */
  static async getLowStockBooks(threshold = 5) {
    return await Sach.find({
      deleted: false,
      SoQuyen: { $lte: threshold, $gt: 0 },
    })
      .select("TenSach TacGia SoQuyen BiaSach")
      .populate("MaDM", "TenDM")
      .sort({ SoQuyen: 1 });
  }

  /**
   * Thống kê sách hết hàng
   */
  static async getOutOfStockBooks() {
    return await Sach.find({
      deleted: false,
      SoQuyen: 0,
    })
      .select("TenSach TacGia SoQuyen BiaSach")
      .populate("MaDM", "TenDM")
      .sort({ TenSach: 1 });
  }

  /**
   * Format thống kê trạng thái
   */
  static formatStatusStats(stats) {
    const formatted = {
      "Đã duyệt": 0,
      "Từ chối": 0,
      "Đã mượn": 0,
      "Đã trả": 0,
    };

    stats.forEach((stat) => {
      if (formatted.hasOwnProperty(stat._id)) {
        formatted[stat._id] = stat.count;
      }
    });

    return formatted;
  }

  /**
   * Dashboard stats cho admin
   */
  static async getDashboardStats() {
    const [
      overview,
      topBooks,
      topReaders,
      lowStock,
      outOfStock,
      recentBorrows,
    ] = await Promise.all([
      this.getOverviewStats(),
      this.getTopBorrowedBooks(5),
      this.getTopReaders(5),
      this.getLowStockBooks(5),
      this.getOutOfStockBooks(),
      this.getRecentBorrows(10),
    ]);

    return {
      overview,
      topBooks,
      topReaders,
      lowStock,
      outOfStock,
      recentBorrows,
    };
  }

  /**
   * Lấy dữ liệu dashboard tổng hợp
   */
  static async getDashboardData() {
    // Debug: Đếm chính xác số "Đang mượn"
    const dangMuonCount = await TheoDoiMuonSach.countDocuments({
      TrangThai: "Đang mượn",
      deleted: false,
    });
    
    console.log("=== DEBUG DASHBOARD ===");
    console.log("Số bản ghi TrangThai 'Đang mượn':", dangMuonCount);

    const [overview, recentBorrows, topBooks, overdueCount, statusBreakdown] = await Promise.all([
      // Thống kê tổng quan
      this.getOverviewStats(),
      
      // 10 phiếu mượn gần đây
      TheoDoiMuonSach.find({ deleted: false })
        .populate("MaDocGia", "MaDocGia HoLot Ten Email")
        .populate("MaSach", "MaSach TenSach TacGia")
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Top 5 sách phổ biến
      this.getTopBorrowedBooks(5),
      
      // Số sách quá hạn
      TheoDoiMuonSach.countDocuments({
        TrangThai: "Quá hạn",
        deleted: false,
      }),

      // Thống kê chi tiết theo trạng thái để debug
      TheoDoiMuonSach.aggregate([
        { $match: { deleted: false } },
        { $group: { _id: "$TrangThai", count: { $sum: 1 } } },
      ])
    ]);

    // Log để debug
    console.log("Thống kê trạng thái phiếu mượn:", statusBreakdown);
    console.log("sachDangMuon từ overview:", overview.sachDangMuon);
    console.log("=======================");

    return {
      overview,
      recentBorrows,
      topBooks,
      overdueBooks: overdueCount,
      statusBreakdown, // Thêm để debug
    };
  }

  /**
   * Lấy phiếu mượn gần đây
   */
  static async getRecentBorrows(limit = 10) {
    return await TheoDoiMuonSach.find({ deleted: false })
      .populate("MaDocGia", "HoLot Ten")
      .populate("MaSach", "TenSach")
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("TrangThai NgayMuon NgayTra createdAt");
  }
}

module.exports = ThongKeService;
