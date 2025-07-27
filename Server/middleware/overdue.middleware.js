const MuonSachService = require("../services/muonsach.service");

/**
 * Middleware tự động cập nhật trạng thái quá hạn
 * Chạy mỗi khi có request đến API liên quan đến mượn sách
 */
const updateOverdueStatus = async (req, res, next) => {
  try {
    // Chỉ cập nhật trạng thái quá hạn khi có GET request (để tránh spam)
    if (req.method === "GET") {
      await MuonSachService.updateOverdueStatus();
    }
    next();
  } catch (error) {
    // Không fail request nếu việc cập nhật quá hạn bị lỗi
    console.error("Lỗi khi cập nhật trạng thái quá hạn:", error);
    next();
  }
};

module.exports = {
  updateOverdueStatus,
};
