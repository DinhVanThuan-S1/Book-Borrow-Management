const mongoose = require("mongoose");

const YeuThichSchema = new mongoose.Schema(
  {
    MaDocGia: { type: mongoose.Schema.Types.ObjectId, ref: "DocGia" },
    DanhSachSach: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sach" }],
    deleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("YeuThich", YeuThichSchema);
