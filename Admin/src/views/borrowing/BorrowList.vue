<template>
  <div class="borrow-list fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Quản lý mượn sách</h1>
          <p class="page-subtitle">Theo dõi và xử lý các phiếu mượn sách</p>
        </div>
        <div class="d-flex gap-2">
          <button
            @click="showQuickLendModal = true"
            class="btn btn-success btn-custom"
          >
            <i class="bi bi-plus-circle me-2"></i>
            Cho mượn nhanh
          </button>
          <button @click="refreshData" class="btn btn-outline-primary">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Làm mới
          </button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card warning">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-warning">
                {{ stats.pending || 0 }}
              </div>
              <p class="stats-label">Chờ duyệt</p>
            </div>
            <i class="bi bi-clock stats-icon text-warning"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card info">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-info">
                {{ stats.approved || 0 }}
              </div>
              <p class="stats-label">Đã duyệt</p>
            </div>
            <i class="bi bi-check-circle stats-icon text-info"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card primary">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-primary">
                {{ stats.borrowed || 0 }}
              </div>
              <p class="stats-label">Đang mượn</p>
            </div>
            <i class="bi bi-book stats-icon text-primary"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card danger">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-danger">
                {{ stats.overdue || 0 }}
              </div>
              <p class="stats-label">Quá hạn</p>
            </div>
            <i class="bi bi-exclamation-triangle stats-icon text-danger"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="admin-card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Tìm kiếm</label>
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="Tên độc giả, tên sách..."
                @input="debouncedSearch"
              />
            </div>
          </div>

          <div class="col-md-2">
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
              <option value="Đã trả">Đã trả</option>
              <option value="Từ chối">Từ chối</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label">Thời gian</label>
            <select
              v-model="filters.timeRange"
              class="form-select"
              @change="fetchBorrows"
            >
              <option value="">Tất cả</option>
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
            </select>
          </div>

          <div class="col-md-3">
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

          <div class="col-md-2 d-flex align-items-end">
            <button
              @click="resetFilters"
              class="btn btn-outline-secondary w-100"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Borrows Table -->
    <div class="admin-card">
      <div
        class="card-header-custom d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-arrow-left-right me-2"></i>
          Danh sách phiếu mượn ({{ pagination.total }})
        </h5>
        <div class="d-flex gap-2">
          <div class="btn-group" role="group">
            <button
              v-for="status in quickFilters"
              :key="status.value"
              @click="quickFilter(status.value)"
              class="btn btn-sm"
              :class="
                filters.status === status.value
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              "
            >
              <i :class="status.icon"></i>
              {{ status.label }}
              <span
                v-if="stats[status.key]"
                class="badge bg-light text-dark ms-1"
              >
                {{ stats[status.key] }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="isLoading" class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="mt-2">Đang tải dữ liệu...</div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="borrows.length === 0"
          class="text-center p-5 text-muted"
        >
          <i class="bi bi-inbox display-4 d-block mb-3"></i>
          <h5>Không có phiếu mượn nào</h5>
          <p>
            {{
              filters.search
                ? "Không tìm thấy phiếu mượn phù hợp"
                : "Chưa có phiếu mượn nào trong hệ thống"
            }}
          </p>
        </div>

        <!-- Borrows Table -->
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 60px">#</th>
                <th>Độc giả</th>
                <th>Sách</th>
                <th style="width: 120px">Trạng thái</th>
                <th style="width: 120px">Ngày mượn</th>
                <th style="width: 120px">Ngày trả dự kiến</th>
                <th style="width: 100px">Còn lại</th>
                <th style="width: 150px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(borrow, index) in borrows"
                :key="borrow._id"
                :class="{ 'table-warning': isOverdue(borrow) }"
              >
                <td>
                  {{ (pagination.current - 1) * pagination.limit + index + 1 }}
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="user-avatar me-2">
                      {{ getUserInitials(borrow.MaDocGia) }}
                    </div>
                    <div>
                      <div class="fw-medium">
                        {{ getFullName(borrow.MaDocGia) }}
                      </div>
                      <small class="text-muted">{{
                        borrow.MaDocGia?.Email
                      }}</small>
                      <div class="text-info small">
                        {{ borrow.MaDocGia?.MaDocGia }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center">
                    <img
                      :src="getBookImage(borrow.MaSach?.BiaSach)"
                      :alt="borrow.MaSach?.TenSach"
                      class="book-thumbnail me-2"
                    />
                    <div>
                      <div class="fw-medium">{{ borrow.MaSach?.TenSach }}</div>
                      <small class="text-muted">{{
                        borrow.MaSach?.TacGia
                      }}</small>
                      <div class="text-info small">
                        {{ borrow.MaSach?.MaSach }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    class="badge"
                    :class="getStatusBadgeClass(borrow.TrangThai)"
                  >
                    <i
                      :class="getStatusIcon(borrow.TrangThai)"
                      class="me-1"
                    ></i>
                    {{ borrow.TrangThai }}
                  </span>
                  <div v-if="isOverdue(borrow)" class="text-danger small mt-1">
                    <i class="bi bi-exclamation-triangle me-1"></i>
                    Quá hạn {{ getDaysOverdue(borrow) }} ngày
                  </div>
                </td>
                <td>
                  <small>{{
                    formatDate(borrow.NgayMuon || borrow.createdAt)
                  }}</small>
                </td>
                <td>
                  <small :class="{ 'text-danger': isOverdue(borrow) }">
                    {{ formatDate(borrow.NgayTraDuKien) }}
                  </small>
                </td>
                <td>
                  <span :class="getDaysLeftClass(borrow)">
                    {{ getDaysLeft(borrow) }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button
                      v-if="borrow.TrangThai === 'Chờ duyệt'"
                      @click="approveBorrow(borrow)"
                      class="btn btn-sm btn-success"
                      title="Duyệt"
                    >
                      <i class="bi bi-check"></i>
                    </button>
                    <button
                      v-if="borrow.TrangThai === 'Đã duyệt'"
                      @click="lendBook(borrow)"
                      class="btn btn-sm btn-primary"
                      title="Cho mượn"
                    >
                      <i class="bi bi-arrow-right"></i>
                    </button>
                    <button
                      v-if="borrow.TrangThai === 'Đã mượn'"
                      @click="returnBook(borrow)"
                      class="btn btn-sm btn-info"
                      title="Trả sách"
                    >
                      <i class="bi bi-arrow-left"></i>
                    </button>
                    <button
                      v-if="
                        ['Chờ duyệt', 'Đã duyệt'].includes(borrow.TrangThai)
                      "
                      @click="rejectBorrow(borrow)"
                      class="btn btn-sm btn-danger"
                      title="Từ chối"
                    >
                      <i class="bi bi-x"></i>
                    </button>
                    <button
                      @click="viewBorrowDetail(borrow)"
                      class="btn btn-sm btn-outline-secondary"
                      title="Chi tiết"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.pages > 1" class="card-footer">
        <nav>
          <ul class="pagination justify-content-center mb-0">
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
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
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

    <!-- Modals -->
    <QuickLendModal
      :show="showQuickLendModal"
      @close="showQuickLendModal = false"
      @saved="handleBorrowSaved"
    />

    <BorrowDetailModal
      :show="showDetailModal"
      :borrow="selectedBorrow"
      @close="showDetailModal = false"
      @statusChanged="handleBorrowSaved"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import api from "@/services/api";
import QuickLendModal from "@/components/modals/QuickLendModal.vue";
import BorrowDetailModal from "@/components/modals/BorrowDetailModal.vue";

export default {
  name: "BorrowList",
  components: {
    QuickLendModal,
    BorrowDetailModal,
  },
  setup() {
    const toast = useToast();

    const borrows = ref([]);
    const stats = ref({});
    const isLoading = ref(false);
    const showQuickLendModal = ref(false);
    const showDetailModal = ref(false);
    const selectedBorrow = ref(null);

    const filters = reactive({
      search: "",
      status: "",
      timeRange: "",
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

    const quickFilters = [
      {
        value: "Chờ duyệt",
        label: "Chờ duyệt",
        icon: "bi bi-clock",
        key: "pending",
      },
      {
        value: "Đã duyệt",
        label: "Đã duyệt",
        icon: "bi bi-check-circle",
        key: "approved",
      },
      {
        value: "Đã mượn",
        label: "Đang mượn",
        icon: "bi bi-book",
        key: "borrowed",
      },
      {
        value: "overdue",
        label: "Quá hạn",
        icon: "bi bi-exclamation-triangle",
        key: "overdue",
      },
    ];

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

      return pages.filter(
        (page) =>
          page !== "..." || pages.indexOf(page) === pages.lastIndexOf(page)
      );
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

        if (filters.search) params.search = filters.search;
        if (filters.status) params.trangthai = filters.status;
        if (filters.timeRange) params.timeRange = filters.timeRange;

        const response = await api.get("/muonsach", { params });

        if (response.success) {
          borrows.value = response.data;
          Object.assign(pagination, response.pagination);
        }
      } catch (error) {
        console.error("Error fetching borrows:", error);
        toast.error("Có lỗi khi tải danh sách phiếu mượn");
      } finally {
        isLoading.value = false;
      }
    };

    const fetchStats = async () => {
      try {
        const response = await api.get("/muonsach/stats");
        if (response.success) {
          stats.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const debouncedSearch = debounce(() => {
      filters.page = 1;
      fetchBorrows();
    }, 500);

    const resetFilters = () => {
      filters.search = "";
      filters.status = "";
      filters.timeRange = "";
      filters.sort = "newest";
      filters.page = 1;
      fetchBorrows();
    };

    const quickFilter = (status) => {
      filters.status = filters.status === status ? "" : status;
      filters.page = 1;
      fetchBorrows();
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages && page !== "...") {
        filters.page = page;
        fetchBorrows();
      }
    };

    const refreshData = () => {
      fetchBorrows();
      fetchStats();
    };

    const approveBorrow = async (borrow) => {
      try {
        await api.put(`/muonsach/status/${borrow._id}`, {
          TrangThai: "Đã duyệt",
        });
        toast.success("Duyệt phiếu mượn thành công");
        refreshData();
      } catch (error) {
        console.error("Error approving borrow:", error);
      }
    };

    const lendBook = async (borrow) => {
      try {
        await api.put(`/muonsach/status/${borrow._id}`, {
          TrangThai: "Đã mượn",
        });
        toast.success("Cho mượn sách thành công");
        refreshData();
      } catch (error) {
        console.error("Error lending book:", error);
      }
    };

    const returnBook = async (borrow) => {
      const result = await Swal.fire({
        title: "Xác nhận trả sách",
        text: `Xác nhận trả sách "${borrow.MaSach?.TenSach}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        try {
          await api.put(`/muonsach/status/${borrow._id}`, {
            TrangThai: "Đã trả",
          });
          toast.success("Trả sách thành công");
          refreshData();
        } catch (error) {
          console.error("Error returning book:", error);
        }
      }
    };

    const rejectBorrow = async (borrow) => {
      const { value: reason } = await Swal.fire({
        title: "Từ chối phiếu mượn",
        input: "textarea",
        inputLabel: "Lý do từ chối",
        inputPlaceholder: "Nhập lý do từ chối...",
        showCancelButton: true,
        confirmButtonText: "Từ chối",
        cancelButtonText: "Hủy",
        inputValidator: (value) => {
          if (!value) {
            return "Vui lòng nhập lý do từ chối";
          }
        },
      });

      if (reason) {
        try {
          await api.put(`/muonsach/status/${borrow._id}`, {
            TrangThai: "Từ chối",
            LyDoTuChoi: reason,
          });
          toast.success("Từ chối phiếu mượn thành công");
          refreshData();
        } catch (error) {
          console.error("Error rejecting borrow:", error);
        }
      }
    };

    const viewBorrowDetail = (borrow) => {
      selectedBorrow.value = borrow;
      showDetailModal.value = true;
    };

    const handleBorrowSaved = () => {
      refreshData();
    };

    // Helper functions
    const getFullName = (user) => {
      if (!user) return "N/A";
      return `${user.HoLot || ""} ${user.Ten || ""}`.trim();
    };

    const getUserInitials = (user) => {
      if (!user) return "U";
      const fullName = getFullName(user);
      const names = fullName.split(" ");
      return names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0];
    };

    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const getStatusBadgeClass = (status) => {
      const classes = {
        "Chờ duyệt": "bg-warning",
        "Đã duyệt": "bg-info",
        "Đã mượn": "bg-primary",
        "Đã trả": "bg-success",
        "Từ chối": "bg-danger",
      };
      return classes[status] || "bg-secondary";
    };

    const getStatusIcon = (status) => {
      const icons = {
        "Chờ duyệt": "bi bi-clock",
        "Đã duyệt": "bi bi-check-circle",
        "Đã mượn": "bi bi-book",
        "Đã trả": "bi bi-check-square",
        "Từ chối": "bi bi-x-circle",
      };
      return icons[status] || "bi bi-question-circle";
    };

    const isOverdue = (borrow) => {
      if (borrow.TrangThai !== "Đã mượn") return false;
      const dueDate = new Date(borrow.NgayTraDuKien);
      const now = new Date();
      return now > dueDate;
    };

    const getDaysOverdue = (borrow) => {
      if (!isOverdue(borrow)) return 0;
      const dueDate = new Date(borrow.NgayTraDuKien);
      const now = new Date();
      const diffTime = now - dueDate;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getDaysLeft = (borrow) => {
      if (borrow.TrangThai !== "Đã mượn") return "-";
      const dueDate = new Date(borrow.NgayTraDuKien);
      const now = new Date();
      const diffTime = dueDate - now;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days < 0) return `Quá ${Math.abs(days)} ngày`;
      if (days === 0) return "Hôm nay";
      return `${days} ngày`;
    };

    const getDaysLeftClass = (borrow) => {
      if (borrow.TrangThai !== "Đã mượn") return "";
      const dueDate = new Date(borrow.NgayTraDuKien);
      const now = new Date();
      const diffTime = dueDate - now;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days < 0) return "text-danger fw-bold";
      if (days <= 2) return "text-warning fw-bold";
      return "text-muted";
    };

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Debounce function
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    // Lifecycle
    onMounted(() => {
      fetchBorrows();
      fetchStats();
    });

    return {
      borrows,
      stats,
      isLoading,
      showQuickLendModal,
      showDetailModal,
      selectedBorrow,
      filters,
      pagination,
      quickFilters,
      getVisiblePages,
      fetchBorrows,
      debouncedSearch,
      resetFilters,
      quickFilter,
      changePage,
      refreshData,
      approveBorrow,
      lendBook,
      returnBook,
      rejectBorrow,
      viewBorrowDetail,
      handleBorrowSaved,
      getFullName,
      getUserInitials,
      getBookImage,
      getStatusBadgeClass,
      getStatusIcon,
      isOverdue,
      getDaysOverdue,
      getDaysLeft,
      getDaysLeftClass,
      formatDate,
    };
  },
};
</script>

<style scoped>
.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.book-thumbnail {
  width: 40px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
}

.table-warning {
  background-color: rgba(255, 193, 7, 0.1) !important;
}

.btn-group .btn {
  border-radius: 0.375rem !important;
  margin-right: 2px;
}

.btn-group .btn:last-child {
  margin-right: 0;
}
</style>
