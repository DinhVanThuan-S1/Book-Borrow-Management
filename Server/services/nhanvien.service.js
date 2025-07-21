const NhanVien = require("../models/NhanVien.model");
const { PAGINATION, SORT_OPTIONS, CHUC_VU } = require("../utils/constants");

/**
 * NhanVien Service
 * Service xử lý logic nghiệp vụ cho nhân viên
 */
class NhanVienService {
  /**
   * Lấy danh sách nhân viên với phân trang và tìm kiếm
   */
  static async getNhanViens(queryParams) {
    const {
      page = PAGINATION.DEFAULT_PAGE,
      limit = PAGINATION.DEFAULT_LIMIT,
      search = "",
      sort = SORT_OPTIONS.NEWEST,
      chucvu = "",
    } = queryParams;

    const query = { deleted: false };

    // Tìm kiếm theo tên, email, số điện thoại
    if (search) {
      query.$or = [
        { HoTenNV: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
        { SoDienThoai: { $regex: search, $options: "i" } },
      ];
    }

    // Lọc theo chức vụ
    if (chucvu && Object.values(CHUC_VU).includes(chucvu)) {
      query.ChucVu = chucvu;
    }

    // Sắp xếp
    const sortOption = this.getSortOption(sort);

    const skip = (page - 1) * limit;
    const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);

    const [nhanviens, total] = await Promise.all([
      NhanVien.find(query)
        .select("-Password") // Không trả về password
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      NhanVien.countDocuments(query),
    ]);

    return {
      nhanviens,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limitNum),
        total,
        limit: limitNum,
      },
    };
  }

  /**
   * Lấy nhân viên theo ID
   */
  static async getNhanVienById(id) {
    const nhanvien = await NhanVien.findOne({
      _id: id,
      deleted: false,
    }).select("-Password");

    if (!nhanvien) {
      throw new Error("Không tìm thấy nhân viên");
    }

    return nhanvien;
  }

  /**
   * Tạo nhân viên mới
   */
  static async createNhanVien(nhanvienData) {
    const { HoTenNV, Email, Password, ChucVu, DiaChi, SoDienThoai } =
      nhanvienData;

    // Validate dữ liệu
    this.validateNhanVienData(nhanvienData);

    // Kiểm tra email đã tồn tại
    const existingNhanVien = await NhanVien.findOne({ Email, deleted: false });
    if (existingNhanVien) {
      throw new Error("Email đã được sử dụng");
    }

    const nhanvien = new NhanVien({
      HoTenNV: HoTenNV.trim(),
      Email: Email.toLowerCase().trim(),
      Password,
      ChucVu: ChucVu || CHUC_VU.NHAN_VIEN,
      DiaChi: DiaChi.trim(),
      SoDienThoai: SoDienThoai.trim(),
    });

    await nhanvien.save();

    // Trả về thông tin không có password
    return await NhanVien.findById(nhanvien._id).select("-Password");
  }

  /**
   * Cập nhật thông tin nhân viên
   */
  static async updateNhanVien(id, nhanvienData, isOwner = false) {
    const { HoTenNV, Email, ChucVu, DiaChi, SoDienThoai } = nhanvienData;

    // Tìm nhân viên hiện tại
    const currentNhanVien = await NhanVien.findOne({
      _id: id,
      deleted: false,
    });

    if (!currentNhanVien) {
      throw new Error("Không tìm thấy nhân viên");
    }

    // Validate dữ liệu cơ bản
    if (!HoTenNV || !DiaChi || !SoDienThoai) {
      throw new Error("Tên, địa chỉ và số điện thoại là bắt buộc");
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      HoTenNV: HoTenNV.trim(),
      DiaChi: DiaChi.trim(),
      SoDienThoai: SoDienThoai.trim(),
    };

    // Chỉ admin mới có thể thay đổi email và chức vụ
    if (!isOwner) {
      if (Email && Email !== currentNhanVien.Email) {
        // Kiểm tra email mới có trùng không
        const existingNhanVien = await NhanVien.findOne({
          Email: Email.toLowerCase().trim(),
          deleted: false,
          _id: { $ne: id },
        });

        if (existingNhanVien) {
          throw new Error("Email đã được sử dụng");
        }

        updateData.Email = Email.toLowerCase().trim();
      }

      if (ChucVu && Object.values(CHUC_VU).includes(ChucVu)) {
        updateData.ChucVu = ChucVu;
      }
    }

    const nhanvien = await NhanVien.findOneAndUpdate(
      { _id: id, deleted: false },
      updateData,
      { new: true, runValidators: true }
    ).select("-Password");

    return nhanvien;
  }

  /**
   * Cập nhật avatar
   */
  static async updateAvatar(id, avatarPath) {
    const nhanvien = await NhanVien.findOneAndUpdate(
      { _id: id, deleted: false },
      { Avatar: avatarPath },
      { new: true }
    ).select("-Password");

    if (!nhanvien) {
      throw new Error("Không tìm thấy nhân viên");
    }

    return nhanvien;
  }

  /**
   * Xóa mềm nhân viên
   */
  static async deleteNhanVien(id) {
    // Kiểm tra xem có phải admin cuối cùng không
    const adminCount = await NhanVien.countDocuments({
      ChucVu: CHUC_VU.ADMIN,
      deleted: false,
    });

    const nhanvien = await NhanVien.findById(id);
    if (nhanvien && nhanvien.ChucVu === CHUC_VU.ADMIN && adminCount <= 1) {
      throw new Error("Không thể xóa admin cuối cùng trong hệ thống");
    }

    // Kiểm tra xem nhân viên có tạo dữ liệu nào không
    const DanhMuc = require("../models/DanhMuc.model");
    const Sach = require("../models/Sach.model");

    const [danhMucCount, sachCount] = await Promise.all([
      DanhMuc.countDocuments({ NguoiTao: id, deleted: false }),
      Sach.countDocuments({ NguoiTao: id, deleted: false }),
    ]);

    if (danhMucCount > 0 || sachCount > 0) {
      throw new Error(
        `Không thể xóa nhân viên này vì đã tạo ${danhMucCount} danh mục và ${sachCount} sách`
      );
    }

    const deletedNhanVien = await NhanVien.findOneAndUpdate(
      { _id: id, deleted: false },
      { deleted: true },
      { new: true }
    );

    if (!deletedNhanVien) {
      throw new Error("Không tìm thấy nhân viên");
    }

    return deletedNhanVien;
  }

  /**
   * Thay đổi chức vụ
   */
  static async changeRole(id, newRole) {
    if (!Object.values(CHUC_VU).includes(newRole)) {
      throw new Error("Chức vụ không hợp lệ");
    }

    // Nếu hạ cấp admin, kiểm tra còn admin nào khác không
    const nhanvien = await NhanVien.findById(id);
    if (
      nhanvien &&
      nhanvien.ChucVu === CHUC_VU.ADMIN &&
      newRole !== CHUC_VU.ADMIN
    ) {
      const adminCount = await NhanVien.countDocuments({
        ChucVu: CHUC_VU.ADMIN,
        deleted: false,
      });

      if (adminCount <= 1) {
        throw new Error("Không thể hạ cấp admin cuối cùng trong hệ thống");
      }
    }

    const updatedNhanVien = await NhanVien.findOneAndUpdate(
      { _id: id, deleted: false },
      { ChucVu: newRole },
      { new: true }
    ).select("-Password");

    if (!updatedNhanVien) {
      throw new Error("Không tìm thấy nhân viên");
    }

    return updatedNhanVien;
  }

  /**
   * Lấy thống kê nhân viên
   */
  static async getNhanVienStats() {
    const [totalNhanVien, roleStats, recentNhanViens, activityStats] =
      await Promise.all([
        // Tổng số nhân viên
        NhanVien.countDocuments({ deleted: false }),

        // Thống kê theo chức vụ
        NhanVien.aggregate([
          { $match: { deleted: false } },
          { $group: { _id: "$ChucVu", count: { $sum: 1 } } },
        ]),

        // Nhân viên mới nhất
        NhanVien.find({ deleted: false })
          .select("-Password")
          .sort({ createdAt: -1 })
          .limit(5),

        // Thống kê hoạt động
        this.getActivityStats(),
      ]);

    return {
      totalNhanVien,
      roleStats: this.formatRoleStats(roleStats),
      recentNhanViens,
      activityStats,
    };
  }

  /**
   * Validate dữ liệu nhân viên
   */
  static validateNhanVienData(data) {
    const { HoTenNV, Email, Password, DiaChi, SoDienThoai, ChucVu } = data;

    if (!HoTenNV || !Email || !Password || !DiaChi || !SoDienThoai) {
      throw new Error("Tất cả các trường thông tin là bắt buộc");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(Email)) {
      throw new Error("Email không hợp lệ");
    }

    // Validate phone number
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(SoDienThoai)) {
      throw new Error("Số điện thoại không hợp lệ");
    }

    // Validate chức vụ
    if (ChucVu && !Object.values(CHUC_VU).includes(ChucVu)) {
      throw new Error("Chức vụ không hợp lệ");
    }

    // Validate password
    if (Password.length < 6) {
      throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
    }
  }

  /**
   * Lấy option sắp xếp
   */
  static getSortOption(sort) {
    const sortOptions = {
      [SORT_OPTIONS.NEWEST]: { createdAt: -1 },
      [SORT_OPTIONS.OLDEST]: { createdAt: 1 },
      [SORT_OPTIONS.A_TO_Z]: { HoTenNV: 1 },
      [SORT_OPTIONS.Z_TO_A]: { HoTenNV: -1 },
    };

    return sortOptions[sort] || sortOptions[SORT_OPTIONS.NEWEST];
  }

  /**
   * Format thống kê chức vụ
   */
  static formatRoleStats(stats) {
    const formatted = {
      [CHUC_VU.ADMIN]: 0,
      [CHUC_VU.NHAN_VIEN]: 0,
    };

    stats.forEach((stat) => {
      if (formatted.hasOwnProperty(stat._id)) {
        formatted[stat._id] = stat.count;
      }
    });

    return formatted;
  }

  /**
   * Thống kê hoạt động của nhân viên
   */
  static async getActivityStats() {
    const DanhMuc = require("../models/DanhMuc.model");
    const Sach = require("../models/Sach.model");

    return await NhanVien.aggregate([
      { $match: { deleted: false } },
      {
        $lookup: {
          from: "danhmucs",
          localField: "_id",
          foreignField: "NguoiTao",
          as: "danhmucs",
        },
      },
      {
        $lookup: {
          from: "saches",
          localField: "_id",
          foreignField: "NguoiTao",
          as: "saches",
        },
      },
      {
        $addFields: {
          soDanhMucTao: {
            $size: {
              $filter: {
                input: "$danhmucs",
                cond: { $eq: ["$$this.deleted", false] },
              },
            },
          },
          soSachTao: {
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
          HoTenNV: 1,
          Email: 1,
          ChucVu: 1,
          soDanhMucTao: 1,
          soSachTao: 1,
          tongHoatDong: { $add: ["$soDanhMucTao", "$soSachTao"] },
        },
      },
      { $sort: { tongHoatDong: -1 } },
    ]);
  }

  /**
   * Tìm kiếm nhân viên theo email
   */
  static async findByEmail(email) {
    return await NhanVien.findOne({
      Email: email.toLowerCase().trim(),
      deleted: false,
    }).select("-Password");
  }
}

module.exports = NhanVienService;
