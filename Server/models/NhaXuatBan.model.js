const mongoose = require("mongoose");

const NhaXuatBanSchema = new mongoose.Schema(
  {
    MaNXB: {
      type: String,
      unique: true,
      default: function () {
        // Tự động tạo MaNXB theo format: NXB + timestamp
        return "NXB" + Date.now();
      },
    },
    TenNXB: { type: String, required: true },
    DiaChi: { type: String, required: true },
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("NhaXuatBan", NhaXuatBanSchema);
