<template>
  <div class="borrow-history">
    <div class="container py-4">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <h1 class="page-title">
          <i class="bi bi-clock-history me-3"></i>
          Lịch sử mượn sách
        </h1>
        <p class="page-subtitle">
          Theo dõi tất cả các lần mượn và trả sách của bạn
        </p>
      </div>

      <!-- Summary Stats -->
      <div class="row mb-4">
        <div class="col-md-3 mb-3">
          <div class="summary-card total">
            <div class="summary-icon">
              <i class="bi bi-collection"></i>
            </div>
            <div class="summary-content">
              <div class="summary-number">{{ summary.total || 0 }}</div>
              <div class="summary-label">Tổng lượt mượn</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="summary-card returned">
            <div class="summary-icon">
              <i class="bi bi-check-circle"></i>
            </div>
            <div class="summary-content">
              <div class="summary-number">{{ summary.returned || 0 }}</div>
              <div class="summary-label">Đã trả</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="summary-card overdue">
            <div class="summary-icon">
              <i class="bi bi-exclamation-triangle"></i>
            </div>
            <div class="summary-content">
              <div class="summary-number">{{ summary.overdue || 0 }}</div>
              <div class="summary-label">Đã quá hạn</div>
            </div>
          </div>
        </div>

        <div class="col-md-3 mb-3">
          <div class="summary-card rate">
            <div class="summary-icon">
              <i class="bi bi-graph-up"></i>
            </div>
            <div class="summary-content">
              <div class="summary-number">{{ summary.onTimeRate || 0 }}%</div>
              <div class="summary-label">Trả đúng hạn</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-section mb-4">
        <div class="client-card">
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-3">
                <label class="form-label">Tìm kiếm</label>
                <input
                  v-model="filters.search"
                  type="text"
                  class="form-control"
                  placeholder="Tên sách, tác giả..."
                  @keyup.enter="fetchHistory"
                />
              </div>

              <div class="col-md-2">
                <label class="form-label">Trạng thái</label>
                <select
                  v-model="filters.status"
                  class="form-select"
                  @change="fetchHistory"
                >
                  <option value="">Tất cả</option>
                  <option value="Đã trả">Đã trả</option>
                  <option value="Đã mượn">Đang mượn</option>
                  <option value="overdue">Quá hạn</option>
                  <option value="ontime">Trả đúng hạn</option>
                  <option value="late">Trả muộn</option>
                </select>
              </div>

              <div class="col-md-2">
                <label class="form-label">Từ ngày</label>
                <input
                  v-model="filters.startDate"
                  type="date"
                  class="form-control"
                  @change="fetchHistory"
                />
              </div>

              <div class="col-md-2">
                <label class="form-label">Đến ngày</label>
                <input
                  v-model="filters.endDate"
                  type="date"
                  class="form-control"
                  @change="fetchHistory"
                />
              </div>

              <div class="col-md-2">
                <label class="form-label">Sắp xếp</label>
                <select
                  v-model="filters.sort"
                  class="form-select"
                  @change="fetchHistory"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="book-title">Tên sách A-Z</option>
                  <option value="due-date">Ngày trả</option>
                </select>
              </div>

              <div class="col-md-1 d-flex align-items-end">
                <button
                  @click="resetFilters"
                  class="btn btn-outline-secondary w-100"
                >
                  <i class="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- History Content -->
      <div class="history-content">
        <!-- Loading -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <div class="mt-3">Đang tải lịch sử...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="history.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <i class="bi bi-clock-history"></i>
          </div>
          <h4 class="empty-state-title">Chưa có lịch sử mượn sách</h4>
          <p class="empty-state-description">
            {{ getEmptyMessage() }}
          </p>
          <router-link to="/sach" class="btn btn-primary-gradient">
            <i class="bi bi-search me-2"></i>
            Khám phá sách
          </router-link>
        </div>

        <!-- History Timeline -->
        <div v-else class="history-timeline">
          <div
            v-for="(historyItem, index) in history"
            :key="historyItem._id"
            class="timeline-item"
          >
            <div
              class="timeline-marker"
              :class="getTimelineMarkerClass(historyItem)"
            >
              <i :class="getTimelineIcon(historyItem)"></i>
            </div>

            <div class="timeline-content">
              <HistoryCard :history="historyItem" />
            </div>

            <!-- Date Separator -->
            <div
              v-if="shouldShowDateSeparator(historyItem, index)"
              class="date-separator"
            >
              {{
                formatDateSeparator(
                  historyItem.NgayMuon || historyItem.createdAt
                )
              }}
            </div>
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

      <!-- Export Button -->
      <div class="export-section mt-4 text-center">
        <button @click="exportHistory" class="btn btn-outline-success">
          <i class="bi bi-download me-2"></i>
          Xuất lịch sử (Excel)
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api";
import HistoryCard from "@/components/user/HistoryCard.vue";

export default {
  name: "BorrowHistory",
  components: {
    HistoryCard,
  },
  setup() {
    const toast = useToast();

    const history = ref([]);
    const summary = ref({});
    const isLoading = ref(false);

    const filters = reactive({
      search: "",
      status: "",
      startDate: "",
      endDate: "",
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
    const fetchHistory = async () => {
      try {
        isLoading.value = true;

        const params = {
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
        };

        if (filters.search) params.search = filters.search;
        if (filters.status) {
          if (filters.status === "overdue") {
            params.overdue = true;
          } else if (filters.status === "ontime") {
            params.ontime = true;
          } else if (filters.status === "late") {
            params.late = true;
          } else {
            params.status = filters.status;
          }
        }
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const response = await api.borrowing.getBorrowHistory(params);

        if (response.success) {
          history.value = response.data;
          Object.assign(pagination, response.pagination);

          // Calculate summary
          calculateSummary();
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Có lỗi khi tải lịch sử mượn sách");
      } finally {
        isLoading.value = false;
      }
    };

    const calculateSummary = () => {
      const total = pagination.total;
      const returned = history.value.filter(
        (h) => h.TrangThai === "Đã trả"
      ).length;
      const overdue = history.value.filter((h) => isOverdue(h)).length;
      const onTime = history.value.filter(
        (h) => h.TrangThai === "Đã trả" && !isReturnedLate(h)
      ).length;

      summary.value = {
        total,
        returned,
        overdue,
        onTimeRate: returned > 0 ? Math.round((onTime / returned) * 100) : 0,
      };
    };

    const isOverdue = (historyItem) => {
      if (historyItem.TrangThai !== "Đã mượn") return false;
      const dueDate = new Date(historyItem.NgayTraDuKien);
      const now = new Date();
      return now > dueDate;
    };

    const isReturnedLate = (historyItem) => {
      if (historyItem.TrangThai !== "Đã trả" || !historyItem.NgayTraThucTe)
        return false;
      const dueDate = new Date(historyItem.NgayTraDuKien);
      const returnDate = new Date(historyItem.NgayTraThucTe);
      return returnDate > dueDate;
    };

    const getTimelineMarkerClass = (historyItem) => {
      if (historyItem.TrangThai === "Đã trả") {
        return isReturnedLate(historyItem) ? "warning" : "success";
      }
      if (isOverdue(historyItem)) return "danger";
      if (historyItem.TrangThai === "Đã mượn") return "primary";
      return "secondary";
    };

    const getTimelineIcon = (historyItem) => {
      if (historyItem.TrangThai === "Đã trả") return "bi bi-check-circle";
      if (isOverdue(historyItem)) return "bi bi-exclamation-triangle";
      if (historyItem.TrangThai === "Đã mượn") return "bi bi-book";
      return "bi bi-clock";
    };

    const shouldShowDateSeparator = (historyItem, index) => {
      if (index === 0) return true;

      const currentDate = new Date(
        historyItem.NgayMuon || historyItem.createdAt
      );
      const prevDate = new Date(
        history.value[index - 1].NgayMuon || history.value[index - 1].createdAt
      );

      return currentDate.toDateString() !== prevDate.toDateString();
    };

    const formatDateSeparator = (date) => {
      const dateObj = new Date(date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);

      if (dateObj.toDateString() === today.toDateString()) {
        return "Hôm nay";
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        return "Hôm qua";
      } else {
        return dateObj.toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
      }
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages && page !== "...") {
        filters.page = page;
        fetchHistory();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const resetFilters = () => {
      Object.assign(filters, {
        search: "",
        status: "",
        startDate: "",
        endDate: "",
        sort: "newest",
        page: 1,
      });
      fetchHistory();
    };

    const getEmptyMessage = () => {
      if (
        filters.search ||
        filters.status ||
        filters.startDate ||
        filters.endDate
      ) {
        return "Không tìm thấy kết quả phù hợp với bộ lọc của bạn.";
      }
      return "Bạn chưa mượn sách nào. Hãy khám phá và mượn những cuốn sách yêu thích!";
    };

    const exportHistory = async () => {
      try {
        toast.info("Đang tạo file Excel...");

        const params = {
          export: true,
          format: "excel",
        };

        if (filters.search) params.search = filters.search;
        if (filters.status) params.status = filters.status;
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;

        const response = await api.get("/muonsach/my-history", {
          params,
          responseType: "blob",
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `lich-su-muon-sach-${new Date().toISOString().split("T")[0]}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Xuất file Excel thành công");
      } catch (error) {
        console.error("Error exporting history:", error);
        toast.error("Có lỗi khi xuất file Excel");
      }
    };

    // Lifecycle
    onMounted(() => {
      fetchHistory();
    });

    return {
      history,
      summary,
      isLoading,
      filters,
      pagination,
      getVisiblePages,
      fetchHistory,
      changePage,
      resetFilters,
      getEmptyMessage,
      exportHistory,
      getTimelineMarkerClass,
      getTimelineIcon,
      shouldShowDateSeparator,
      formatDateSeparator,
    };
  },
};
</script>

<style scoped>
.summary-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  height: 100%;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.summary-card.total {
  border-left: 4px solid var(--primary-color);
}
.summary-card.returned {
  border-left: 4px solid var(--success-color);
}
.summary-card.overdue {
  border-left: 4px solid var(--danger-color);
}
.summary-card.rate {
  border-left: 4px solid var(--accent-color);
}

.summary-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.summary-card.total .summary-icon {
  background: var(--primary-color);
}
.summary-card.returned .summary-icon {
  background: var(--success-color);
}
.summary-card.overdue .summary-icon {
  background: var(--danger-color);
}
.summary-card.rate .summary-icon {
  background: var(--accent-color);
}

.summary-number {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.25rem;
}

.summary-label {
  color: #6b7280;
  font-weight: 500;
  font-size: 0.9rem;
}

.history-timeline {
  position: relative;
  padding-left: 2rem;
}

.history-timeline::before {
  content: "";
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e5e7eb;
}

.timeline-item {
  position: relative;
  margin-bottom: 2rem;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 1rem;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.timeline-marker.primary {
  background: var(--primary-color);
}
.timeline-marker.success {
  background: var(--success-color);
}
.timeline-marker.warning {
  background: var(--warning-color);
}
.timeline-marker.danger {
  background: var(--danger-color);
}
.timeline-marker.secondary {
  background: #6c757d;
}

.timeline-content {
  margin-left: 1rem;
}

.date-separator {
  position: absolute;
  left: -8rem;
  top: 0;
  background: var(--gradient-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: var(--box-shadow);
}

.filters-section .client-card {
  border: 1px solid #e5e7eb;
}

.export-section {
  border-top: 1px solid #e5e7eb;
  padding-top: 2rem;
}

@media (max-width: 768px) {
  .summary-card {
    padding: 1rem;
  }

  .summary-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .summary-number {
    font-size: 1.5rem;
  }

  .history-timeline {
    padding-left: 1.5rem;
  }

  .timeline-marker {
    left: -1.5rem;
    width: 24px;
    height: 24px;
    font-size: 0.8rem;
  }

  .date-separator {
    position: static;
    margin-bottom: 1rem;
    display: inline-block;
  }
}
</style>
