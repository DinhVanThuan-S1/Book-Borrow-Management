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
          <div v-if="borrow" class="row">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Thông tin phiếu mượn</h6>
                </div>
                <div class="card-body">
                  <table class="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Mã phiếu:</strong></td>
                        <td>{{ borrow._id }}</td>
                      </tr>
                      <tr>
                        <td><strong>Ngày mượn:</strong></td>
                        <td>{{ formatDate(borrow.NgayMuon) }}</td>
                      </tr>
                      <tr>
                        <td><strong>Hạn trả:</strong></td>
                        <td>{{ formatDate(borrow.NgayHenTra) }}</td>
                      </tr>
                      <tr>
                        <td><strong>Ngày trả:</strong></td>
                        <td>{{ formatDate(borrow.NgayTra) }}</td>
                      </tr>
                      <tr>
                        <td><strong>Trạng thái:</strong></td>
                        <td>
                          <span :class="getStatusClass(borrow.TrangThai)">
                            {{ borrow.TrangThai }}
                          </span>
                        </td>
                      </tr>
                      <tr v-if="borrow.GhiChu">
                        <td><strong>Ghi chú:</strong></td>
                        <td>{{ borrow.GhiChu }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Thông tin độc giả</h6>
                </div>
                <div class="card-body">
                  <table class="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Họ tên:</strong></td>
                        <td>
                          {{ borrow.docGia?.HoLot }} {{ borrow.docGia?.Ten }}
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Email:</strong></td>
                        <td>{{ borrow.docGia?.Email }}</td>
                      </tr>
                      <tr>
                        <td><strong>Điện thoại:</strong></td>
                        <td>
                          {{ borrow.docGia?.DienThoai || "Chưa cập nhật" }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Thông tin sách</h6>
                </div>
                <div class="card-body">
                  <table class="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Tên sách:</strong></td>
                        <td>{{ borrow.sach?.TenSach }}</td>
                      </tr>
                      <tr>
                        <td><strong>Tác giả:</strong></td>
                        <td>{{ borrow.sach?.TacGia }}</td>
                      </tr>
                      <tr>
                        <td><strong>Năm XB:</strong></td>
                        <td>{{ borrow.sach?.NamXuatBan }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Đóng
          </button>
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
          <div
            v-else-if="
              borrow?.TrangThai === 'Đã duyệt' ||
              borrow?.TrangThai === 'Đã mượn'
            "
          >
            <button type="button" class="btn btn-warning" @click="returnBook">
              <i class="fas fa-undo me-1"></i>
              Trả sách
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
  methods: {
    closeModal() {
      this.$emit("close");
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("vi-VN");
    },
    getStatusClass(status) {
      const statusClasses = {
        "Chờ duyệt": "badge bg-warning",
        "Đã duyệt": "badge bg-info",
        "Đã mượn": "badge bg-primary",
        "Đã trả": "badge bg-success",
        "Quá hạn": "badge bg-danger",
        "Từ chối": "badge bg-secondary",
      };
      return statusClasses[status] || "badge bg-secondary";
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
