const mongoose = require("mongoose");

const DanhMucSchema = new mongoose.Schema(
  {
    MaDM: {
      type: String,
      unique: true,
      default: function () {
        // Tự động tạo MaDM theo format: DM + timestamp
        return "DM" + Date.now();
      },
    },
    TenDM: { type: String, required: true },
    MoTa: { type: String, required: true },
    NguoiTao: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhanVien",
      required: true,
    },
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DanhMuc", DanhMucSchema);
