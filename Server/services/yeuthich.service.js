const YeuThich = require("../models/YeuThich.model");
const Sach = require("../models/Sach.model");
const { PAGINATION } = require("../utils/constants");

/**
 * YeuThich Service
 * Service xử lý logic nghiệp vụ cho yêu thích
 */
class YeuThichService {
  /**
   * Lấy danh sách sách yêu thích của user
   */
  static async getFavorites(docGiaId, queryParams = {}) {
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } =
      queryParams;

    if (!docGiaId) {
      return { DanhSachSach: [], pagination: this.getEmptyPagination() };
    }

    const yeuThich = await YeuThich.findOne({
      MaDocGia: docGiaId,
      deleted: false,
    }).populate({
      path: "DanhSachSach",
      match: { deleted: false },
      populate: [
        { path: "MaDM", select: "TenDM" },
        { path: "MaNXB", select: "TenNXB" },
      ],
    });

    if (!yeuThich || !yeuThich.DanhSachSach) {
      return { DanhSachSach: [], pagination: this.getEmptyPagination() };
    }

    // Phân trang
    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
    const totalBooks = yeuThich.DanhSachSach.length;
    const paginatedBooks = yeuThich.DanhSachSach.slice(skip, skip + limitNum);

    return {
      DanhSachSach: paginatedBooks,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(totalBooks / limitNum),
        total: totalBooks,
        limit: limitNum,
      },
    };
  }

  /**
   * Thêm sách vào yêu thích
   */
  static async addToFavorites(docGiaId, sachId) {
    // Kiểm tra sách có tồn tại
    const sach = await Sach.findOne({ _id: sachId, deleted: false });
    if (!sach) {
      throw new Error("Không tìm thấy sách");
    }

    // Tìm hoặc tạo mới danh sách yêu thích của user
    let yeuThich = await YeuThich.findOne({
      MaDocGia: docGiaId,
      deleted: false,
    });

    if (!yeuThich) {
      yeuThich = new YeuThich({
        MaDocGia: docGiaId,
        DanhSachSach: [sachId],
      });
    } else {
      // Kiểm tra sách đã có trong danh sách yêu thích chưa
      if (yeuThich.DanhSachSach.includes(sachId)) {
        throw new Error("Sách đã có trong danh sách yêu thích");
      }

      yeuThich.DanhSachSach.push(sachId);
    }

    await yeuThich.save();

    return {
      message: "Thêm sách vào yêu thích thành công",
      totalFavorites: yeuThich.DanhSachSach.length,
    };
  }

  /**
   * Xóa sách khỏi yêu thích
   */
  static async removeFromFavorites(docGiaId, sachId) {
    const yeuThich = await YeuThich.findOne({
      MaDocGia: docGiaId,
      deleted: false,
    });

    if (!yeuThich) {
      throw new Error("Danh sách yêu thích không tồn tại");
    }

    // Kiểm tra sách có trong danh sách không
    if (!yeuThich.DanhSachSach.includes(sachId)) {
      throw new Error("Sách không có trong danh sách yêu thích");
    }

    // Xóa sách khỏi danh sách
    yeuThich.DanhSachSach = yeuThich.DanhSachSach.filter(
      (id) => id.toString() !== sachId
    );

    await yeuThich.save();

    return {
      message: "Xóa sách khỏi yêu thích thành công",
      totalFavorites: yeuThich.DanhSachSach.length,
    };
  }

  /**
   * Kiểm tra sách có trong yêu thích không
   */
  static async checkIsFavorite(docGiaId, sachId) {
    if (!docGiaId) {
      return { isFavorite: false };
    }

    const yeuThich = await YeuThich.findOne({
      MaDocGia: docGiaId,
      deleted: false,
    });

    const isFavorite = yeuThich && yeuThich.DanhSachSach.includes(sachId);

    return { isFavorite };
  }

  /**
   * Xóa tất cả yêu thích
   */
  static async clearAllFavorites(docGiaId) {
    const yeuThich = await YeuThich.findOneAndUpdate(
      { MaDocGia: docGiaId, deleted: false },
      { DanhSachSach: [] },
      { new: true }
    );

    if (!yeuThich) {
      throw new Error("Danh sách yêu thích không tồn tại");
    }

    return {
      message: "Xóa tất cả sách yêu thích thành công",
      totalFavorites: 0,
    };
  }

  /**
   * Lấy số lượng sách yêu thích
   */
  static async getFavoriteCount(docGiaId) {
    if (!docGiaId) {
      return { count: 0 };
    }

    const yeuThich = await YeuThich.findOne({
      MaDocGia: docGiaId,
      deleted: false,
    });

    return {
      count: yeuThich ? yeuThich.DanhSachSach.length : 0,
    };
  }

  /**
   * Thêm nhiều sách vào yêu thích cùng lúc
   */
  static async addMultipleToFavorites(docGiaId, sachIds) {
    if (!Array.isArray(sachIds) || sachIds.length === 0) {
      throw new Error("Danh sách sách không hợp lệ");
    }

    // Kiểm tra tất cả sách có tồn tại
    const validSaches = await Sach.find({
      _id: { $in: sachIds },
      deleted: false,
    }).select("_id");

    const validSachIds = validSaches.map((s) => s._id.toString());
    const invalidIds = sachIds.filter((id) => !validSachIds.includes(id));

    if (invalidIds.length > 0) {
      throw new Error(`Không tìm thấy sách với ID: ${invalidIds.join(", ")}`);
    }

    // Tìm hoặc tạo mới danh sách yêu thích
    let yeuThich = await YeuThich.findOne({
      MaDocGia: docGiaId,
      deleted: false,
    });

    if (!yeuThich) {
      yeuThich = new YeuThich({
        MaDocGia: docGiaId,
        DanhSachSach: sachIds,
      });
    } else {
      // Lọc ra những sách chưa có trong danh sách
      const newSachIds = sachIds.filter(
        (id) => !yeuThich.DanhSachSach.includes(id)
      );

      yeuThich.DanhSachSach.push(...newSachIds);
    }

    await yeuThich.save();

    return {
      message: `Thêm ${sachIds.length} sách vào yêu thích thành công`,
      totalFavorites: yeuThich.DanhSachSach.length,
      addedCount: sachIds.length,
    };
  }

  /**
   * Lấy thống kê yêu thích
   */
  static async getFavoriteStats() {
    const [totalUsers, totalFavorites, avgFavoritesPerUser, topFavoriteBooks] =
      await Promise.all([
        // Tổng số user có yêu thích
        YeuThich.countDocuments({
          deleted: false,
          DanhSachSach: { $ne: [] },
        }),

        // Tổng số lượt yêu thích
        YeuThich.aggregate([
          { $match: { deleted: false } },
          { $unwind: "$DanhSachSach" },
          { $count: "total" },
        ]),

        // Số yêu thích trung bình mỗi user
        YeuThich.aggregate([
          { $match: { deleted: false } },
          {
            $group: {
              _id: null,
              avgFavorites: { $avg: { $size: "$DanhSachSach" } },
            },
          },
        ]),

        // Top sách được yêu thích nhiều nhất
        this.getTopFavoriteBooks(10),
      ]);

    return {
      totalUsers,
      totalFavorites: totalFavorites[0]?.total || 0,
      avgFavoritesPerUser:
        Math.round((avgFavoritesPerUser[0]?.avgFavorites || 0) * 100) / 100,
      topFavoriteBooks,
    };
  }

  /**
   * Top sách được yêu thích nhiều nhất
   */
  static async getTopFavoriteBooks(limit = 10) {
    return await YeuThich.aggregate([
      { $match: { deleted: false } },
      { $unwind: "$DanhSachSach" },
      { $group: { _id: "$DanhSachSach", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
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
          favoriteCount: "$count",
        },
      },
    ]);
  }

  /**
   * Lấy pagination rỗng
   */
  static getEmptyPagination() {
    return {
      current: 1,
      pages: 0,
      total: 0,
      limit: PAGINATION.DEFAULT_LIMIT,
    };
  }

  /**
   * Sync yêu thích từ localStorage (cho user chưa đăng nhập)
   */
  static async syncFavoritesFromLocal(docGiaId, localFavorites) {
    if (!Array.isArray(localFavorites) || localFavorites.length === 0) {
      return { message: "Không có dữ liệu để đồng bộ" };
    }

    // Kiểm tra sách hợp lệ
    const validSaches = await Sach.find({
      _id: { $in: localFavorites },
      deleted: false,
    }).select("_id");

    const validSachIds = validSaches.map((s) => s._id.toString());

    if (validSachIds.length === 0) {
      return { message: "Không có sách hợp lệ để đồng bộ" };
    }

    // Thêm vào yêu thích
    const result = await this.addMultipleToFavorites(docGiaId, validSachIds);

    return {
      ...result,
      message: `Đồng bộ thành công ${validSachIds.length} sách từ localStorage`,
    };
  }
}

module.exports = YeuThichService;
