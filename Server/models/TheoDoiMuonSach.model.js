const mongoose = require("mongoose");

const TheoDoiMuonSachSchema = new mongoose.Schema(
  {
    MaDocGia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DocGia",
      required: true,
    },
    MaSach: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sach",
      required: true,
    },
    NgayMuon: { type: Date, default: Date.now },
    NgayTra: { type: Date },
    TrangThai: {
      type: String,
      enum: ["Đã duyệt", "Từ chối", "Đang mượn", "Đã trả", "Quá hạn"],
      default: "Đã duyệt",
    },
    LyDoTuChoi: { type: String },
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Tự động set ngày trả (10 ngày sau ngày mượn)
TheoDoiMuonSachSchema.pre("save", function (next) {
  if (this.isNew && !this.NgayTra) {
    this.NgayTra = new Date(this.NgayMuon.getTime() + 10 * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model("TheoDoiMuonSach", TheoDoiMuonSachSchema);
