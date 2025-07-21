Quản lý mượn sách

1. Công nghệ sử dụng
   Frontend (Client + Admin): Vue.js 3, Bootstrap, CSS
   Backend: Node.js + Express.js
   Cơ sở dữ liệu: MongoDB
   Mô hình triển khai: MEVN Stack
2. Cơ sở dữ liệu

- Yêu cầu
  DB : QuanLyMuonSach
  Docgia: MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai
  Sach: MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, TacGia
  NhaXuatBan: MaNXB, TenNXB, DiaChi
  TheoDoiMuonSach: MaDocGia, MaSach, NgayMuon, NgayTra
  NhanVien: MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai

* Có thể mở rộng thêm các collection và thuộc tính

- Tôi tự mở rộng
  DanhMuc: MaDM, TenDM, MoTa
  YeuThich: Array Sach, ID DocGia (Nếu có)

3. Admin
   3.1. Đăng nhập, Đăng xuất.
   3.2. Tổng quan : Thống kê số lượng tài khoản, số lượng sách trong kho, số lượng sách được mượn.
   3.3. Quản lý danh mục sách : Thêm/sửa/xóa danh mục sách. Xem chi tiết danh mục. Tìm kiếm danh mục. Phân trang (Mỗi trang chỉ hiển thị 10 danh mục sách). Sắp xếp theo mới nhất, cũ nhất, A-Z, Z-A.

- Danh mục (Mã danh mục, Tên danh mục, Mô tả, Ngày tạo, Người tạo (Theo MSNV)).
  3.4. Quản lý sách : Thêm/sửa/xóa sách. Xem chi tiết sách. Tìm kiếm sách. Lọc sách theo danh mục. Phân trang (Mỗi trang chỉ hiển thị 10 sách). Sắp xếp theo mới nhất, cũ nhất, A-Z, Z-A.
- Sách (Mã sách, Bìa sách, Tên sách, Mô tả (Ẩn), Giá, Số quyển, Tác giả, Tên nhà xuất bản, Thuộc danh mục nào, Ngày tạo, Người tạo (Theo MSNV)). Mô tả sẽ bị ẩn chỉ khi nhấn xem chi tiết mới hiển thị
  3.5. Quản lý tài khoản (DocGia + NhanVien) : Thêm/sửa/xóa tài khoản. Xem chi tiết tài khoản. Thay đổi quyền tài khoản (Admin + User). Tìm kiếm tài khoản. Phân trang (Mỗi trang chỉ hiển thị 10 tài khoản). Sắp xếp theo mới nhất, cũ nhất, A-Z, Z-A.
- Tài khoản (Mã tài khoản, Avatar, Tên tài khoản, Email, Vai trò, Họ tên, Tuổi, Giới tính, Số điện thoại, Địa chỉ).
  3.6. Quản lý mượn sách : Thay đổi trạng thái. Phân trang (Mỗi trang chỉ hiển thị 10 yêu cầu mượn (Phiếu mượn)). Tìm kiếm phiếu mượn. Lọc theo trạng thái (Đã duyệt, Từ chối, Đã mượn, Đã trả). Sắp xếp theo mới nhất, cũ nhất, A-Z, Z-A.
- Phiếu mượn (Tên độc giả mượn sách, Bìa sách, Tên sách, Ngày mượn, Ngày trả (Tự động đặt 10 ngày sau ngày mượn), Trạng thái).
- Khi độc giả đăng ký mượn sách, hệ thống sẽ kiểm tra tính hợp lệ (Còn sách + Tài khoản chưa vượt quá 5 lần mượn, tức là mỗi tài khoản chỉ có thể đang mượn 5 quyển), sau đó tự động Duyệt hoặc Từ chối.
- Quy trình mượn sách cơ bản:
  TrangThai (Đã duyệt | Từ chối | Đã mượn | Đã trả)
  Khi được duyệt (Số lượng của quyển sách sẽ -1), phiếu mượn được hiển thị bên admin
  Admin có thể chuyển trạng thái sang đã mượn (Khi độc giả đến lấy sách).
  Admin có thể chuyển trạng thái sang đã trả (Số lượng của quyển sách +1) (Khi độc giả đến trả sách).
  Admin có thể xóa phiếu mượn (Số lượng của quyển sách +1) (Khi độc giả không đến lấy sách).

4. Client
   4.1. Đăng ký, Đăng nhập, Đăng xuất.
   4.2. DocGia chưa đăng nhập : Xem sách. Tìm kiếm sách. Xem chi tiết sách. Thêm sách vào yêu thích. Khi click mượn sách thì bắt buộc phải đăng nhập mới mượn được.

- Sách (Bìa sách, Tên sách, Tên tác giả, Nút mượn, Nút tim).
  4.3. DocGia đã đăng nhập :

* Xem sách. Tìm kiếm sách. Xem chi tiết sách. Thêm sách vào yêu thích.
* Đăng ký mượn sách.
* Xem lịch sử
* Cập nhật thông tin cá nhân
  4.4. Trang lịch sử :
* Xem lịch sử các sách đã đăng ký mượn (Bìa sách, Tên sách, Tác giả, Giá, Ngày mượn, Ngày trả). Có thể hủy đăng ký.
* Lọc theo trạng thái (Đã duyệt | Từ chối | Đã mượn | Đã trả)
  4.5. Trang thông tin cá nhân: Gồm User ID (MaDocGia), Password, Họ tên, Ngày sinh, Email, Số điện thoại, Giới tính.
  4.6. Trang liên hệ để xem thông tin về Thư viện

Lưu ý:

- Đây là đồ án sinh viên nên
- Phải code đơn giản, không code phức tạp, không code dài.
- Giao diện đơn giản, chủ yếu là thể hiện được các tính năng.
- Thêm ghi chú cho các file, tính năng, hàm…
- Cấu trúc code tối ưu (Các tính năng lặp lại nếu có thể hãy tách riêng ra, trang nào sử dụng thì import vào).
- Phải tuân thủ cấu trúc MEVN, không dùng Typescript.
- Ở các tính năng xóa thì hãy thêm trường “deleted: boolean” tức chỉ xóa mềm, không xóa vĩnh viễn.
- Cấu trúc chính gồm 3 thư mục : Server, Admin, Client.
