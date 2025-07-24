<template>
  <div class="my-books">
    <div class="container py-4">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <h1 class="page-title">
          <i class="bi bi-book-half me-3"></i>
          Sách đang mượn
        </h1>
        <p class="page-subtitle">
          Quản lý các sách bạn đã mượn và theo dõi thời hạn trả
        </p>
      </div>

      <!-- Stats Summary -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="stat-mini primary">
            <div class="stat-icon">
              <i class="bi bi-clock"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ summary.pending || 0 }}</div>
              <div class="stat-label">Chờ duyệt</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="stat-mini success">
            <div class="stat-icon">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ summary.approved || 0 }}</div>
              <div class="stat-label">Đã duyệt</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="stat-mini info">
            <div class="stat-icon">
              <i class="bi bi-book"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ summary.borrowed || 0 }}</div>
              <div class="stat-label">Đang mượn</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="stat-mini danger">
            <div class="stat-icon">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ summary.overdue || 0 }}</div>
              <div class="stat-label">Quá hạn</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section mb-4">
        <div class="client-card">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-4">
                <label class="form-label">Trạng thái</label>
                <select
                  v-model="filters.status"
                  class="form-select"
                  @change="fetchBorrows"
                >
                  <option value="">Tất cả</option>
                  <option value="Chờ duyệt">Chờ duyệt</option>
                  <option value="Đã duyệt">Đã duyệt</option>
                  <option value="Đã mượn">Đang mượn</option>
                  <option value="overdue">Quá hạn</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label">Sắp xếp</label>
                <select
                  v-model="filters.sort"
                  class="form-select"
                  @change="fetchBorrows"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="due-date">Gần đến hạn</option>
                  <option value="overdue">Quá hạn trước</option>
                </select>
              </div>

              <div class="col-md-4 d-flex align-items-end">
                <button
                  @click="refreshData"
                  class="btn btn-outline-primary w-100"
                >
                  <i class="bi bi-arrow-clockwise me-2"></i>
                  Làm mới
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Books List -->
      <div class="books-section">
        <!-- Loading -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <div class="mt-3">Đang tải danh sách...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="borrows.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <i class="bi bi-inbox"></i>
          </div>
          <h4 class="empty-state-title">Chưa có sách nào</h4>
          <p class="empty-state-description">
            {{ getEmptyMessage() }}
          </p>
          <router-link to="/sach" class="btn btn-primary-gradient">
            <i class="bi bi-search me-2"></i>
            Khám phá sách
          </router-link>
        </div>

        <!-- Books Grid -->
        <div v-else class="row">
          <div v-for="borrow in borrows" :key="borrow._id" class="col-12 mb-3">
            <BorrowBookCard :borrow="borrow" @action="handleAction" />
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="pagination-wrapper">
          <nav>
            <ul class="pagination justify-content-center">
              <li
                class="page-item"
                :class="{ disabled: pagination.current <= 1 }"
              >
                <button
                  class="page-link"
                  @click="changePage(pagination.current - 1)"
                  :disabled="pagination.current <= 1"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>

              <li
                v-for="page in getVisiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === pagination.current }"
              >
                <button
                  v-if="page !== '...'"
                  class="page-link"
                  @click="changePage(page)"
                >
                  {{ page }}
                </button>
                <span v-else class="page-link">...</span>
              </li>

              <li
                class="page-item"
                :class="{ disabled: pagination.current >= pagination.pages }"
              >
                <button
                  class="page-link"
                  @click="changePage(pagination.current + 1)"
                  :disabled="pagination.current >= pagination.pages"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api";
import BorrowBookCard from "@/components/user/BorrowBookCard.vue";

export default {
  name: "MyBooks",
  components: {
    BorrowBookCard,
  },
  setup() {
    const toast = useToast();

    const borrows = ref([]);
    const summary = ref({});
    const isLoading = ref(false);

    const filters = reactive({
      status: "",
      sort: "newest",
      page: 1,
      limit: 10,
    });

    const pagination = reactive({
      current: 1,
      pages: 1,
      total: 0,
      limit: 10,
    });

    // Computed
    const getVisiblePages = computed(() => {
      const pages = [];
      const total = pagination.pages;
      const current = pagination.current;

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i);
          pages.push("...");
          pages.push(total);
        } else if (current >= total - 3) {
          pages.push(1);
          pages.push("...");
          for (let i = total - 4; i <= total; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push("...");
          for (let i = current - 1; i <= current + 1; i++) pages.push(i);
          pages.push("...");
          pages.push(total);
        }
      }

      return pages;
    });

    // Methods
    const fetchBorrows = async () => {
      try {
        isLoading.value = true;

        const params = {
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
        };

        if (filters.status) {
          if (filters.status === "overdue") {
            params.overdue = true;
          } else {
            params.status = filters.status;
          }
        }

        const response = await api.borrowing.getMyBorrows(params);

        if (response.success) {
          borrows.value = response.data;
          Object.assign(pagination, response.pagination);

          // Calculate summary
          calculateSummary();
        }
      } catch (error) {
        console.error("Error fetching borrows:", error);
        toast.error("Có lỗi khi tải danh sách sách");
      } finally {
        isLoading.value = false;
      }
    };

    const calculateSummary = () => {
      const statusCounts = borrows.value.reduce((acc, borrow) => {
        if (isOverdue(borrow)) {
          acc.overdue = (acc.overdue || 0) + 1;
        } else {
          acc[borrow.TrangThai] = (acc[borrow.TrangThai] || 0) + 1;
        }
        return acc;
      }, {});

      summary.value = {
        pending: statusCounts["Chờ duyệt"] || 0,
        approved: statusCounts["Đã duyệt"] || 0,
        borrowed: statusCounts["Đã mượn"] || 0,
        overdue: statusCounts.overdue || 0,
      };
    };

    const isOverdue = (borrow) => {
      if (borrow.TrangThai !== "Đã mượn") return false;
      const dueDate = new Date(borrow.NgayTraDuKien);
      const now = new Date();
      return now > dueDate;
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages && page !== "...") {
        filters.page = page;
        fetchBorrows();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const refreshData = () => {
      fetchBorrows();
      toast.info("Đã làm mới dữ liệu");
    };

    const getEmptyMessage = () => {
      if (filters.status) {
        const messages = {
          "Chờ duyệt": "Bạn chưa có phiếu mượn nào đang chờ duyệt",
          "Đã duyệt": "Bạn chưa có phiếu mượn nào đã được duyệt",
          "Đã mượn": "Bạn chưa mượn sách nào",
          overdue: "Bạn không có sách nào quá hạn",
        };
        return messages[filters.status] || "Không có kết quả phù hợp";
      }
      return "Bạn chưa mượn sách nào. Hãy khám phá và mượn những cuốn sách yêu thích!";
    };

    const handleAction = (action) => {
      // Handle actions from BorrowBookCard
      if (action.type === "extend" || action.type === "cancel") {
        fetchBorrows();
      }
    };

    // Lifecycle
    onMounted(() => {
      fetchBorrows();
    });

    return {
      borrows,
      summary,
      isLoading,
      filters,
      pagination,
      getVisiblePages,
      fetchBorrows,
      changePage,
      refreshData,
      getEmptyMessage,
      handleAction,
    };
  },
};
</script>

<style scoped>
.stat-mini {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-mini:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.stat-mini.primary {
  border-left: 4px solid var(--primary-color);
}
.stat-mini.success {
  border-left: 4px solid var(--success-color);
}
.stat-mini.info {
  border-left: 4px solid var(--accent-color);
}
.stat-mini.danger {
  border-left: 4px solid var(--danger-color);
}

.stat-mini .stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.stat-mini.primary .stat-icon {
  background: var(--primary-color);
}
.stat-mini.success .stat-icon {
  background: var(--success-color);
}
.stat-mini.info .stat-icon {
  background: var(--accent-color);
}
.stat-mini.danger .stat-icon {
  background: var(--danger-color);
}

.stat-mini .stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.25rem;
}

.stat-mini .stat-label {
  color: #6b7280;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
}

.filters-section .client-card {
  border: 1px solid #e5e7eb;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .stat-mini {
    padding: 1rem;
  }

  .stat-mini .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .stat-mini .stat-number {
    font-size: 1.2rem;
  }
}
</style>
