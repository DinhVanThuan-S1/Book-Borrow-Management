const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const NhanVien = require("../models/NhanVien.model");
const DocGia = require("../models/DocGia.model");
const NhaXuatBan = require("../models/NhaXuatBan.model");
const DanhMuc = require("../models/DanhMuc.model");
const Sach = require("../models/Sach.model");

// Kết nối database
mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    console.log("🌱 Bắt đầu khởi tạo dữ liệu mẫu...");

    // Xóa dữ liệu cũ nếu có
    console.log("🗑️  Đang xóa dữ liệu cũ...");
    await Promise.all([
      NhanVien.deleteMany({}),
      DocGia.deleteMany({}),
      NhaXuatBan.deleteMany({}),
      DanhMuc.deleteMany({}),
      Sach.deleteMany({}),
    ]);

    // Tạo admin mặc định
    console.log("👑 Tạo admin...");
    const admin = new NhanVien({
      HoTenNV: "Admin Hệ Thống",
      Email: "admin@library.com",
      Password: "admin123",
      ChucVu: "Admin",
      DiaChi: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
      SoDienThoai: "0123456789",
    });
    await admin.save();
    console.log(`   ✅ Admin: ${admin.MSNV} - ${admin.Email}`);

    // Tạo nhân viên mẫu
    console.log("👨‍💼 Tạo nhân viên...");
    const nhanVien = new NhanVien({
      HoTenNV: "Nguyễn Văn Nhân Viên",
      Email: "nhanvien@library.com",
      Password: "nhanvien123",
      ChucVu: "NhanVien",
      DiaChi: "123 Nguyễn Huệ, Quận 1, TP.HCM",
      SoDienThoai: "0987654321",
    });
    await nhanVien.save();
    console.log(`   ✅ Nhân viên: ${nhanVien.MSNV} - ${nhanVien.Email}`);

    // Tạo nhà xuất bản mẫu
    console.log("🏢 Tạo nhà xuất bản...");
    const nxbList = [];
    const nxbData = [
      { TenNXB: "NXB Trẻ", DiaChi: "161B Lý Chính Thắng, Quận 3, TP.HCM" },
      {
        TenNXB: "NXB Kim Đồng",
        DiaChi: "55 Quang Trung, Hai Bà Trưng, Hà Nội",
      },
      {
        TenNXB: "NXB Giáo dục Việt Nam",
        DiaChi: "81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
      },
      {
        TenNXB: "NXB Thế Giới",
        DiaChi: "7 Nguyễn Thị Minh Khai, Quận 1, TP.HCM",
      },
      { TenNXB: "NXB Văn học", DiaChi: "18 Nguyễn Trường Tộ, Ba Đình, Hà Nội" },
    ];

    for (const data of nxbData) {
      const nxb = new NhaXuatBan(data);
      await nxb.save();
      nxbList.push(nxb);
      console.log(`   ✅ NXB: ${nxb.MaNXB} - ${nxb.TenNXB}`);
    }

    // Tạo danh mục mẫu
    console.log("📚 Tạo danh mục sách...");
    const danhMucList = [];
    const dmData = [
      {
        TenDM: "Văn học",
        MoTa: "Sách văn học trong nước và nước ngoài",
        NguoiTao: admin._id,
      },
      {
        TenDM: "Khoa học công nghệ",
        MoTa: "Sách khoa học kỹ thuật và công nghệ thông tin",
        NguoiTao: admin._id,
      },
      {
        TenDM: "Lịch sử",
        MoTa: "Sách lịch sử Việt Nam và thế giới",
        NguoiTao: admin._id,
      },
      {
        TenDM: "Kinh tế",
        MoTa: "Sách về kinh tế, quản lý và kinh doanh",
        NguoiTao: admin._id,
      },
      {
        TenDM: "Thiếu nhi",
        MoTa: "Sách dành cho trẻ em và thiếu niên",
        NguoiTao: nhanVien._id,
      },
      {
        TenDM: "Y học",
        MoTa: "Sách về y học và sức khỏe",
        NguoiTao: admin._id,
      },
      {
        TenDM: "Tâm lý học",
        MoTa: "Sách về tâm lý học và phát triển bản thân",
        NguoiTao: nhanVien._id,
      },
    ];

    for (const data of dmData) {
      const dm = new DanhMuc(data);
      await dm.save();
      danhMucList.push(dm);
      console.log(`   ✅ Danh mục: ${dm.MaDM} - ${dm.TenDM}`);
    }

    // Tạo sách mẫu
    console.log("📖 Tạo sách...");
    const sachList = [];
    const sachData = [
      {
        TenSach: "Tôi thấy hoa vàng trên cỏ xanh",
        MoTa: "Tiểu thuyết nổi tiếng của Nguyễn Nhật Ánh về tuổi thơ đầy cảm xúc",
        DonGia: 85000,
        SoQuyen: 15,
        NamXuatBan: 2010,
        TacGia: "Nguyễn Nhật Ánh",
        MaNXB: nxbList[0]._id,
        MaDM: danhMucList[0]._id,
        NguoiTao: admin._id,
      },
      {
        TenSach: "Lập trình JavaScript từ A đến Z",
        MoTa: "Hướng dẫn lập trình JavaScript từ cơ bản đến nâng cao với các ví dụ thực tế",
        DonGia: 120000,
        SoQuyen: 8,
        NamXuatBan: 2023,
        TacGia: "Nguyễn Văn Dev",
        MaNXB: nxbList[1]._id,
        MaDM: danhMucList[1]._id,
        NguoiTao: admin._id,
      },
      {
        TenSach: "Lịch sử Việt Nam",
        MoTa: "Tìm hiểu về lịch sử dân tộc Việt Nam qua các thời kỳ phát triển",
        DonGia: 95000,
        SoQuyen: 12,
        NamXuatBan: 2022,
        TacGia: "GS. Phan Huy Lê",
        MaNXB: nxbList[2]._id,
        MaDM: danhMucList[2]._id,
        NguoiTao: nhanVien._id,
      },
      {
        TenSach: "Kinh tế học vi mô",
        MoTa: "Giáo trình kinh tế học vi mô dành cho sinh viên và người quan tâm",
        DonGia: 150000,
        SoQuyen: 6,
        NamXuatBan: 2023,
        TacGia: "TS. Nguyễn Văn Kinh",
        MaNXB: nxbList[3]._id,
        MaDM: danhMucList[3]._id,
        NguoiTao: admin._id,
      },
      {
        TenSach: "Doraemon - Nobita và vương quốc robot",
        MoTa: "Truyện tranh Doraemon dành cho thiếu nhi với những cuộc phiêu lưu thú vị",
        DonGia: 25000,
        SoQuyen: 20,
        NamXuatBan: 2023,
        TacGia: "Fujiko F. Fujio",
        MaNXB: nxbList[1]._id,
        MaDM: danhMucList[4]._id,
        NguoiTao: nhanVien._id,
      },
      {
        TenSach: "Node.js và MongoDB - Xây dựng ứng dụng Web",
        MoTa: "Hướng dẫn chi tiết xây dựng ứng dụng web với Node.js và MongoDB",
        DonGia: 135000,
        SoQuyen: 10,
        NamXuatBan: 2024,
        TacGia: "Đinh Văn Thuận",
        MaNXB: nxbList[1]._id,
        MaDM: danhMucList[1]._id,
        NguoiTao: admin._id,
      },
      {
        TenSach: "Giải phẫu sinh lý học người",
        MoTa: "Sách giáo khoa về giải phẫu và sinh lý học cơ thể người",
        DonGia: 180000,
        SoQuyen: 5,
        NamXuatBan: 2023,
        TacGia: "BS. Trần Văn Y",
        MaNXB: nxbList[2]._id,
        MaDM: danhMucList[5]._id,
        NguoiTao: admin._id,
      },
      {
        TenSach: "Đắc Nhân Tâm",
        MoTa: "Cuốn sách kinh điển về nghệ thuật giao tiếp và ứng xử",
        DonGia: 90000,
        SoQuyen: 25,
        NamXuatBan: 2020,
        TacGia: "Dale Carnegie",
        MaNXB: nxbList[4]._id,
        MaDM: danhMucList[6]._id,
        NguoiTao: nhanVien._id,
      },
      {
        TenSach: "Nhà giả kim",
        MoTa: "Tiểu thuyết nổi tiếng về hành trình tìm kiếm ước mơ",
        DonGia: 75000,
        SoQuyen: 18,
        NamXuatBan: 2019,
        TacGia: "Paulo Coelho",
        MaNXB: nxbList[4]._id,
        MaDM: danhMucList[0]._id,
        NguoiTao: admin._id,
      },
      {
        TenSach: "React.js - Xây dựng giao diện người dùng",
        MoTa: "Hướng dẫn toàn diện về React.js cho frontend developers",
        DonGia: 140000,
        SoQuyen: 7,
        NamXuatBan: 2024,
        TacGia: "Lê Văn Frontend",
        MaNXB: nxbList[1]._id,
        MaDM: danhMucList[1]._id,
        NguoiTao: admin._id,
      },
    ];

    for (const data of sachData) {
      const sach = new Sach(data);
      await sach.save();
      sachList.push(sach);
      console.log(`   ✅ Sách: ${sach.MaSach} - ${sach.TenSach}`);
    }

    // Tạo độc giả mẫu
    console.log("👤 Tạo độc giả...");
    const docgiaList = [];
    const docgiaData = [
      {
        HoLot: "Nguyễn Văn",
        Ten: "An",
        Email: "docgia1@test.com",
        Password: "123456",
        NgaySinh: new Date("1995-01-01"),
        Phai: "Nam",
        DiaChi: "Số 15 Lê Lợi, Quận 1, TP.HCM",
        DienThoai: "0987654321",
      },
      {
        HoLot: "Trần Thị",
        Ten: "Bình",
        Email: "docgia2@test.com",
        Password: "123456",
        NgaySinh: new Date("1998-05-15"),
        Phai: "Nữ",
        DiaChi: "Số 25 Trần Duy Hưng, Cầu Giấy, Hà Nội",
        DienThoai: "0976543210",
      },
      {
        HoLot: "Lê Minh",
        Ten: "Cường",
        Email: "docgia3@test.com",
        Password: "123456",
        NgaySinh: new Date("1992-12-20"),
        Phai: "Nam",
        DiaChi: "Số 78 Nguyễn Thái Học, Quận 1, TP.HCM",
        DienThoai: "0965432109",
      },
      {
        HoLot: "Phạm Thị",
        Ten: "Dung",
        Email: "docgia4@test.com",
        Password: "123456",
        NgaySinh: new Date("1996-08-10"),
        Phai: "Nữ",
        DiaChi: "Số 45 Hoàng Quốc Việt, Cầu Giấy, Hà Nội",
        DienThoai: "0954321098",
      },
      {
        HoLot: "Hoàng Văn",
        Ten: "Đức",
        Email: "docgia5@test.com",
        Password: "123456",
        NgaySinh: new Date("1994-03-25"),
        Phai: "Nam",
        DiaChi: "Số 89 Pasteur, Quận 3, TP.HCM",
        DienThoai: "0943210987",
      },
    ];

    for (const data of docgiaData) {
      const docgia = new DocGia(data);
      await docgia.save();
      docgiaList.push(docgia);
      console.log(`   ✅ Độc giả: ${docgia.MaDocGia} - ${docgia.Email}`);
    }

    console.log("🎉 Khởi tạo dữ liệu mẫu hoàn thành!");
    console.log("");
    console.log("📝 THÔNG TIN ĐĂNG NHẬP:");
    console.log("─".repeat(60));
    console.log("👑 ADMIN:");
    console.log(`   📧 Email: admin@library.com`);
    console.log(`   🔑 Password: admin123`);
    console.log(`   🆔 MSNV: ${admin.MSNV}`);
    console.log("");
    console.log("👨‍💼 NHÂN VIÊN:");
    console.log(`   📧 Email: nhanvien@library.com`);
    console.log(`   🔑 Password: nhanvien123`);
    console.log(`   🆔 MSNV: ${nhanVien.MSNV}`);
    console.log("");
    console.log("👤 ĐỘC GIẢ:");
    docgiaList.forEach((dg, index) => {
      console.log(
        `   ${index + 1}. 📧 ${dg.Email} | 🔑 123456 | 🆔 ${dg.MaDocGia}`
      );
    });
    console.log("");
    console.log("📊 THỐNG KÊ DỮ LIỆU:");
    console.log("─".repeat(60));
    console.log(`📚 ${danhMucList.length} danh mục sách`);
    console.log(`🏢 ${nxbList.length} nhà xuất bản`);
    console.log(`📖 ${sachList.length} đầu sách`);
    console.log(`👤 ${docgiaList.length} độc giả`);
    console.log(`👨‍💼 2 nhân viên (1 admin + 1 nhân viên)`);
    console.log("");
    console.log("🆔 MÃ SỐ ĐƯỢC TẠO:");
    console.log("─".repeat(60));
    console.log("📚 Danh mục:");
    danhMucList.forEach((dm) => console.log(`   ${dm.MaDM} - ${dm.TenDM}`));
    console.log("🏢 Nhà xuất bản:");
    nxbList.forEach((nxb) => console.log(`   ${nxb.MaNXB} - ${nxb.TenNXB}`));
    console.log("📖 Sách:");
    sachList.forEach((sach) =>
      console.log(`   ${sach.MaSach} - ${sach.TenSach}`)
    );
    console.log("");
    console.log("🚀 Hệ thống sẵn sàng sử dụng!");
    console.log("🌐 API Base URL: http://localhost:5000/api");
    console.log("📚 Database: QuanLyMuonSach");
    console.log(`⏰ Khởi tạo lúc: ${new Date().toLocaleString("vi-VN")}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khởi tạo dữ liệu:", error);
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
};

seedData();
