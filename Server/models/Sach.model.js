const mongoose = require("mongoose");

const SachSchema = new mongoose.Schema(
  {
    MaSach: {
      type: String,
      unique: true,
      default: function () {
        // Tự động tạo MaSach theo format: S + timestamp
        return "S" + Date.now();
      },
    },
    TenSach: { type: String, required: true },
    MoTa: { type: String, required: true },
    DonGia: { type: Number, required: true },
    SoQuyen: { type: Number, required: true },
    NamXuatBan: { type: Number, required: true },
    TacGia: { type: String, required: true },
    BiaSach: { type: String, default: "" },
    MaNXB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NhaXuatBan",
      required: true,
    },
    MaDM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DanhMuc",
      required: true,
    },
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

module.exports = mongoose.model("Sach", SachSchema);
