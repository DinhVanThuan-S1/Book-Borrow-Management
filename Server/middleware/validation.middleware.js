const { body, validationResult } = require("express-validator");
const ApiResponse = require("../utils/response");

/**
 * Middleware validation
 * Middleware xử lý validation cho các request
 */

// Validation cho đăng ký độc giả
exports.validateDocGiaRegistration = [
  body("HoLot").notEmpty().withMessage("Họ lót không được để trống"),
  body("Ten").notEmpty().withMessage("Tên không được để trống"),
  body("Email").isEmail().withMessage("Email không hợp lệ"),
  body("Password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),
  body("NgaySinh").isDate().withMessage("Ngày sinh không hợp lệ"),
  body("Phai").isIn(["Nam", "Nữ"]).withMessage("Giới tính không hợp lệ"),
  body("DiaChi").notEmpty().withMessage("Địa chỉ không được để trống"),
  body("DienThoai")
    .isMobilePhone("vi-VN")
    .withMessage("Số điện thoại không hợp lệ"),
  this.handleValidationErrors,
];

// Validation cho đăng nhập
exports.validateLogin = [
  body("Email").isEmail().withMessage("Email không hợp lệ"),
  body("Password").notEmpty().withMessage("Mật khẩu không được để trống"),
  this.handleValidationErrors,
];

// Validation cho tạo sách
exports.validateSach = [
  body("TenSach").notEmpty().withMessage("Tên sách không được để trống"),
  body("MoTa").notEmpty().withMessage("Mô tả không được để trống"),
  body("DonGia").isFloat({ min: 0 }).withMessage("Đơn giá phải là số dương"),
  body("SoQuyen")
    .isInt({ min: 0 })
    .withMessage("Số quyển phải là số nguyên dương"),
  body("NamXuatBan")
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage("Năm xuất bản không hợp lệ"),
  body("TacGia").notEmpty().withMessage("Tác giả không được để trống"),
  body("MaNXB").isMongoId().withMessage("Mã nhà xuất bản không hợp lệ"),
  body("MaDM").isMongoId().withMessage("Mã danh mục không hợp lệ"),
  this.handleValidationErrors,
];

// Validation cho tạo danh mục
exports.validateDanhMuc = [
  body("TenDM").notEmpty().withMessage("Tên danh mục không được để trống"),
  body("MoTa").notEmpty().withMessage("Mô tả không được để trống"),
  this.handleValidationErrors,
];

// Xử lý lỗi validation
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => ({
      field: error.param,
      message: error.msg,
    }));

    return ApiResponse.badRequest(res, "Dữ liệu không hợp lệ", errorMessages);
  }
  next();
};
