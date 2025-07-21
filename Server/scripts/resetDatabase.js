const mongoose = require("mongoose");
require("dotenv").config();

const resetDatabase = async () => {
  try {
    // Kết nối database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("🔗 Kết nối MongoDB thành công");

    console.log("🗑️  Đang xóa tất cả collections và indexes...");

    // Drop toàn bộ database
    await mongoose.connection.db.dropDatabase();
    console.log("   ✅ Đã xóa toàn bộ database");

    console.log("🎉 Reset database hoàn thành!");
    console.log("💡 Bây giờ bạn có thể chạy: npm run seed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi reset database:", error.message);
    process.exit(1);
  }
};

resetDatabase();
