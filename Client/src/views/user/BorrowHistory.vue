<template>
  <div class="borrow-history">
    <div class="container py-4">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <h1 class="page-title">
          <i class="bi bi-clock-history me-3"></i>
          Lịch sử mượn sách
        </h1>
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

      <!-- Status Tabs -->
      <div class="status-tabs mb-4">
        <div class="client-card">
          <div class="card-body p-0">
            <div class="nav nav-tabs" role="tablist">
              <button
                v-for="tab in statusTabs"
                :key="tab.value"
                class="nav-link"
                :class="{ active: activeTab === tab.value }"
                @click="setActiveTab(tab.value)"
                type="button"
              >
                <i :class="tab.icon" class="me-2"></i>
                {{ tab.label }}
                <span v-if="tab.count !== undefined" class="badge ms-2" :class="tab.badgeClass">
                  {{ tab.count }}
                </span>
              </button>
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

        <!-- History List -->
        <div v-else class="history-list">
          <div class="row g-3">
            <div
              v-for="historyItem in history"
              :key="historyItem._id"
              class="col-12"
            >
              <HistoryCard :history="historyItem" />
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
    const activeTab = ref("all");

    const filters = reactive({
      page: 1,
      limit: 10,
    });

    const statusTabs = computed(() => [
      {
        value: "all",
        label: "Tất cả",
        icon: "bi bi-list-ul",
        count: summary.value.total || 0,
        badgeClass: "bg-secondary"
      },
      {
        value: "Đã duyệt",
        label: "Đã duyệt",
        icon: "bi bi-check-circle",
        count: summary.value.approved || 0,
        badgeClass: "bg-info"
      },
      {
        value: "Từ chối",
        label: "Từ chối",
        icon: "bi bi-x-circle",
        count: summary.value.rejected || 0,
        badgeClass: "bg-danger"
      },
      {
        value: "Đang mượn",
        label: "Đang mượn",
        icon: "bi bi-book",
        count: summary.value.borrowing || 0,
        badgeClass: "bg-primary"
      },
      {
        value: "Đã trả",
        label: "Đã trả",
        icon: "bi bi-check-square",
        count: summary.value.returned || 0,
        badgeClass: "bg-success"
      },
      {
        value: "overdue",
        label: "Quá hạn",
        icon: "bi bi-exclamation-triangle",
        count: summary.value.overdue || 0,
        badgeClass: "bg-warning"
      }
    ]);

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
        };

        // Apply status filter based on active tab
        if (activeTab.value !== "all") {
          if (activeTab.value === "overdue") {
            params.overdue = true;
          } else {
            params.status = activeTab.value;
          }
        }

        const response = await api.borrowing.getBorrowHistory(params);

        if (response.success) {
          history.value = response.data;
          Object.assign(pagination, response.pagination);

          // Calculate summary
          await calculateSummary();
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        toast.error("Có lỗi khi tải lịch sử mượn sách");
      } finally {
        isLoading.value = false;
      }
    };

    const calculateSummary = async () => {
      try {
        // Fetch all data without filters to get accurate counts
        const allDataResponse = await api.borrowing.getBorrowHistory({
          page: 1,
          limit: 1000, // Get a large number to capture all records
        });

        if (allDataResponse.success) {
          const allHistory = allDataResponse.data;
          
          summary.value = {
            total: allDataResponse.pagination.total || 0,
            approved: allHistory.filter(h => h.TrangThai === "Đã duyệt").length,
            rejected: allHistory.filter(h => h.TrangThai === "Từ chối").length,
            borrowing: allHistory.filter(h => h.TrangThai === "Đang mượn").length,
            returned: allHistory.filter(h => h.TrangThai === "Đã trả").length,
            overdue: allHistory.filter(h => isOverdue(h)).length,
          };
        }
      } catch (error) {
        console.error("Error calculating summary:", error);
        // Fallback to current pagination data
        const currentHistory = history.value;
        
        summary.value = {
          total: pagination.total || 0,
          approved: currentHistory.filter(h => h.TrangThai === "Đã duyệt").length,
          rejected: currentHistory.filter(h => h.TrangThai === "Từ chối").length,
          borrowing: currentHistory.filter(h => h.TrangThai === "Đang mượn").length,
          returned: currentHistory.filter(h => h.TrangThai === "Đã trả").length,
          overdue: currentHistory.filter(h => isOverdue(h)).length,
        };
      }
    };

    const setActiveTab = (tab) => {
      activeTab.value = tab;
      filters.page = 1; // Reset to first page
      fetchHistory();
    };

    const isOverdue = (historyItem) => {
      // Items with explicit overdue status
      if (historyItem.TrangThai === "Quá hạn") return true;
      
      // Items that are actively borrowed but overdue
      if (historyItem.TrangThai !== "Đang mượn") return false;
      const dueDate = new Date(historyItem.NgayTraDuKien);
      const now = new Date();
      return now > dueDate;
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages && page !== "...") {
        filters.page = page;
        fetchHistory();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const getEmptyMessage = () => {
      if (activeTab.value === "all") {
        return "Bạn chưa mượn sách nào. Hãy khám phá và mượn những cuốn sách yêu thích!";
      }
      
      const messages = {
        "Đã duyệt": "Không có yêu cầu mượn sách nào đã được duyệt.",
        "Từ chối": "Không có yêu cầu mượn sách nào bị từ chối.",
        "Đang mượn": "Bạn hiện không đang mượn sách nào.",
        "Đã trả": "Bạn chưa trả sách nào.",
        "Quá hạn": "Không có sách nào quá hạn."
      };
      
      return messages[activeTab.value] || "Không có dữ liệu.";
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
      activeTab,
      statusTabs,
      getVisiblePages,
      fetchHistory,
      setActiveTab,
      changePage,
      getEmptyMessage,
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

.status-tabs .nav-tabs {
  border: none;
  background: #f8fafc;
  border-radius: var(--border-radius);
  padding: 0.5rem;
}

.status-tabs .nav-link {
  border: none;
  border-radius: calc(var(--border-radius) - 0.25rem);
  color: #64748b;
  font-weight: 500;
  padding: 0.75rem 1.5rem;
  margin-right: 0.25rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.status-tabs .nav-link:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary-color);
}

.status-tabs .nav-link.active {
  background: var(--primary-color);
  color: white;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
}

.status-tabs .nav-link .badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

.status-tabs .nav-link.active .badge {
  background: rgba(255, 255, 255, 0.2) !important;
  color: white;
}

.history-list {
  min-height: 200px;
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

  .status-tabs .nav-tabs {
    flex-wrap: wrap;
    padding: 0.25rem;
  }

  .status-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .status-tabs .nav-link .badge {
    font-size: 0.7rem;
  }
}
</style>
