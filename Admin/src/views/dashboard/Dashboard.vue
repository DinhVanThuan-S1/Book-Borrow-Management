<template>
  <div class="dashboard fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Tổng quan</h1>
      <!-- <p class="page-subtitle">Tổng quan hệ thống quản lý mượn sách</p> -->
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
        <div class="stats-card danger">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-danger">
                {{ stats.totalStaff || 0 }}
              </div>
              <p class="stats-label">Tổng nhân viên</p>
            </div>
            <i class="bi bi-person-badge stats-icon text-danger"></i>
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


    </div>

    <!-- Main Content -->
    <div class="row">
      <!-- Recent Borrows -->
      <div class="col-lg-8 mb-4 d-flex">
        <div class="admin-card flex-fill">
          <div
            class="card-header-custom d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0 w-100">
              <i class="bi bi-clock-history me-2"></i>
              Phiếu mượn đã duyệt gần đây
            </h5>
            <router-link to="/borrowing" class="btn btn-sm btn-outline-primary position-absolute end-0 me-3">
              Xem tất cả
            </router-link>
          </div>
          <div class="card-body p-0">
            <div
              v-if="recentBorrows.length === 0"
              class="text-center p-4 text-muted"
            >
              <i class="bi bi-inbox display-4 d-block mb-2"></i>
              Chưa có phiếu mượn đã duyệt nào
            </div>
            <div v-else class="table">
              <table class="table table-hover table-bordered mb-0">
                <thead class="table-light">
                  <tr class="text-center">
                    <th>Độc giả</th>
                    <th>Sách</th>
                    <th>Trạng thái</th>
                    <th>Ngày mượn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="borrow in recentBorrows" :key="borrow._id">
                    <td class="border-end">
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
                    <td class="border-end">
                      <div class="fw-medium">{{ borrow.MaSach?.TenSach }}</div>
                      <small class="text-muted">{{
                        borrow.MaSach?.TacGia
                      }}</small>
                    </td>
                    <td class="border-end">
                      <span
                        class="badge"
                        :class="getStatusBadgeClass(borrow.TrangThai)"
                      >
                        {{ borrow.TrangThai }}
                      </span>
                    </td>
                    <td class="text-center">
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
      <div class="col-lg-4 mb-4 d-flex">
        <div class="admin-card flex-fill">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-star me-2"></i>
              Sách phổ biến
            </h5>
          </div>
          <div class="card-body d-flex flex-column">
            <div v-if="topBooks.length === 0" class="text-center text-muted flex-fill d-flex align-items-center justify-content-center">
              <div>
                <i class="bi bi-book display-4 d-block mb-2"></i>
                Chưa có dữ liệu
              </div>
            </div>
            <div v-else class="flex-fill d-flex flex-column">
              <div
                v-for="(book, index) in topBooks"
                :key="book._id"
                class="d-flex align-items-center p-2 border rounded bg-light"
                :class="{ 'mb-3': index < topBooks.length - 1 }"
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

        // Lấy dữ liệu dashboard
        const dashboardResponse = await api.get("/thongke/dashboard");

        if (dashboardResponse.success && dashboardResponse.data) {
          const data = dashboardResponse.data;

          // Cập nhật thống kê tổng quan
          stats.value = {
            totalBooks: data.overview?.tongSach || 0,
            totalUsers: data.overview?.tongDocGia || 0,
            totalStaff: data.overview?.tongNhanVien || 0,
            activeBorrows: data.overview?.sachDangMuon || 0,
          };

          // Cập nhật danh sách phiếu mượn gần đây
          recentBorrows.value = data.recentBorrows || [];
          
          // Cập nhật sách phổ biến
          topBooks.value = (data.topBooks || []).slice(0, 5);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        // Đặt giá trị mặc định khi có lỗi
        stats.value = {
          totalBooks: 0,
          totalUsers: 0,
          totalStaff: 0,
          activeBorrows: 0,
        };
        recentBorrows.value = [];
        topBooks.value = [];
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
        "Đã duyệt": "bg-primary",
        "Đang mượn": "bg-warning",
        "Đã trả": "bg-success",
        "Quá hạn": "bg-danger",
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

.card-header-custom {
  position: relative;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}

.table-bordered thead th {
  border-bottom: 1px solid #dee2e6;
  font-weight: 700;
}

.flex-fill {
  flex: 1;
}

.d-flex.flex-column {
  min-height: 100%;
}

/* Đảm bảo các card có chiều cao bằng nhau */
.admin-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.admin-card .card-body {
  flex: 1;
}

/* Cải thiện hiển thị sách phổ biến */
.bg-light {
  background-color: #f8f9fa !important;
  transition: all 0.3s ease;
}

.bg-light:hover {
  background-color: #e9ecef !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Đảm bảo khung sách cuối cùng không bị văng ra ngoài */
.flex-fill.d-flex.flex-column {
  gap: 0;
}

.flex-fill.d-flex.flex-column > div:last-child {
  margin-bottom: 0 !important;
}
</style>
