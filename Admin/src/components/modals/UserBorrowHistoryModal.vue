<template>
  <div
    class="modal fade"
    id="userBorrowHistoryModal"
    tabindex="-1"
    aria-labelledby="userBorrowHistoryModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="userBorrowHistoryModalLabel">
            Lịch sử mượn sách - {{ user?.HoLot }} {{ user?.Ten }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
          </div>
          <div v-else-if="history.length === 0" class="text-center text-muted">
            <i class="fas fa-book-open fa-3x mb-3"></i>
            <p>Độc giả này chưa có lịch sử mượn sách</p>
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Tên sách</th>
                    <th>Ngày mượn</th>
                    <th>Hạn trả</th>
                    <th>Ngày trả</th>
                    <th>Trạng thái</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in history" :key="item._id">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div>
                        <strong>{{ item.sach?.TenSach || "N/A" }}</strong>
                        <br />
                        <small class="text-muted">{{
                          item.sach?.TacGia || "N/A"
                        }}</small>
                      </div>
                    </td>
                    <td>{{ formatDate(item.NgayMuon) }}</td>
                    <td>{{ formatDate(item.NgayHenTra) }}</td>
                    <td>{{ formatDate(item.NgayTra) }}</td>
                    <td>
                      <span :class="getStatusClass(item.TrangThai)">
                        {{ getStatusText(item.TrangThai) }}
                      </span>
                    </td>
                    <td>{{ item.GhiChu || "-" }}</td>
                  </tr>
                </tbody>
              </table>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserBorrowHistoryModal",
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      history: [],
      loading: false,
    };
  },
  watch: {
    user: {
      handler(newVal) {
        if (newVal) {
          this.loadHistory();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async loadHistory() {
      if (!this.user?._id) return;

      this.loading = true;
      try {
        this.$emit("load-history", this.user._id);
      } finally {
        this.loading = false;
      }
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
    getStatusText(status) {
      return status || "Không xác định";
    },
    setHistory(history) {
      this.history = history;
      this.loading = false;
    },
  },
};
</script>
