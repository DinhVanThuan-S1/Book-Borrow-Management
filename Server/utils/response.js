/**
 * Utility functions for API responses
 * Các hàm tiện ích cho phản hồi API
 */

class ApiResponse {
  static success(res, data = null, message = "Thành công", statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(
    res,
    message = "Có lỗi xảy ra",
    statusCode = 500,
    errors = null
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }

  static paginated(res, data, pagination, message = "Lấy dữ liệu thành công") {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString(),
    });
  }

  static created(res, data, message = "Tạo mới thành công") {
    return this.success(res, data, message, 201);
  }

  static notFound(res, message = "Không tìm thấy dữ liệu") {
    return this.error(res, message, 404);
  }

  static badRequest(res, message = "Dữ liệu không hợp lệ", errors = null) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res, message = "Không có quyền truy cập") {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = "Bị cấm truy cập") {
    return this.error(res, message, 403);
  }
}

module.exports = ApiResponse;
