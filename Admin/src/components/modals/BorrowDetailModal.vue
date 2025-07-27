<template>
  <div
    v-if="show"
    class="modal fade show"
    id="borrowDetailModal"
    tabindex="-1"
    aria-labelledby="borrowDetailModalLabel"
    aria-hidden="false"
    style="display: block"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="borrowDetailModalLabel">
            Chi tiết phiếu mượn
          </h5>
          <button
            type="button"
            class="btn-close"
            @click="closeModal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="borrow" class="">
              <div class="card border-0 shadow-sm">
                <div class="card-body">
                  <table class="table table-borderless mb-0">
                    <tbody>
                      <!-- Thông tin phiếu mượn -->
                      <tr class="section-header">
                        <td colspan="4" class="fw-bold text-primary border-bottom pb-2 mb-3">
                          <i class="bi bi-clipboard-data me-2"></i>
                          Thông tin phiếu mượn
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-medium text-muted" style="width: 20%;">Mã phiếu:</td>
                        <td class="text-break" style="width: 30%;">{{ borrow._id }}</td>
                        <td class="fw-medium text-muted" style="width: 20%;">Ngày mượn:</td>
                        <td style="width: 30%;">{{ formatDate(borrow.NgayMuon || borrow.createdAt) }}</td>
                      </tr>
                      <tr v-if="shouldShowDueDate">
                        <td class="fw-medium text-muted">Ngày trả dự kiến:</td>
                        <td>{{ formatDate(borrow.NgayTra) }}</td>
                        <td class="fw-medium text-muted">Trạng thái:</td>
                        <td>
                          <span :class="getStatusClass(borrow.TrangThai)">
                            <i :class="getStatusIcon(borrow.TrangThai)" class="me-1"></i>
                            {{ borrow.TrangThai }}
                          </span>
                        </td>
                      </tr>
                      <tr v-else>
                        <td class="fw-medium text-muted">Trạng thái:</td>
                        <td colspan="3">
                          <span :class="getStatusClass(borrow.TrangThai)">
                            <i :class="getStatusIcon(borrow.TrangThai)" class="me-1"></i>
                            {{ borrow.TrangThai }}
                          </span>
                        </td>
                      </tr>
                      <tr v-if="borrow.TrangThai === 'Đã trả'">
                        <td class="fw-medium text-muted">Ngày trả thực tế:</td>
                        <td>{{ formatDate(borrow.updatedAt) }}</td>
                        <td colspan="2"></td>
                      </tr>
                      <tr v-if="shouldShowRemainingDays">
                        <td class="fw-medium text-muted">Thời gian còn lại:</td>
                        <td>
                          <span :class="getRemainingDaysClass(borrow)">
                            {{ getRemainingDaysText(borrow) }}
                          </span>
                        </td>
                        <td colspan="2"></td>
                      </tr>
                      <tr v-if="shouldShowOverdueDays">
                        <td class="fw-medium text-muted">Số ngày quá hạn:</td>
                        <td>
                          <span class="text-danger fw-bold">
                            {{ getOverdueDays(borrow) }} ngày
                          </span>
                        </td>
                        <td colspan="2"></td>
                      </tr>
                      <tr v-if="borrow.LyDoTuChoi">
                        <td class="fw-medium text-muted">Lý do từ chối:</td>
                        <td colspan="3" class="text-danger">{{ borrow.LyDoTuChoi }}</td>
                      </tr>
                      <tr v-if="borrow.GhiChu">
                        <td class="fw-medium text-muted">Ghi chú:</td>
                        <td colspan="3">{{ borrow.GhiChu }}</td>
                      </tr>

                      <!-- Thông tin độc giả -->
                      <tr class="section-header">
                        <td colspan="4" class="fw-bold text-success border-bottom pb-2 mb-3">
                          <i class="bi bi-person me-2"></i>
                          Thông tin độc giả
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-medium text-muted">Họ và tên:</td>
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="user-avatar me-2">
                              {{ getUserInitials(borrow.MaDocGia) }}
                            </div>
                            <div>
                              <span class="fw-medium">{{ getFullName(borrow.MaDocGia) }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="fw-medium text-muted">Mã độc giả:</td>
                        <td class="fw-medium">{{ borrow.MaDocGia?.MaDocGia || "-" }}</td>
                      </tr>
                      <tr>
                        <td class="fw-medium text-muted">Email:</td>
                        <td>{{ borrow.MaDocGia?.Email || "-" }}</td>
                        <td class="fw-medium text-muted">Điện thoại:</td>
                        <td>{{ borrow.MaDocGia?.DienThoai || "Chưa cập nhật" }}</td>
                      </tr>

                      <!-- Thông tin sách -->
                      <tr class="section-header">
                        <td colspan="4" class="fw-bold text-info border-bottom pb-2 mb-3">
                          <i class="bi bi-book me-2"></i>
                          Thông tin sách
                        </td>
                      </tr>
                      <tr>
                        <td class="fw-medium text-muted">Tên sách:</td>
                        <td>
                          <div class="d-flex align-items-center">
                            <img
                              :src="getBookImage(borrow.MaSach?.BiaSach)"
                              :alt="borrow.MaSach?.TenSach"
                              class="book-thumbnail me-2"
                              style="width: 40px; height: 50px; object-fit: cover; border-radius: 4px;"
                            />
                            <div>
                              <span class="fw-medium">{{ borrow.MaSach?.TenSach || "-" }}</span>
                            </div>
                          </div>
                        </td>
                        <td class="fw-medium text-muted">Mã sách:</td>
                        <td class="fw-medium">{{ borrow.MaSach?.MaSach || "-" }}</td>
                      </tr>
                      <tr>
                        <td class="fw-medium text-muted">Tác giả:</td>
                        <td>{{ borrow.MaSach?.TacGia || "-" }}</td>
                        <td class="fw-medium text-muted">Năm XB:</td>
                        <td>{{ borrow.MaSach?.NamXuatBan || "-" }}</td>
                      </tr>
                      <tr v-if="borrow.MaSach?.MaNXB?.TenNXB">
                        <td class="fw-medium text-muted">Nhà xuất bản:</td>
                        <td colspan="3">{{ borrow.MaSach?.MaNXB?.TenNXB }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
          </div>
        </div>
        <div class="modal-footer">
          <div v-if="borrow?.TrangThai === 'Chờ duyệt'">
            <button
              type="button"
              class="btn btn-success me-2"
              @click="approveBorrow"
            >
              <i class="fas fa-check me-1"></i>
              Duyệt
            </button>
            <button type="button" class="btn btn-danger" @click="rejectBorrow">
              <i class="fas fa-times me-1"></i>
              Từ chối
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-if="show" class="modal-backdrop fade show" @click="closeModal"></div>
</template>

<script>
export default {
  name: "BorrowDetailModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    borrow: {
      type: Object,
      default: null,
    },
  },
  computed: {
    shouldShowDueDate() {
      return ['Đã duyệt', 'Đang mượn', 'Quá hạn'].includes(this.borrow?.TrangThai);
    },
    shouldShowRemainingDays() {
      return ['Đã duyệt', 'Đang mượn'].includes(this.borrow?.TrangThai);
    },
    shouldShowOverdueDays() {
      return this.borrow?.TrangThai === 'Quá hạn';
    }
  },
  methods: {
    closeModal() {
      this.$emit("close");
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    getStatusClass(status) {
      const statusClasses = {
        "Chờ duyệt": "badge bg-warning text-dark",
        "Đã duyệt": "badge bg-primary",
        "Đang mượn": "badge bg-warning",
        "Đã trả": "badge bg-success",
        "Quá hạn": "badge bg-danger",
        "Từ chối": "badge bg-danger",
      };
      return statusClasses[status] || "badge bg-secondary";
    },
    getStatusIcon(status) {
      const icons = {
        "Chờ duyệt": "bi bi-clock",
        "Đã duyệt": "bi bi-check-circle",
        "Đang mượn": "bi bi-arrow-left-right",
        "Đã trả": "bi bi-check-square",
        "Quá hạn": "bi bi-exclamation-triangle",
        "Từ chối": "bi bi-x-circle",
      };
      return icons[status] || "bi bi-question-circle";
    },
    getFullName(user) {
      if (!user) return "N/A";
      return `${user.HoLot || ""} ${user.Ten || ""}`.trim();
    },
    getUserInitials(user) {
      if (!user) return "U";
      const fullName = this.getFullName(user);
      const names = fullName.split(" ");
      return names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0];
    },
    getBookImage(imagePath) {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    },
    getRemainingDaysText(borrow) {
      if (!borrow || !['Đã duyệt', 'Đang mượn'].includes(borrow.TrangThai)) return "-";
      
      const dueDate = new Date(borrow.NgayTra);
      const now = new Date();
      const diffTime = dueDate - now;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (days < 0) return `Quá hạn ${Math.abs(days)} ngày`;
      if (days === 0) return "Hôm nay phải trả";
      return `Còn ${days} ngày`;
    },
    getRemainingDaysClass(borrow) {
      if (!borrow || !['Đã duyệt', 'Đang mượn'].includes(borrow.TrangThai)) return "";
      
      const dueDate = new Date(borrow.NgayTra);
      const now = new Date();
      const diffTime = dueDate - now;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days < 0) return "text-danger fw-bold";
      if (days <= 2) return "text-warning fw-bold";
      return "text-success fw-medium";
    },
    getOverdueDays(borrow) {
      if (!borrow || borrow.TrangThai !== 'Quá hạn') return 0;
      
      const dueDate = new Date(borrow.NgayTra);
      const now = new Date();
      const diffTime = now - dueDate;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    approveBorrow() {
      this.$emit("approve", this.borrow._id);
    },
    rejectBorrow() {
      this.$emit("reject", this.borrow._id);
    },
    returnBook() {
      this.$emit("return", this.borrow._id);
    },
  },
};
</script>

<style scoped>
.modal-content {
  border: none;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 15px 15px 0 0;
  padding: 1.5rem;
}

.modal-title {
  font-weight: 600;
  font-size: 1.25rem;
}

.btn-close {
  filter: brightness(0) invert(1);
  opacity: 0.8;
}

.btn-close:hover {
  opacity: 1;
}

.modal-body {
  padding: 1rem;
  background-color: #f8f9fa;
}

.card {
  border-radius: 10px;
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
  padding: 1rem 1rem;
  font-weight: 600;
}

.card-body {
  padding: 1.25rem;
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.book-thumbnail {
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.table td {
  padding: 0.75rem 0.5rem;
  border: none;
  vertical-align: middle;
}

.table td:first-child {
  padding-left: 0;
}

.table td:last-child {
  padding-right: 0;
}

.section-header td {
  padding-top: 1rem !important;
  padding-bottom: 0.5rem !important;
}

.section-spacer td {
  padding: 0.5rem 0 !important;
  border-bottom: 1px solid #e9ecef;
}

.badge {
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-weight: 500;
}

.modal-footer {
  border: none;
  padding: 1rem 1.5rem 1.5rem;
  background-color: #f8f9fa;
  border-radius: 0 0 15px 15px;
}

.btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 0.5rem 1.5rem;
  transition: all 0.3s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.text-break {
  word-break: break-all;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: #6c757d;
}

.shadow-sm {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08) !important;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.6);
}
</style>
