const DocGia = require("../models/DocGia.model");
const { PAGINATION, SORT_OPTIONS, GIOI_TINH } = require("../utils/constants");

/**
 * DocGia Service
 * Service xử lý logic nghiệp vụ cho độc giả
 */
class DocGiaService {
  /**
   * Lấy danh sách độc giả với phân trang và tìm kiếm
   */
  static async getDocGias(queryParams) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      search = "",
      sort = SORT_OPTIONS.NEWEST,
      phai = "",
    } = queryParams;

    const query = { deleted: false };

    // Tìm kiếm theo tên, email, số điện thoại
    if (search) {
      query.$or = [
        { HoLot: { $regex: search, $options: "i" } },
        { Ten: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
        { DienThoai: { $regex: search, $options: "i" } },
      ];
    }

    // Lọc theo giới tính
    if (phai && Object.values(GIOI_TINH).includes(phai)) {
      query.Phai = phai;
    }

    // Sắp xếp
    const { sortOption, needsCollation } = this.getSortOption(sort);

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    // Tạo query với collation cho Vietnamese nếu cần
    let docgiasQuery = DocGia.find(query)
      .select("-Password") // Không trả về password
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    // Áp dụng collation Vietnamese cho sắp xếp theo tên
    if (needsCollation) {
      docgiasQuery = docgiasQuery.collation({
        locale: "vi",
        strength: 1, // Primary level comparison (ignore case and accents)
        numericOrdering: true,
      });
    }

    const [docgias, total] = await Promise.all([
      docgiasQuery,
      DocGia.countDocuments(query),
    ]);

    return {
      docgias,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    };
  }

  /**
   * Lấy độc giả theo ID
   */
  static async getDocGiaById(id) {
    const docgia = await DocGia.findOne({
      _id: id,
      deleted: false,
    }).select("-Password");

    if (!docgia) {
      throw new Error("Không tìm thấy độc giả");
    }

    return docgia;
  }

  /**
   * Tạo độc giả mới (admin tạo)
   */
  static async createDocGia(docgiaData) {
    const { HoLot, Ten, Email, Password, NgaySinh, Phai, DiaChi, DienThoai } =
      docgiaData;

    // Validate dữ liệu
    this.validateDocGiaData(docgiaData);

    // Kiểm tra email đã tồn tại
    const existingDocGia = await DocGia.findOne({ Email, deleted: false });
    if (existingDocGia) {
      throw new Error("Email đã được sử dụng");
    }

    const docgia = new DocGia({
      HoLot: HoLot.trim(),
      Ten: Ten.trim(),
      Email: Email.toLowerCase().trim(),
      Password,
      NgaySinh: new Date(NgaySinh),
      Phai,
      DiaChi: DiaChi.trim(),
      DienThoai: DienThoai.trim(),
    });

    await docgia.save();

    // Trả về thông tin không có password
    return await DocGia.findById(docgia._id).select("-Password");
  }

  /**
   * Cập nhật thông tin độc giả
   */
  static async updateDocGia(id, docgiaData, isOwner = false) {
    const { HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai, Email } = docgiaData;

    // Tìm độc giả hiện tại
    const currentDocGia = await DocGia.findOne({
      _id: id,
      deleted: false,
    });

    if (!currentDocGia) {
      throw new Error("Không tìm thấy độc giả");
    }

    // Validate dữ liệu cơ bản
    if (!HoLot || !Ten || !NgaySinh || !Phai || !DiaChi || !DienThoai) {
      throw new Error("Tất cả các trường thông tin là bắt buộc");
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      HoLot: HoLot.trim(),
      Ten: Ten.trim(),
      NgaySinh: new Date(NgaySinh),
      Phai,
      DiaChi: DiaChi.trim(),
      DienThoai: DienThoai.trim(),
    };

    // Chỉ admin mới có thể thay đổi email
    if (!isOwner && Email && Email !== currentDocGia.Email) {
      // Kiểm tra email mới có trùng không
      const existingDocGia = await DocGia.findOne({
        Email: Email.toLowerCase().trim(),
        deleted: false,
        _id: { $ne: id },
      });

      if (existingDocGia) {
        throw new Error("Email đã được sử dụng");
      }

      updateData.Email = Email.toLowerCase().trim();
    }

    const docgia = await DocGia.findOneAndUpdate(
      { _id: id, deleted: false },
      updateData,
      { new: true, runValidators: true }
    ).select("-Password");

    return docgia;
  }

  /**
   * Cập nhật avatar
   */
  static async updateAvatar(id, avatarPath) {
    const docgia = await DocGia.findOneAndUpdate(
      { _id: id, deleted: false },
      { Avatar: avatarPath },
      { new: true }
    ).select("-Password");

    if (!docgia) {
      throw new Error("Không tìm thấy độc giả");
    }

    return docgia;
  }

  /**
   * Xóa mềm độc giả
   */
  static async deleteDocGia(id) {
    // Kiểm tra xem độc giả có phiếu mượn đang hoạt động không
    const TheoDoiMuonSach = require("../models/TheoDoiMuonSach.model");
    const activeBorrows = await TheoDoiMuonSach.countDocuments({
      MaDocGia: id,
      TrangThai: { $in: ["Đã duyệt", "Đã mượn"] },
      deleted: false,
    });

    if (activeBorrows > 0) {
      throw new Error(
        `Không thể xóa độc giả này vì có ${activeBorrows} phiếu mượn đang hoạt động`
      );
    }

    const docgia = await DocGia.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );

    if (!docgia) {
      throw new Error("Không tìm thấy độc giả");
    }

    return docgia;
  }

  /**
   * Lấy thống kê độc giả
   */
  static async getDocGiaStats() {
    const TheoDoiMuonSach = require("../models/TheoDoiMuonSach.model");

    const [
      totalDocGia,
      genderStats,
      ageStats,
      topReaders,
      recentRegistrations,
    ] = await Promise.all([
      // Tổng số độc giả
      DocGia.countDocuments({ deleted: false }),

      // Thống kê theo giới tính
      DocGia.aggregate([
        { $match: { deleted: false } },
        { $group: { _id: "$Phai", count: { $sum: 1 } } },
      ]),

      // Thống kê theo độ tuổi
      this.getAgeStats(),

      // Top độc giả mượn nhiều sách nhất
      TheoDoiMuonSach.aggregate([
        { $match: { deleted: false } },
        { $group: { _id: "$MaDocGia", soLanMuon: { $sum: 1 } } },
        { $sort: { soLanMuon: -1 } },
        { $limit: 5 },
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
      ]),

      // Độc giả đăng ký gần đây
      DocGia.find({ deleted: false })
        .select("-Password")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    return {
      totalDocGia,
      genderStats: this.formatGenderStats(genderStats),
      ageStats,
      topReaders,
      recentRegistrations,
    };
  }

  /**
   * Validate dữ liệu độc giả
   */
  static validateDocGiaData(data) {
    const { HoLot, Ten, Email, NgaySinh, Phai, DiaChi, DienThoai } = data;

    if (
      !HoLot ||
      !Ten ||
      !Email ||
      !NgaySinh ||
      !Phai ||
      !DiaChi ||
      !DienThoai
    ) {
      throw new Error("Tất cả các trường thông tin là bắt buộc");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      throw new Error("Email không hợp lệ");
    }

    // Validate phone number (Vietnam format)
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(DienThoai)) {
      throw new Error("Số điện thoại không hợp lệ");
    }

    // Validate giới tính
    if (!Object.values(GIOI_TINH).includes(Phai)) {
      throw new Error("Giới tính không hợp lệ");
    }

    // Validate ngày sinh (phải >= 16 tuổi)
    const birthDate = new Date(NgaySinh);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 16) {
      throw new Error("Độc giả phải từ 16 tuổi trở lên");
    }
  }

  /**
   * Lấy tùy chọn sắp xếp
   */
  static getSortOption(sort) {
    const sortOptions = {
      [SORT_OPTIONS.NEWEST]: {
        sortOption: { createdAt: -1 },
        needsCollation: false,
      },
      [SORT_OPTIONS.OLDEST]: {
        sortOption: { createdAt: 1 },
        needsCollation: false,
      },
      [SORT_OPTIONS.A_TO_Z]: {
        sortOption: { HoLot: 1, Ten: 1 },
        needsCollation: true,
      },
      [SORT_OPTIONS.Z_TO_A]: {
        sortOption: { HoLot: -1, Ten: -1 },
        needsCollation: true,
      },
    };

    return sortOptions[sort] || sortOptions[SORT_OPTIONS.NEWEST];
  }

  /**
   * Thống kê theo độ tuổi
   */
  static async getAgeStats() {
    return await DocGia.aggregate([
      { $match: { deleted: false } },
      {
        $addFields: {
          tuoi: {
            $subtract: [{ $year: new Date() }, { $year: "$NgaySinh" }],
          },
        },
      },
      {
        $bucket: {
          groupBy: "$tuoi",
          boundaries: [16, 25, 35, 45, 55, 100],
          default: "Khác",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);
  }

  /**
   * Format thống kê giới tính
   */
  static formatGenderStats(stats) {
    const formatted = {
      [GIOI_TINH.NAM]: 0,
      [GIOI_TINH.NU]: 0,
    };

    stats.forEach((stat) => {
      if (formatted.hasOwnProperty(stat._id)) {
        formatted[stat._id] = stat.count;
      }
    });

    return formatted;
  }

  /**
   * Tìm kiếm độc giả theo email
   */
  static async findByEmail(email) {
    return await DocGia.findOne({
      Email: email.toLowerCase().trim(),
      deleted: false,
    }).select("-Password");
  }

  /**
   * Lấy lịch sử hoạt động của độc giả
   */
  static async getDocGiaActivity(id) {
    const TheoDoiMuonSach = require("../models/TheoDoiMuonSach.model");
    const YeuThich = require("../models/YeuThich.model");
    const mongoose = require("mongoose");

    // Lấy thống kê theo trạng thái
    const [borrowStats, favorites] = await Promise.all([
      TheoDoiMuonSach.aggregate([
        {
          $match: { 
            MaDocGia: new mongoose.Types.ObjectId(id), 
            deleted: false 
          }
        },
        {
          $group: {
            _id: "$TrangThai",
            count: { $sum: 1 }
          }
        }
      ]),

      YeuThich.findOne({ MaDocGia: id, deleted: false }).populate(
        "DanhSachSach",
        "TenSach TacGia BiaSach"
      ),
    ]);

    // Chuyển đổi kết quả aggregate thành object với các key cụ thể
    const stats = {
      totalBorrows: 0,
      returned: 0,
      borrowing: 0,
      overdue: 0,
      approved: 0,
      rejected: 0
    };

    borrowStats.forEach(stat => {
      stats.totalBorrows += stat.count;
      
      switch (stat._id) {
        case "Đã trả":
          stats.returned = stat.count;
          break;
        case "Đang mượn":
          stats.borrowing = stat.count;
          break;
        case "Quá hạn":
          stats.overdue = stat.count;
          break;
        case "Đã duyệt":
          stats.approved = stat.count;
          break;
        case "Từ chối":
          stats.rejected = stat.count;
          break;
      }
    });

    return {
      ...stats,
      favorites: favorites ? favorites.DanhSachSach.length : 0,
    };
  }
}

module.exports = DocGiaService;
