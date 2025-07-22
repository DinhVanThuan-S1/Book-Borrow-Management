const NhaXuatBan = require("../models/NhaXuatBan.model");
const { PAGINATION, SORT_OPTIONS } = require("../utils/constants");

/**
 * NhaXuatBan Service
 * Service xử lý logic nghiệp vụ cho nhà xuất bản
 */
class NhaXuatBanService {
  /**
   * Lấy danh sách nhà xuất bản với phân trang và tìm kiếm
   */
  static async getNhaXuatBans(queryParams) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      search = "",
      sort = SORT_OPTIONS.NEWEST,
    } = queryParams;

    const matchQuery = { deleted: false };

    // Tìm kiếm theo tên nhà xuất bản và địa chỉ
    if (search) {
      matchQuery.$or = [
        { TenNXB: { $regex: search, $options: "i" } },
        { DiaChi: { $regex: search, $options: "i" } },
      ];
    }

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

    // Sử dụng aggregation để thêm thống kê số sách
    const aggregationPipeline = [
      { $match: matchQuery },
      {
        $lookup: {
          from: "saches",
          localField: "_id",
          foreignField: "MaNXB",
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
        $project: {
          TenNXB: 1,
          MaNXB: 1,
          DiaChi: 1,
          soLuongSach: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: sortOption },
    ];

    // Thêm pagination
    const countPipeline = [...aggregationPipeline, { $count: "total" }];
    const dataPipeline = [
      ...aggregationPipeline,
      { $skip: skip },
      { $limit: limitNum },
    ];

    // Sử dụng collation cho sắp xếp Tiếng Việt khi cần thiết
    const aggregateOptions = {};
    if (sort === SORT_OPTIONS.A_TO_Z || sort === SORT_OPTIONS.Z_TO_A) {
      aggregateOptions.collation = collationOptions;
    }

    const [countResult, nhaxuatbans] = await Promise.all([
      NhaXuatBan.aggregate(countPipeline, aggregateOptions),
      NhaXuatBan.aggregate(dataPipeline, aggregateOptions),
    ]);

    const total = countResult.length > 0 ? countResult[0].total : 0;

    return {
      nhaxuatbans,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    };
  }

  /**
   * Lấy tất cả nhà xuất bản (không phân trang) - cho dropdown
   */
  static async getAllNhaXuatBans() {
    return await NhaXuatBan.find({ deleted: false })
      .select("_id TenNXB DiaChi")
      .sort({ TenNXB: 1 });
  }

  /**
   * Lấy nhà xuất bản theo ID
   */
  static async getNhaXuatBanById(id) {
    const nhaxuatban = await NhaXuatBan.findOne({
      _id: id,
      deleted: false,
    });

    if (!nhaxuatban) {
      throw new Error("Không tìm thấy nhà xuất bản");
    }

    return nhaxuatban;
  }

  /**
   * Tạo nhà xuất bản mới
   */
  static async createNhaXuatBan(nhaxuatbanData) {
    const { TenNXB, DiaChi } = nhaxuatbanData;

    // Validate dữ liệu
    this.validateNhaXuatBanData(nhaxuatbanData);

    // Kiểm tra trùng tên nhà xuất bản
    const existingNXB = await NhaXuatBan.findOne({
      TenNXB: TenNXB.trim(),
      deleted: false,
    });

    if (existingNXB) {
      throw new Error("Tên nhà xuất bản đã tồn tại");
    }

    const nhaxuatban = new NhaXuatBan({
      TenNXB: TenNXB.trim(),
      DiaChi: DiaChi.trim(),
    });

    await nhaxuatban.save();
    return nhaxuatban;
  }

  /**
   * Cập nhật nhà xuất bản
   */
  static async updateNhaXuatBan(id, nhaxuatbanData) {
    const { TenNXB, DiaChi } = nhaxuatbanData;

    // Validate dữ liệu
    this.validateNhaXuatBanData(nhaxuatbanData);

    // Kiểm tra trùng tên nhà xuất bản (trừ chính nó)
    const existingNXB = await NhaXuatBan.findOne({
      TenNXB: TenNXB.trim(),
      deleted: false,
      _id: { $ne: id },
    });

    if (existingNXB) {
      throw new Error("Tên nhà xuất bản đã tồn tại");
    }

    const nhaxuatban = await NhaXuatBan.findOneAndUpdate(
      { _id: id, deleted: false },
      {
        TenNXB: TenNXB.trim(),
        DiaChi: DiaChi.trim(),
      },
      { new: true, runValidators: true }
    );

    if (!nhaxuatban) {
      throw new Error("Không tìm thấy nhà xuất bản");
    }

    return nhaxuatban;
  }

  /**
   * Xóa mềm nhà xuất bản
   */
  static async deleteNhaXuatBan(id) {
    // Kiểm tra xem có sách nào đang sử dụng nhà xuất bản này không
    const Sach = require("../models/Sach.model");
    const sachCount = await Sach.countDocuments({
      MaNXB: id,
      deleted: false,
    });

    if (sachCount > 0) {
      throw new Error(
        `Không thể xóa nhà xuất bản này vì có ${sachCount} sách đang sử dụng`
      );
    }

    const nhaxuatban = await NhaXuatBan.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );

    if (!nhaxuatban) {
      throw new Error("Không tìm thấy nhà xuất bản");
    }

    return nhaxuatban;
  }

  /**
   * Thống kê nhà xuất bản
   */
  static async getNhaXuatBanStats() {
    const Sach = require("../models/Sach.model");

    const [totalNXB, nxbWithBooks, topNXB] = await Promise.all([
      // Tổng số nhà xuất bản
      NhaXuatBan.countDocuments({ deleted: false }),

      // Nhà xuất bản có sách
      this.getNXBWithBooksCount(),

      // Top nhà xuất bản có nhiều sách nhất
      this.getTopNXBByBooks(10),
    ]);

    return {
      totalNXB,
      nxbWithBooks,
      nxbWithoutBooks: totalNXB - nxbWithBooks,
      topNXB,
    };
  }

  /**
   * Lấy số lượng nhà xuất bản có sách
   */
  static async getNXBWithBooksCount() {
    const nxbWithBooks = await NhaXuatBan.aggregate([
      { $match: { deleted: false } },
      {
        $lookup: {
          from: "saches",
          localField: "_id",
          foreignField: "MaNXB",
          as: "saches",
        },
      },
      {
        $match: {
          "saches.deleted": false,
          saches: { $ne: [] },
        },
      },
      { $count: "total" },
    ]);

    return nxbWithBooks[0]?.total || 0;
  }

  /**
   * Top nhà xuất bản theo số lượng sách
   */
  static async getTopNXBByBooks(limit = 10) {
    return await NhaXuatBan.aggregate([
      { $match: { deleted: false } },
      {
        $lookup: {
          from: "saches",
          localField: "_id",
          foreignField: "MaNXB",
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
          tongSoQuyen: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$saches",
                    cond: { $eq: ["$$this.deleted", false] },
                  },
                },
                as: "sach",
                in: "$$sach.SoQuyen",
              },
            },
          },
        },
      },
      {
        $project: {
          TenNXB: 1,
          DiaChi: 1,
          soLuongSach: 1,
          tongSoQuyen: 1,
          createdAt: 1,
        },
      },
      { $sort: { soLuongSach: -1 } },
      { $limit: parseInt(limit) },
    ]);
  }

  /**
   * Validate dữ liệu nhà xuất bản
   */
  static validateNhaXuatBanData(data) {
    const { TenNXB, DiaChi } = data;

    if (!TenNXB || TenNXB.trim().length === 0) {
      throw new Error("Tên nhà xuất bản không được để trống");
    }

    if (!DiaChi || DiaChi.trim().length === 0) {
      throw new Error("Địa chỉ không được để trống");
    }

    if (TenNXB.trim().length < 2) {
      throw new Error("Tên nhà xuất bản phải có ít nhất 2 ký tự");
    }

    if (DiaChi.trim().length < 5) {
      throw new Error("Địa chỉ phải có ít nhất 5 ký tự");
    }
  }

  /**
   * Lấy option sắp xếp
   */
  static getSortOption(sort) {
    const sortOptions = {
      [SORT_OPTIONS.NEWEST]: { createdAt: -1 },
      [SORT_OPTIONS.OLDEST]: { createdAt: 1 },
      [SORT_OPTIONS.A_TO_Z]: { TenNXB: 1 },
      [SORT_OPTIONS.Z_TO_A]: { TenNXB: -1 },
    };

    return sortOptions[sort] || sortOptions[SORT_OPTIONS.NEWEST];
  }

  /**
   * Tìm kiếm nhà xuất bản theo tên
   */
  static async searchByName(name) {
    return await NhaXuatBan.find({
      TenNXB: { $regex: name, $options: "i" },
      deleted: false,
    })
      .select("_id TenNXB DiaChi")
      .sort({ TenNXB: 1 })
      .limit(10);
  }

  /**
   * Lấy sách của nhà xuất bản
   */
  static async getBooksOfNXB(nxbId, queryParams = {}) {
    const Sach = require("../models/Sach.model");
    const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } =
      queryParams;

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    const [saches, total] = await Promise.all([
      Sach.find({ MaNXB: nxbId, deleted: false })
        .populate("MaDM", "TenDM")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Sach.countDocuments({ MaNXB: nxbId, deleted: false }),
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
}

module.exports = NhaXuatBanService;
