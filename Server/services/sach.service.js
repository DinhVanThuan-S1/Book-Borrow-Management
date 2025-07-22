const Sach = require("../models/Sach.model");
const { PAGINATION, SORT_OPTIONS } = require("../utils/constants");

/**
 * Sach Service
 * Service xử lý logic nghiệp vụ cho sách
 */
class SachService {
  /**
   * Lấy danh sách sách với phân trang và lọc
   */
  static async getSaches(queryParams) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      search = "",
      sort = SORT_OPTIONS.NEWEST,
      danhmuc = "",
      minPrice = 0,
      maxPrice = 999999999,
    } = queryParams;

    const query = { deleted: false };

    // Tìm kiếm theo tên sách hoặc tác giả
    if (search) {
      query.$or = [
        { TenSach: { $regex: search, $options: "i" } },
        { TacGia: { $regex: search, $options: "i" } },
      ];
    }

    // Lọc theo danh mục
    if (danhmuc) {
      query.MaDM = danhmuc;
    }

    // Lọc theo giá
    query.DonGia = {
      $gte: parseInt(minPrice),
      $lte: parseInt(maxPrice),
    };

    // Sắp xếp
    const sortOption = this.getSortOption(sort);

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    // Cài đặt collation cho Tiếng Việt
    const collationOptions = {
      locale: "vi",
      strength: 1, // Case insensitive
      numericOrdering: true,
    };

    // Sử dụng collation cho sắp xếp Tiếng Việt khi cần thiết
    const findOptions = {
      skip: skip,
      limit: limitNum,
    };

    if (sort === SORT_OPTIONS.A_TO_Z || sort === SORT_OPTIONS.Z_TO_A) {
      findOptions.collation = collationOptions;
    }

    const [saches, total] = await Promise.all([
      Sach.find(query, null, findOptions)
        .populate("MaDM", "TenDM")
        .populate("MaNXB", "TenNXB")
        .populate("NguoiTao", "HoTenNV")
        .sort(sortOption),
      Sach.countDocuments(query),
    ]);

    return {
      saches,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    };
  }

  /**
   * Lấy sách theo ID
   */
  static async getSachById(id) {
    const sach = await Sach.findOne({
      _id: id,
      deleted: false,
    })
      .populate("MaDM", "TenDM MoTa")
      .populate("MaNXB", "TenNXB DiaChi")
      .populate("NguoiTao", "HoTenNV");

    if (!sach) {
      throw new Error("Không tìm thấy sách");
    }

    return sach;
  }

  /**
   * Tạo sách mới
   */
  static async createSach(sachData, nguoiTaoId, biaSachPath = "") {
    const { TenSach, MoTa, DonGia, SoQuyen, NamXuatBan, TacGia, MaNXB, MaDM } =
      sachData;

    // Kiểm tra trùng tên sách
    const existingSach = await Sach.findOne({
      TenSach,
      deleted: false,
    });

    if (existingSach) {
      throw new Error("Tên sách đã tồn tại");
    }

    // Validate dữ liệu
    if (DonGia < 0) {
      throw new Error("Đơn giá phải lớn hơn hoặc bằng 0");
    }

    if (SoQuyen < 0) {
      throw new Error("Số quyển phải lớn hơn hoặc bằng 0");
    }

    if (NamXuatBan < 1000 || NamXuatBan > new Date().getFullYear()) {
      throw new Error("Năm xuất bản không hợp lệ");
    }

    const sach = new Sach({
      TenSach,
      MoTa,
      DonGia: parseFloat(DonGia),
      SoQuyen: parseInt(SoQuyen),
      NamXuatBan: parseInt(NamXuatBan),
      TacGia,
      MaNXB,
      MaDM,
      NguoiTao: nguoiTaoId,
      BiaSach: biaSachPath,
    });

    await sach.save();

    return await sach.populate([
      { path: "MaDM", select: "TenDM" },
      { path: "MaNXB", select: "TenNXB" },
      { path: "NguoiTao", select: "HoTenNV" },
    ]);
  }

  /**
   * Cập nhật sách
   */
  static async updateSach(id, sachData, biaSachPath = null) {
    const { TenSach, MoTa, DonGia, SoQuyen, NamXuatBan, TacGia, MaNXB, MaDM } =
      sachData;

    // Tìm sách hiện tại
    const currentSach = await Sach.findOne({
      _id: id,
      deleted: false,
    });

    if (!currentSach) {
      throw new Error("Không tìm thấy sách");
    }

    // Kiểm tra trùng tên sách (trừ chính nó)
    const existingSach = await Sach.findOne({
      TenSach,
      deleted: false,
      _id: { $ne: id },
    });

    if (existingSach) {
      throw new Error("Tên sách đã tồn tại");
    }

    // Validate dữ liệu
    if (DonGia < 0) {
      throw new Error("Đơn giá phải lớn hơn hoặc bằng 0");
    }

    if (SoQuyen < 0) {
      throw new Error("Số quyển phải lớn hơn hoặc bằng 0");
    }

    if (NamXuatBan < 1000 || NamXuatBan > new Date().getFullYear()) {
      throw new Error("Năm xuất bản không hợp lệ");
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      TenSach,
      MoTa,
      DonGia: parseFloat(DonGia),
      SoQuyen: parseInt(SoQuyen),
      NamXuatBan: parseInt(NamXuatBan),
      TacGia,
      MaNXB,
      MaDM,
    };

    // Cập nhật ảnh nếu có
    if (biaSachPath) {
      updateData.BiaSach = biaSachPath;
    }

    const sach = await Sach.findOneAndUpdate(
      { _id: id, deleted: false },
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: "MaDM", select: "TenDM" },
      { path: "MaNXB", select: "TenNXB" },
      { path: "NguoiTao", select: "HoTenNV" },
    ]);

    return { sach, oldImagePath: currentSach.BiaSach };
  }

  /**
   * Xóa mềm sách
   */
  static async deleteSach(id) {
    const sach = await Sach.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );

    if (!sach) {
      throw new Error("Không tìm thấy sách");
    }

    return sach;
  }

  /**
   * Lấy sách phổ biến
   */
  static async getPopularBooks(limit = 10) {
    const popularBooks = await Sach.aggregate([
      { $match: { deleted: false, SoQuyen: { $gt: 0 } } },
      {
        $lookup: {
          from: "theodoiuonsaches",
          localField: "_id",
          foreignField: "MaSach",
          as: "luotMuon",
        },
      },
      {
        $addFields: {
          soLuotMuon: { $size: "$luotMuon" },
        },
      },
      { $sort: { soLuotMuon: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "danhmucs",
          localField: "MaDM",
          foreignField: "_id",
          as: "danhmuc",
        },
      },
      {
        $lookup: {
          from: "nhaxuatbans",
          localField: "MaNXB",
          foreignField: "_id",
          as: "nhaxuatban",
        },
      },
    ]);

    return popularBooks;
  }

  /**
   * Kiểm tra sách có thể mượn được không
   */
  static async checkBookAvailability(sachId) {
    const sach = await Sach.findOne({
      _id: sachId,
      deleted: false,
    });

    if (!sach) {
      throw new Error("Không tìm thấy sách");
    }

    if (sach.SoQuyen <= 0) {
      throw new Error("Sách đã hết, không thể mượn");
    }

    return sach;
  }

  /**
   * Cập nhật số lượng sách
   */
  static async updateBookQuantity(sachId, quantity) {
    const sach = await Sach.findByIdAndUpdate(
      sachId,
      { $inc: { SoQuyen: quantity } },
      { new: true }
    );

    if (!sach) {
      throw new Error("Không tìm thấy sách");
    }

    return sach;
  }

  /**
   * Lấy option sắp xếp
   */
  static getSortOption(sort) {
    const sortOptions = {
      [SORT_OPTIONS.NEWEST]: { createdAt: -1 },
      [SORT_OPTIONS.OLDEST]: { createdAt: 1 },
      [SORT_OPTIONS.A_TO_Z]: { TenSach: 1 },
      [SORT_OPTIONS.Z_TO_A]: { TenSach: -1 },
      [SORT_OPTIONS.PRICE_LOW]: { DonGia: 1 },
      [SORT_OPTIONS.PRICE_HIGH]: { DonGia: -1 },
    };

    return sortOptions[sort] || sortOptions[SORT_OPTIONS.NEWEST];
  }
  // Thêm method để tìm sách theo MaSach
  static async getSachByMaSach(maSach) {
    const sach = await Sach.findOne({
      MaSach: maSach,
      deleted: false,
    })
      .populate("MaDM", "MaDM TenDM MoTa")
      .populate("MaNXB", "MaNXB TenNXB DiaChi")
      .populate("NguoiTao", "MSNV HoTenNV");

    if (!sach) {
      throw new Error("Không tìm thấy sách");
    }

    return sach;
  }

  // Thêm method để kiểm tra MaSach có tồn tại không
  static async checkMaSachExists(maSach) {
    const count = await Sach.countDocuments({
      MaSach,
      deleted: false,
    });
    return count > 0;
  }
}

module.exports = SachService;
