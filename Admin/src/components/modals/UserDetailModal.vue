<template>
  <div
    class="modal fade"
    id="userDetailModal"
    tabindex="-1"
    aria-labelledby="userDetailModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="userDetailModalLabel">
            Thông tin chi tiết độc giả
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="user" class="row">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Thông tin cá nhân</h6>
                </div>
                <div class="card-body">
                  <table class="table table-borderless">
                    <tbody>
                      <tr>
                        <td><strong>Họ tên:</strong></td>
                        <td>{{ user.HoLot }} {{ user.Ten }}</td>
                      </tr>
                      <tr>
                        <td><strong>Email:</strong></td>
                        <td>{{ user.Email }}</td>
                      </tr>
                      <tr>
                        <td><strong>Ngày sinh:</strong></td>
                        <td>{{ formatDate(user.NgaySinh) }}</td>
                      </tr>
                      <tr>
                        <td><strong>Giới tính:</strong></td>
                        <td>{{ user.Phai }}</td>
                      </tr>
                      <tr>
                        <td><strong>Điện thoại:</strong></td>
                        <td>{{ user.DienThoai || "Chưa cập nhật" }}</td>
                      </tr>
                      <tr>
                        <td><strong>Địa chỉ:</strong></td>
                        <td>{{ user.DiaChi || "Chưa cập nhật" }}</td>
                      </tr>
                      <tr>
                        <td><strong>Ngày đăng ký:</strong></td>
                        <td>{{ formatDate(user.createdAt) }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">Thống kê hoạt động</h6>
                </div>
                <div class="card-body">
                  <div v-if="loading" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                  <div v-else>
                    <div class="row text-center">
                      <div class="col-6 mb-3">
                        <div class="border rounded p-3">
                          <h4 class="text-primary mb-0">
                            {{ stats.totalBorrows || 0 }}
                          </h4>
                          <small class="text-muted">Tổng lượt mượn</small>
                        </div>
                      </div>
                      <div class="col-6 mb-3">
                        <div class="border rounded p-3">
                          <h4 class="text-success mb-0">
                            {{ stats.returned || 0 }}
                          </h4>
                          <small class="text-muted">Đã trả</small>
                        </div>
                      </div>
                      <div class="col-6 mb-3">
                        <div class="border rounded p-3">
                          <h4 class="text-warning mb-0">
                            {{ stats.borrowing || 0 }}
                          </h4>
                          <small class="text-muted">Đang mượn</small>
                        </div>
                      </div>
                      <div class="col-6 mb-3">
                        <div class="border rounded p-3">
                          <h4 class="text-danger mb-0">
                            {{ stats.overdue || 0 }}
                          </h4>
                          <small class="text-muted">Quá hạn</small>
                        </div>
                      </div>
                    </div>
                  </div>
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
          <button
            type="button"
            class="btn btn-primary"
            @click="viewBorrowHistory"
          >
            <i class="fas fa-history me-1"></i>
            Xem lịch sử mượn
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserDetailModal",
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      stats: {},
      loading: false,
    };
  },
  watch: {
    user: {
      handler(newVal) {
        if (newVal) {
          this.loadUserStats();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async loadUserStats() {
      if (!this.user?._id) return;

      this.loading = true;
      try {
        this.$emit("load-stats", this.user._id);
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date) return "Chưa cập nhật";
      return new Date(date).toLocaleDateString("vi-VN");
    },
    viewBorrowHistory() {
      this.$emit("view-history", this.user);
    },
    setStats(stats) {
      this.stats = stats;
      this.loading = false;
    },
  },
};
</script>
