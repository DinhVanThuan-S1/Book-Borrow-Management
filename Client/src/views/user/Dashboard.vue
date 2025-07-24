<template>
  <div class="user-dashboard">
    <div class="container py-4">
      <!-- Welcome Section -->
      <div class="welcome-section mb-4">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="welcome-title">
              Xin chào, {{ authStore.userName }}! 👋
            </h1>
            <p class="welcome-subtitle">
              Chào mừng bạn trở lại thư viện. Hôm nay bạn muốn đọc gì?
            </p>
          </div>
          <div class="col-md-4 text-md-end">
            <div class="user-avatar-large">
              <img
                v-if="authStore.userAvatar"
                :src="authStore.userAvatar"
                :alt="authStore.userName"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ authStore.userInitials }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card primary">
            <div class="stat-icon">
              <i class="bi bi-book"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.borrowing || 0 }}</div>
              <div class="stat-label">Đang mượn</div>
            </div>
            <router-link to="/tai-khoan/sach-dang-muon" class="stat-link">
              Xem chi tiết <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card success">
            <div class="stat-icon">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.returned || 0 }}</div>
              <div class="stat-label">Đã trả</div>
            </div>
            <router-link to="/tai-khoan/lich-su-muon" class="stat-link">
              Xem lịch sử <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card danger">
            <div class="stat-icon">
              <i class="bi bi-heart-fill"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.favorites || 0 }}</div>
              <div class="stat-label">Yêu thích</div>
            </div>
            <router-link to="/tai-khoan/yeu-thich" class="stat-link">
              Xem danh sách <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="stat-card warning">
            <div class="stat-icon">
              <i class="bi bi-clock"></i>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.overdue || 0 }}</div>
              <div class="stat-label">Quá hạn</div>
            </div>
            <router-link to="/tai-khoan/sach-dang-muon" class="stat-link">
              Kiểm tra <i class="bi bi-arrow-right"></i>
            </router-link>
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Current Borrows -->
        <div class="col-lg-8 mb-4">
          <div class="dashboard-card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-book-half me-2"></i>
                Sách đang mượn
              </h5>
              <router-link
                to="/tai-khoan/sach-dang-muon"
                class="btn btn-sm btn-outline-primary"
              >
                Xem tất cả
              </router-link>
            </div>
            <div class="card-body">
              <!-- Loading -->
              <div v-if="loadingBorrows" class="text-center p-4">
                <div class="spinner-border text-primary"></div>
                <div class="mt-2">Đang tải...</div>
              </div>

              <!-- Empty State -->
              <div
                v-else-if="currentBorrows.length === 0"
                class="empty-state-small"
              >
                <i class="bi bi-inbox"></i>
                <p>Bạn chưa mượn sách nào</p>
                <router-link to="/sach" class="btn btn-primary-gradient btn-sm">
                  Khám phá sách
                </router-link>
              </div>

              <!-- Borrows List -->
              <div v-else class="current-borrows">
                <div
                  v-for="borrow in currentBorrows"
                  :key="borrow._id"
                  class="borrow-item"
                >
                  <div class="borrow-book">
                    <img
                      :src="getBookImage(borrow.MaSach?.BiaSach)"
                      :alt="borrow.MaSach?.TenSach"
                      class="book-thumb"
                    />
                    <div class="book-info">
                      <h6 class="book-title">{{ borrow.MaSach?.TenSach }}</h6>
                      <p class="book-author">{{ borrow.MaSach?.TacGia }}</p>
                    </div>
                  </div>

                  <div class="borrow-status">
                    <div
                      class="status-badge"
                      :class="getBorrowStatusClass(borrow)"
                    >
                      {{ borrow.TrangThai }}
                    </div>
                    <div class="due-date" :class="getDueDateClass(borrow)">
                      <i class="bi bi-calendar me-1"></i>
                      {{ formatDueDate(borrow.NgayTraDuKien) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions & Recent Activity -->
        <div class="col-lg-4">
          <!-- Quick Actions -->
          <div class="dashboard-card mb-4">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-lightning me-2"></i>
                Thao tác nhanh
              </h5>
            </div>
            <div class="card-body">
              <div class="quick-actions">
                <router-link to="/sach" class="quick-action-btn">
                  <i class="bi bi-search"></i>
                  <span>Tìm sách</span>
                </router-link>

                <router-link to="/tai-khoan/yeu-thich" class="quick-action-btn">
                  <i class="bi bi-heart"></i>
                  <span>Yêu thích</span>
                </router-link>

                <router-link
                  to="/tai-khoan/lich-su-muon"
                  class="quick-action-btn"
                >
                  <i class="bi bi-clock-history"></i>
                  <span>Lịch sử</span>
                </router-link>

                <router-link to="/tai-khoan/thong-tin" class="quick-action-btn">
                  <i class="bi bi-gear"></i>
                  <span>Cài đặt</span>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="dashboard-card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="bi bi-activity me-2"></i>
                Hoạt động gần đây
              </h5>
            </div>
            <div class="card-body">
              <!-- Loading -->
              <div v-if="loadingActivity" class="text-center p-3">
                <div
                  class="spinner-border spinner-border-sm text-primary"
                ></div>
                <div class="mt-2 small">Đang tải...</div>
              </div>

              <!-- Empty State -->
              <div
                v-else-if="recentActivity.length === 0"
                class="empty-state-small"
              >
                <i class="bi bi-clock-history"></i>
                <p>Chưa có hoạt động nào</p>
              </div>

              <!-- Activity List -->
              <div v-else class="activity-list">
                <div
                  v-for="activity in recentActivity"
                  :key="activity._id"
                  class="activity-item"
                >
                  <div
                    class="activity-icon"
                    :class="getActivityIconClass(activity.type)"
                  >
                    <i :class="getActivityIcon(activity.type)"></i>
                  </div>
                  <div class="activity-content">
                    <div class="activity-title">{{ activity.title }}</div>
                    <div class="activity-time">
                      {{ formatRelativeTime(activity.createdAt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations -->
      <div
        v-if="recommendations.length > 0"
        class="recommendations-section mt-4"
      >
        <h4 class="section-title mb-4">
          <i class="bi bi-stars me-2"></i>
          Gợi ý cho bạn
        </h4>
        <div class="row">
          <div
            v-for="book in recommendations"
            :key="book._id"
            class="col-lg-3 col-md-4 col-sm-6 mb-4"
          >
            <BookCard :book="book" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import api from "@/services/api";
import BookCard from "@/components/common/BookCard.vue";

export default {
  name: "Dashboard",
  components: {
    BookCard,
  },
  setup() {
    const authStore = useAuthStore();

    const stats = ref({});
    const currentBorrows = ref([]);
    const recentActivity = ref([]);
    const recommendations = ref([]);

    const loadingBorrows = ref(false);
    const loadingActivity = ref(false);

    const fetchStats = async () => {
      try {
        const response = await api.stats.getUserStats();
        if (response.success) {
          stats.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const fetchCurrentBorrows = async () => {
      try {
        loadingBorrows.value = true;
        const response = await api.borrowing.getMyBorrows({
          limit: 5,
          status: "Đã mượn",
        });
        if (response.success) {
          currentBorrows.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching current borrows:", error);
      } finally {
        loadingBorrows.value = false;
      }
    };

    const fetchRecentActivity = async () => {
      try {
        loadingActivity.value = true;
        // This would be a custom endpoint for user activities
        const response = await api.get("/docgia/recent-activity", {
          params: { limit: 5 },
        });
        if (response.success) {
          recentActivity.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        loadingActivity.value = false;
      }
    };

    const fetchRecommendations = async () => {
      try {
        // Get recommended books based on user's history
        const response = await api.books.getPopular(4);
        if (response.success) {
          recommendations.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      }
    };

    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const getBorrowStatusClass = (borrow) => {
      const classes = {
        "Chờ duyệt": "warning",
        "Đã duyệt": "info",
        "Đã mượn": "primary",
        "Từ chối": "danger",
      };
      return classes[borrow.TrangThai] || "secondary";
    };

    const getDueDateClass = (borrow) => {
      if (borrow.TrangThai !== "Đã mượn") return "";

      const dueDate = new Date(borrow.NgayTraDuKien);
      const now = new Date();
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "overdue";
      if (diffDays <= 2) return "warning";
      return "";
    };

    const formatDueDate = (date) => {
      if (!date) return "";

      const dueDate = new Date(date);
      const now = new Date();
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return `Quá hạn ${Math.abs(diffDays)} ngày`;
      } else if (diffDays === 0) {
        return "Hết hạn hôm nay";
      } else if (diffDays === 1) {
        return "Hết hạn ngày mai";
      } else {
        return `Còn ${diffDays} ngày`;
      }
    };

    const getActivityIconClass = (type) => {
      const classes = {
        borrow: "primary",
        return: "success",
        favorite: "danger",
        request: "warning",
      };
      return classes[type] || "secondary";
    };

    const getActivityIcon = (type) => {
      const icons = {
        borrow: "bi bi-arrow-right",
        return: "bi bi-arrow-left",
        favorite: "bi bi-heart",
        request: "bi bi-clock",
      };
      return icons[type] || "bi bi-circle";
    };

    const formatRelativeTime = (date) => {
      if (!date) return "";

      const now = new Date();
      const diffMs = now - new Date(date);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;

      return new Date(date).toLocaleDateString("vi-VN");
    };

    onMounted(() => {
      fetchStats();
      fetchCurrentBorrows();
      fetchRecentActivity();
      fetchRecommendations();
    });

    return {
      authStore,
      stats,
      currentBorrows,
      recentActivity,
      recommendations,
      loadingBorrows,
      loadingActivity,
      getBookImage,
      getBorrowStatusClass,
      getDueDateClass,
      formatDueDate,
      getActivityIconClass,
      getActivityIcon,
      formatRelativeTime,
    };
  },
};
</script>

<style scoped>
.welcome-section {
  background: var(--gradient-primary);
  color: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  margin-bottom: 2rem;
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
}

.user-avatar-large .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-large .avatar-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.stat-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.stat-card.primary {
  border-left: 4px solid var(--primary-color);
}
.stat-card.success {
  border-left: 4px solid var(--success-color);
}
.stat-card.danger {
  border-left: 4px solid var(--danger-color);
}
.stat-card.warning {
  border-left: 4px solid var(--warning-color);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  margin-bottom: 1rem;
}

.stat-card.primary .stat-icon {
  background: var(--primary-color);
}
.stat-card.success .stat-icon {
  background: var(--success-color);
}
.stat-card.danger .stat-icon {
  background: var(--danger-color);
}
.stat-card.warning .stat-icon {
  background: var(--warning-color);
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 1rem;
}

.stat-link {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  margin-top: auto;
  transition: color 0.3s ease;
}

.stat-link:hover {
  color: var(--secondary-color);
}

.dashboard-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.dashboard-card .card-header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: between;
  align-items: center;
}

.dashboard-card .card-body {
  padding: 1.5rem;
}

.empty-state-small {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

.empty-state-small i {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.borrow-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.borrow-item:last-child {
  border-bottom: none;
}

.borrow-book {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.book-thumb {
  width: 40px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 1rem;
}

.book-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.book-author {
  color: #6b7280;
  font-size: 0.8rem;
  margin: 0;
}

.borrow-status {
  text-align: right;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
}

.status-badge.primary {
  background: var(--primary-color);
}
.status-badge.success {
  background: var(--success-color);
}
.status-badge.warning {
  background: var(--warning-color);
}
.status-badge.danger {
  background: var(--danger-color);
}
.status-badge.info {
  background: var(--accent-color);
}

.due-date {
  font-size: 0.8rem;
  color: #6b7280;
}

.due-date.warning {
  color: var(--warning-color);
  font-weight: 600;
}

.due-date.overdue {
  color: var(--danger-color);
  font-weight: 600;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.quick-action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: var(--border-radius);
  text-decoration: none;
  color: var(--dark-color);
  transition: all 0.3s ease;
}

.quick-action-btn:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.quick-action-btn i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.quick-action-btn span {
  font-size: 0.8rem;
  font-weight: 500;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: white;
  font-size: 0.8rem;
}

.activity-icon.primary {
  background: var(--primary-color);
}
.activity-icon.success {
  background: var(--success-color);
}
.activity-icon.danger {
  background: var(--danger-color);
}
.activity-icon.warning {
  background: var(--warning-color);
}

.activity-title {
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.75rem;
  color: #9ca3af;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark-color);
}

@media (max-width: 768px) {
  .welcome-section {
    padding: 1.5rem;
    text-align: center;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .user-avatar-large {
    margin-bottom: 1rem;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
