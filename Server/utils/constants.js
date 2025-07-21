/**
 * Application constants
 * Các hằng số của ứng dụng
 */

module.exports = {
  // Trạng thái mượn sách
  MUON_SACH_STATUS: {
    DA_DUYET: "Đã duyệt",
    TU_CHOI: "Từ chối",
    DA_MUON: "Đã mượn",
    DA_TRA: "Đã trả",
  },

  // Chức vụ nhân viên
  CHUC_VU: {
    ADMIN: "Admin",
    NHAN_VIEN: "NhanVien",
  },

  // Giới tính
  GIOI_TINH: {
    NAM: "Nam",
    NU: "Nữ",
  },

  // Vai trò người dùng
  USER_ROLES: {
    DOC_GIA: "docgia",
    NHAN_VIEN: "nhanvien",
  },

  // Giới hạn mượn sách
  MAX_BOOKS_PER_USER: 5,

  // Thời gian mượn sách (ngày)
  LOAN_PERIOD_DAYS: 10,

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
  },

  // Sort options
  SORT_OPTIONS: {
    NEWEST: "newest",
    OLDEST: "oldest",
    A_TO_Z: "a-z",
    Z_TO_A: "z-a",
    PRICE_LOW: "price-low",
    PRICE_HIGH: "price-high",
  },

  // File upload
  UPLOAD: {
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_MIME_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
    UPLOAD_PATHS: {
      BOOKS: "uploads/books",
      AVATARS: "uploads/avatars",
    },
  },
};
