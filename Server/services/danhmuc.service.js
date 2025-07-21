const DanhMuc = require("../models/DanhMuc.model");
const { PAGINATION, SORT_OPTIONS } = require("../utils/constants");

/**
 * DanhMuc Service
 * Service xử lý logic nghiệp vụ cho danh mục
 */
class DanhMucService {
  /**
   * Lấy danh sách danh mục với phân trang và tìm kiếm
   */
  static async getDanhMucs(queryParams) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      search = "",
      sort = SORT_OPTIONS.NEWEST,
    } = queryParams;

    const query = { deleted: false };

    // Tìm kiếm theo tên danh mục
    if (search) {
      query.TenDM = { $regex: search, $options: "i" };
    }

    // Sắp xếp
    const sortOption = this.getSortOption(sort);

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    const [danhmucs, total] = await Promise.all([
      DanhMuc.find(query)
        .populate("NguoiTao", "HoTenNV")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      DanhMuc.countDocuments(query),
    ]);

    return {
      danhmucs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    };
  }

  /**
   * Lấy tất cả danh mục (không phân trang) - cho dropdown
   */
  static async getAllDanhMucs() {
    return await DanhMuc.find({ deleted: false })
      .select("_id TenDM MoTa")
      .sort({ TenDM: 1 });
  }

  /**
   * Lấy danh mục theo ID
   */
  static async getDanhMucById(id) {
    const danhmuc = await DanhMuc.findOne({
      _id: id,
      deleted: false,
    }).populate("NguoiTao", "HoTenNV");

    if (!danhmuc) {
      throw new Error("Không tìm thấy danh mục");
    }

    return danhmuc;
  }

  /**
   * Tạo danh mục mới
   */
  static async createDanhMuc(danhmucData, nguoiTaoId) {
    const { TenDM, MoTa } = danhmucData;

    // Validate dữ liệu
    if (!TenDM || TenDM.trim().length === 0) {
      throw new Error("Tên danh mục không được để trống");
    }

    if (!MoTa || MoTa.trim().length === 0) {
      throw new Error("Mô tả không được để trống");
    }

    // Kiểm tra trùng tên danh mục
    const existingDanhMuc = await DanhMuc.findOne({
      TenDM: TenDM.trim(),
      deleted: false,
    });

    if (existingDanhMuc) {
      throw new Error("Tên danh mục đã tồn tại");
    }

    const danhmuc = new DanhMuc({
      TenDM: TenDM.trim(),
      MoTa: MoTa.trim(),
      NguoiTao: nguoiTaoId,
    });

    await danhmuc.save();
    await danhmuc.populate("NguoiTao", "HoTenNV");

    return danhmuc;
  }

  /**
   * Cập nhật danh mục
   */
  static async updateDanhMuc(id, danhmucData) {
    const { TenDM, MoTa } = danhmucData;

    // Validate dữ liệu
    if (!TenDM || TenDM.trim().length === 0) {
      throw new Error("Tên danh mục không được để trống");
    }

    if (!MoTa || MoTa.trim().length === 0) {
      throw new Error("Mô tả không được để trống");
    }

    // Kiểm tra trùng tên danh mục (trừ chính nó)
    const existingDanhMuc = await DanhMuc.findOne({
      TenDM: TenDM.trim(),
      deleted: false,
      _id: { $ne: id },
    });

    if (existingDanhMuc) {
      throw new Error("Tên danh mục đã tồn tại");
    }

    const danhmuc = await DanhMuc.findOneAndUpdate(
      { _id: id, deleted: false },
      {
        TenDM: TenDM.trim(),
        MoTa: MoTa.trim(),
      },
      { new: true, runValidators: true }
    ).populate("NguoiTao", "HoTenNV");

    if (!danhmuc) {
      throw new Error("Không tìm thấy danh mục");
    }

    return danhmuc;
  }

  /**
   * Xóa mềm danh mục
   */
  static async deleteDanhMuc(id) {
    // Kiểm tra xem có sách nào đang sử dụng danh mục này không
    const Sach = require("../models/Sach.model");
    const sachCount = await Sach.countDocuments({
      MaDM: id,
      deleted: false,
    });

    if (sachCount > 0) {
      throw new Error(
        `Không thể xóa danh mục này vì có ${sachCount} sách đang sử dụng`
      );
    }

    const danhmuc = await DanhMuc.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );

    if (!danhmuc) {
      throw new Error("Không tìm thấy danh mục");
    }

    return danhmuc;
  }

  /**
   * Lấy option sắp xếp
   */
  static getSortOption(sort) {
    const sortOptions = {
      [SORT_OPTIONS.NEWEST]: { createdAt: -1 },
      [SORT_OPTIONS.OLDEST]: { createdAt: 1 },
      [SORT_OPTIONS.A_TO_Z]: { TenDM: 1 },
      [SORT_OPTIONS.Z_TO_A]: { TenDM: -1 },
    };

    return sortOptions[sort] || sortOptions[SORT_OPTIONS.NEWEST];
  }

  /**
   * Thống kê danh mục
   */
  static async getDanhMucStats() {
    const Sach = require("../models/Sach.model");

    const stats = await DanhMuc.aggregate([
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
        $project: {
          TenDM: 1,
          MoTa: 1,
          soLuongSach: 1,
          createdAt: 1,
        },
      },
      { $sort: { soLuongSach: -1 } },
    ]);

    return stats;
  }
}

module.exports = DanhMucService;
