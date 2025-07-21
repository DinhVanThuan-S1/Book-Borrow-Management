<template>
  <div class="dashboard fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Tổng quan</h1>
      <p class="page-subtitle">Tổng quan hệ thống quản lý mượn sách</p>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card primary">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-primary">
                {{ stats.totalBooks || 0 }}
              </div>
              <p class="stats-label">Tổng số sách</p>
            </div>
            <i class="bi bi-book stats-icon text-primary"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card success">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-success">
                {{ stats.totalUsers || 0 }}
              </div>
              <p class="stats-label">Tổng độc giả</p>
            </div>
            <i class="bi bi-people stats-icon text-success"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card warning">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-warning">
                {{ stats.activeBorrows || 0 }}
              </div>
              <p class="stats-label">Đang mượn</p>
            </div>
            <i class="bi bi-arrow-left-right stats-icon text-warning"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card danger">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-danger">
                {{ stats.overdueBooks || 0 }}
              </div>
              <p class="stats-label">Quá hạn</p>
            </div>
            <i class="bi bi-exclamation-triangle stats-icon text-danger"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="row">
      <!-- Recent Borrows -->
      <div class="col-lg-8 mb-4">
        <div class="admin-card">
          <div
            class="card-header-custom d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">
              <i class="bi bi-clock-history me-2"></i>
              Phiếu mượn gần đây
            </h5>
            <router-link to="/borrowing" class="btn btn-sm btn-outline-primary">
              Xem tất cả
            </router-link>
          </div>
          <div class="card-body p-0">
            <div
              v-if="recentBorrows.length === 0"
              class="text-center p-4 text-muted"
            >
              <i class="bi bi-inbox display-4 d-block mb-2"></i>
              Chưa có phiếu mượn nào
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Độc giả</th>
                    <th>Sách</th>
                    <th>Trạng thái</th>
                    <th>Ngày mượn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="borrow in recentBorrows" :key="borrow._id">
                    <td>
                      <div class="d-flex align-items-center">
                        <div
                          class="user-avatar me-2"
                          style="width: 32px; height: 32px; font-size: 0.8rem"
                        >
                          {{ getUserInitials(borrow.MaDocGia) }}
                        </div>
                        <div>
                          <div class="fw-medium">
                            {{ getFullName(borrow.MaDocGia) }}
                          </div>
                          <small class="text-muted">{{
                            borrow.MaDocGia?.Email
                          }}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="fw-medium">{{ borrow.MaSach?.TenSach }}</div>
                      <small class="text-muted">{{
                        borrow.MaSach?.TacGia
                      }}</small>
                    </td>
                    <td>
                      <span
                        class="badge"
                        :class="getStatusBadgeClass(borrow.TrangThai)"
                      >
                        {{ borrow.TrangThai }}
                      </span>
                    </td>
                    <td>
                      <small>{{ formatDate(borrow.createdAt) }}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Books -->
      <div class="col-lg-4 mb-4">
        <div class="admin-card">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-star me-2"></i>
              Sách phổ biến
            </h5>
          </div>
          <div class="card-body">
            <div v-if="topBooks.length === 0" class="text-center text-muted">
              <i class="bi bi-book display-4 d-block mb-2"></i>
              Chưa có dữ liệu
            </div>
            <div v-else>
              <div
                v-for="(book, index) in topBooks"
                :key="book._id"
                class="d-flex align-items-center mb-3"
              >
                <div class="ranking-number me-3">
                  {{ index + 1 }}
                </div>
                <div class="flex-grow-1">
                  <div class="fw-medium">{{ book.TenSach }}</div>
                  <small class="text-muted">{{ book.TacGia }}</small>
                  <div class="text-primary small">
                    <i class="bi bi-heart-fill me-1"></i>
                    {{ book.soLanMuon || 0 }} lượt mượn
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import api from "@/services/api";

export default {
  name: "Dashboard",
  setup() {
    const stats = ref({});
    const recentBorrows = ref([]);
    const topBooks = ref([]);
    const isLoading = ref(true);

    const fetchDashboardData = async () => {
      try {
        isLoading.value = true;

        // Fetch dashboard stats
        const dashboardResponse = await api.get("/thongke/dashboard");

        if (dashboardResponse.data) {
          const data = dashboardResponse.data;

          stats.value = {
            totalBooks: data.overview?.tongSach || 0,
            totalUsers: data.overview?.tongDocGia || 0,
            activeBorrows: data.overview?.sachDangMuon || 0,
            overdueBooks: data.overdueBooks || 0,
          };

          recentBorrows.value = data.recentBorrows || [];
          topBooks.value = (data.topBooks || []).slice(0, 5);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const getUserInitials = (user) => {
      if (!user) return "U";
      const fullName = `${user.HoLot || ""} ${user.Ten || ""}`.trim();
      if (!fullName) return "U";
      const names = fullName.split(" ");
      return names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0];
    };

    const getFullName = (user) => {
      if (!user) return "Unknown";
      return `${user.HoLot || ""} ${user.Ten || ""}`.trim();
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        "Đã duyệt": "bg-info",
        "Đã mượn": "bg-warning",
        "Đã trả": "bg-success",
        "Từ chối": "bg-danger",
      };
      return classes[status] || "bg-secondary";
    };

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    onMounted(() => {
      fetchDashboardData();
    });

    return {
      stats,
      recentBorrows,
      topBooks,
      isLoading,
      getUserInitials,
      getFullName,
      getStatusBadgeClass,
      formatDate,
    };
  },
};
</script>

<style scoped>
.ranking-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
