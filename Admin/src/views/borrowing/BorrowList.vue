<template>
  <div class="borrow-list fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Quản lý mượn sách</h1>
          <!-- <p class="page-subtitle">Theo dõi và xử lý các phiếu mượn sách</p> -->
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-xl-3 col-md-3 mb-3">
        <div class="stats-card primary">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-primary">
                {{ stats.approved || 0 }}
              </div>
              <p class="stats-label">Đã duyệt</p>
            </div>
            <i class="bi bi-check-circle stats-icon text-primary"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card warning">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-warning">
                {{ stats.borrowed || 0 }}
              </div>
              <p class="stats-label">Đang mượn</p>
            </div>
            <i class="bi bi-arrow-left-right stats-icon text-warning"></i>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card success">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-success">
                {{ stats.returned || 0 }}
              </div>
              <p class="stats-label">Đã trả</p>
            </div>
            <i class="bi bi-check-square stats-icon text-success"></i>
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
          <div class="col-md-6">
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

          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-sort-down"></i>
              </span>
              <select
                v-model="filters.sort"
                class="form-select"
                @change="fetchBorrows"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
              </select>
            </div>
          </div>

          <div class="col-md-2 d-flex align-items-end">
            <button
              @click="resetFilters"
              class="btn btn-outline-secondary rounded-circle reset-btn"
              title="Reset bộ lọc"
            >
              <i class="bi bi-arrow-clockwise"></i>
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
          Danh sách phiếu mượn ( {{ pagination.total }} )
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
        <div v-else class="">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th style="width: 60px; border-right: 1px solid #dee2e6; text-align: center;">STT</th>
                <th style="width: 220px; border-right: 1px solid #dee2e6; text-align: center;">Độc giả</th>
                <th style="width: 270px; border-right: 1px solid #dee2e6; text-align: center;">Sách</th>
                <th style="width: 120px; border-right: 1px solid #dee2e6; text-align: center;">Trạng thái</th>
                <th style="width: 120px; border-right: 1px solid #dee2e6; text-align: center;">Ngày mượn</th>
                <!-- Cột Ngày trả - chỉ hiển thị khi không phải "Từ chối" -->
                <th v-if="!isRejectStatusFilter" style="width: 140px; border-right: 1px solid #dee2e6; text-align: center;">
                  {{ getDateColumnLabel() }}
                </th>
                <!-- Cột Lý do từ chối - chỉ hiển thị cho "Từ chối" -->
                <th v-if="isRejectStatusFilter" style="width: 200px; border-right: 1px solid #dee2e6; text-align: center;">Lý do từ chối</th>
                <!-- Cột Còn lại - chỉ hiển thị cho "Đã duyệt" và "Đang mượn" -->
                <th v-if="shouldShowRemainingDays" style="width: 100px; border-right: 1px solid #dee2e6; text-align: center;">Còn lại</th>
                <!-- Cột Quá hạn - chỉ hiển thị cho "Quá hạn" -->
                <th v-if="shouldShowOverdueDays" style="width: 100px; border-right: 1px solid #dee2e6; text-align: center;">Quá hạn</th>
                <th style="width: 140px; text-align: center;">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(borrow, index) in borrows"
                :key="borrow._id"
                :class="{ 'table-warning': isOverdue(borrow) }"
              >
                <td style="border-right: 1px solid #dee2e6; text-align: center; vertical-align: middle;">
                  {{ (pagination.current - 1) * pagination.limit + index + 1 }}
                </td>
                <td style="border-right: 1px solid #dee2e6; vertical-align: middle;">
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
                <td style="border-right: 1px solid #dee2e6; vertical-align: middle;">
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
                <td style="border-right: 1px solid #dee2e6; text-align: center; vertical-align: middle;">
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
                <td style="border-right: 1px solid #dee2e6; text-align: center; vertical-align: middle;">
                  <small>{{
                    formatDate(borrow.NgayMuon || borrow.createdAt)
                  }}</small>
                </td>
                <!-- Cột Ngày trả/Ngày trả thực tế - không hiển thị cho "Từ chối" -->
                <td v-if="!isRejectStatusFilter" style="border-right: 1px solid #dee2e6; text-align: center; vertical-align: middle;">
                  <small :class="{ 'text-danger': isOverdue(borrow) }">
                    {{ getDateContent(borrow) }}
                  </small>
                </td>
                <!-- Cột Lý do từ chối - chỉ hiển thị cho "Từ chối" -->
                <td v-if="isRejectStatusFilter" style="border-right: 1px solid #dee2e6; vertical-align: middle;">
                  <small class="text-danger text-truncate d-block" style="max-width: 230px;">
                    {{ borrow.LyDoTuChoi || 'Không có lý do' }}
                  </small>
                </td>
                <!-- Cột Còn lại - chỉ hiển thị cho "Đã duyệt" và "Đang mượn" -->
                <td v-if="shouldShowRemainingDays" style="border-right: 1px solid #dee2e6; text-align: center; vertical-align: middle;">
                  <span :class="getDaysLeftClass(borrow)">
                    {{ getDaysLeft(borrow) }}
                  </span>
                </td>
                <!-- Cột Quá hạn - chỉ hiển thị cho tab "Quá hạn" -->
                <td v-if="shouldShowOverdueDays" style="border-right: 1px solid #dee2e6; text-align: center; vertical-align: middle;">
                  <span class="text-danger fw-bold">
                    {{ getOverdueDaysCount(borrow) }} ngày
                  </span>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                  <div class="btn-group" role="group">
                    <!-- Nút cho trạng thái "Đã duyệt" -->
                    <button
                      v-if="borrow.TrangThai === 'Đã duyệt'"
                      @click="lendBook(borrow)"
                      class="btn btn-sm btn-outline-success"
                      title="Chuyển sang Đang mượn"
                    >
                      <i class="bi bi-arrow-right"></i>
                    </button>
                    <button
                      v-if="borrow.TrangThai === 'Đã duyệt'"
                      @click="deleteBorrow(borrow)"
                      class="btn btn-sm btn-outline-danger"
                      title="Xóa phiếu mượn"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                    
                    <!-- Nút cho trạng thái "Đang mượn" -->
                    <button
                      v-if="borrow.TrangThai === 'Đang mượn'"
                      @click="returnBook(borrow)"
                      class="btn btn-sm btn-outline-info"
                      title="Trả sách"
                    >
                      <i class="bi bi-check-square"></i>
                    </button>
                    
                    <!-- Nút cho trạng thái "Từ chối" -->
                    <button
                      v-if="borrow.TrangThai === 'Từ chối'"
                      @click="deleteBorrow(borrow)"
                      class="btn btn-sm btn-outline-danger"
                      title="Xóa phiếu mượn"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                    
                    <!-- Nút xem chi tiết cho tất cả -->
                    <button
                      @click="viewBorrowDetail(borrow)"
                      class="btn btn-sm btn-outline-info"
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
import BorrowDetailModal from "@/components/modals/BorrowDetailModal.vue";

export default {
  name: "BorrowList",
  components: {
    BorrowDetailModal,
  },
  setup() {
    const toast = useToast();

    const borrows = ref([]);
    const stats = ref({});
    const isLoading = ref(false);
    const showDetailModal = ref(false);
    const selectedBorrow = ref(null);

    const filters = reactive({
      search: "",
      status: "Đã duyệt", // Set "Đã duyệt" as default tab
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
        value: "Đã duyệt",
        label: "Đã duyệt",
        icon: "bi bi-check-circle",
        key: "approved",
      },
      {
        value: "Từ chối",
        label: "Từ chối",
        icon: "bi bi-x-circle",
        key: "rejected",
      },
      {
        value: "Đang mượn",
        label: "Đang mượn",
        icon: "bi-arrow-left-right",
        key: "borrowed",
      },
      {
        value: "Đã trả",
        label: "Đã trả",
        icon: "bi bi-check-square",
        key: "returned",
      },
      {
        value: "Quá hạn",
        label: "Quá hạn",
        icon: "bi bi-exclamation-triangle",
        key: "overdue",
      },
    ];

    // Computed
    const isRejectStatusFilter = computed(() => {
      return filters.status === "Từ chối";
    });

    const shouldShowRemainingDays = computed(() => {
      return filters.status === "Đã duyệt" || filters.status === "Đang mượn";
    });

    const shouldShowOverdueDays = computed(() => {
      return filters.status === "Quá hạn";
    });

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
        const response = await api.get("/muonsach/statistics");
        if (response.success) {
          // Xử lý dữ liệu statistics từ backend
          const rawStats = response.data;
          const processedStats = {
            total: rawStats.totalPhieuMuon || 0,
            borrowed: 0,
            returned: 0,
            approved: 0,
            rejected: 0,
            overdue: rawStats.overdueBooks || 0,
          };

          // Xử lý statusStats từ backend
          if (rawStats.statusStats) {
            rawStats.statusStats.forEach((stat) => {
              switch (stat._id) {
                case "Đã duyệt":
                  processedStats.approved = stat.count;
                  break;
                case "Đang mượn":
                  processedStats.borrowed = stat.count;
                  break;
                case "Đã trả":
                  processedStats.returned = stat.count;
                  break;
                case "Từ chối":
                  processedStats.rejected = stat.count;
                  break;
              }
            });
          }

          stats.value = processedStats;
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast.error("Có lỗi khi tải thống kê");
      }
    };

    const debouncedSearch = debounce(() => {
      filters.page = 1;
      fetchBorrows();
    }, 500);

    const resetFilters = () => {
      filters.search = "";
      filters.status = "Đã duyệt"; // Reset to default tab "Đã duyệt"
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
      const result = await Swal.fire({
        title: "Xác nhận cho mượn sách",
        text: `Xác nhận chuyển trạng thái sang "Đang mượn" cho "${borrow.MaSach?.TenSach}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Xác nhận",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        try {
          await api.put(`/muonsach/status/${borrow._id}`, {
            TrangThai: "Đang mượn",
          });
          toast.success("Chuyển trạng thái thành công");
          refreshData();
        } catch (error) {
          console.error("Error lending book:", error);
          toast.error("Có lỗi xảy ra khi chuyển trạng thái");
        }
      }
    };

    const deleteBorrow = async (borrow) => {
      const result = await Swal.fire({
        title: "Xác nhận xóa phiếu mượn",
        text: `Bạn có chắc chắn muốn xóa phiếu mượn cho "${borrow.MaSach?.TenSach}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`/muonsach/${borrow._id}`);
          toast.success("Xóa phiếu mượn thành công");
          refreshData();
        } catch (error) {
          console.error("Error deleting borrow:", error);
          toast.error("Có lỗi xảy ra khi xóa phiếu mượn");
        }
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
        "Đã duyệt": "bg-primary",
        "Đã trả": "bg-success",
        "Từ chối": "bg-danger",
        "Đang mượn": "bg-warning",
        "Quá hạn": "bg-danger",
      };
      return classes[status] || "bg-secondary";
    };

    const getStatusIcon = (status) => {
      const icons = {
        "Đã duyệt": "bi bi-check-circle",
        "Đã trả": "bi bi-check-square",
        "Từ chối": "bi bi-x-circle",
        "Đang mượn": "bi bi-arrow-left-right",
        "Quá hạn": "bi bi-exclamation-triangle",
      };
      return icons[status] || "bi bi-question-circle";
    };

    const isOverdue = (borrow) => {
      if (borrow.TrangThai !== "Đang mượn") return false;
      const dueDate = new Date(borrow.NgayTra);
      const now = new Date();
      return now > dueDate;
    };

    const getDaysOverdue = (borrow) => {
      if (!isOverdue(borrow)) return 0;
      const dueDate = new Date(borrow.NgayTra);
      const now = new Date();
      const diffTime = now - dueDate;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };

    const getDaysLeft = (borrow) => {
      if (borrow.TrangThai === "Đã duyệt") {
        const dueDate = new Date(borrow.NgayTra);
        const now = new Date();
        const diffTime = dueDate - now;
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (days < 0) return `Quá ${Math.abs(days)} ngày`;
        if (days === 0) return "Hôm nay";
        return `${days} ngày`;
      } else if (borrow.TrangThai === "Đang mượn") {
        const dueDate = new Date(borrow.NgayTra);
        const now = new Date();
        const diffTime = dueDate - now;
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (days < 0) return `Quá ${Math.abs(days)} ngày`;
        if (days === 0) return "Hôm nay";
        return `${days} ngày`;
      }
      return "-";
    };

    const getDaysLeftClass = (borrow) => {
      if (borrow.TrangThai !== "Đang mượn" && borrow.TrangThai !== "Đã duyệt") return "";
      const dueDate = new Date(borrow.NgayTra);
      const now = new Date();
      const diffTime = dueDate - now;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (days < 0) return "text-danger fw-bold";
      if (days <= 2) return "text-warning fw-bold";
      return "text-muted";
    };

    const getOverdueDaysCount = (borrow) => {
      if (borrow.TrangThai !== "Quá hạn") return "-";
      const dueDate = new Date(borrow.NgayTra);
      const now = new Date();
      const diffTime = now - dueDate;
      const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
      return days > 0 ? days : 0;
    };

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const getDateColumnLabel = () => {
      if (filters.status === "Đã trả") {
        return "Ngày trả thực tế";
      }
      return "Ngày trả dự kiến";
    };

    const getDateContent = (borrow) => {
      if (borrow.TrangThai === "Đã trả") {
        // Hiển thị ngày cập nhật cuối (khi admin chuyển trạng thái)
        return formatDate(borrow.updatedAt);
      } else if (borrow.TrangThai === "Đã duyệt" || borrow.TrangThai === "Đang mượn" || borrow.TrangThai === "Quá hạn") {
        // Hiển thị ngày trả dự kiến
        return formatDate(borrow.NgayTra);
      }
      return "-";
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
      showDetailModal,
      selectedBorrow,
      filters,
      pagination,
      quickFilters,
      isRejectStatusFilter,
      shouldShowRemainingDays,
      shouldShowOverdueDays,
      quickFilters,
      isRejectStatusFilter,
      shouldShowRemainingDays,
      shouldShowOverdueDays,
      getVisiblePages,
      fetchBorrows,
      debouncedSearch,
      resetFilters,
      quickFilter,
      debouncedSearch,
      resetFilters,
      quickFilter,
      changePage,
      refreshData,
      approveBorrow,
      lendBook,
      returnBook,
      rejectBorrow,
      deleteBorrow,
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
      getOverdueDaysCount,
      formatDate,
      getDateColumnLabel,
      getDateContent,
    };
  },
};
</script>

<style scoped>
.user-avatar {
  width: 50px;
  height: 50px;
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
  border-radius: 0.5rem !important;
  margin-right: 0.25rem;
  font-weight: 500;
  transition: all 0.3s ease-in-out;
  border-width: 1.5px;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-group .btn:last-child {
  margin-right: 0;
}

.btn-outline-success:hover {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  border-color: transparent;
}

.btn-outline-danger:hover {
  background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
  border-color: transparent;
}

.btn-outline-info:hover {
  background: linear-gradient(135deg, #17a2b8 0%, #3498db 100%);
  border-color: transparent;
}

/* Pagination styling */
.pagination {
  --bs-pagination-padding-x: 0.875rem;
  --bs-pagination-padding-y: 0.625rem;
  --bs-pagination-font-size: 0.875rem;
  --bs-pagination-color: #495057;
  --bs-pagination-bg: #fff;
  --bs-pagination-border-width: 1px;
  --bs-pagination-border-color: #e0e6ed;
  --bs-pagination-border-radius: 0.5rem;
  --bs-pagination-hover-color: #fff;
  --bs-pagination-hover-bg: #0d6efd;
  --bs-pagination-hover-border-color: #0d6efd;
  --bs-pagination-focus-color: #fff;
  --bs-pagination-focus-bg: #0d6efd;
  --bs-pagination-focus-box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
  --bs-pagination-active-color: #fff;
  --bs-pagination-active-bg: #0d6efd;
  --bs-pagination-active-border-color: #0d6efd;
  --bs-pagination-disabled-color: #adb5bd;
  --bs-pagination-disabled-bg: #f8f9fa;
  --bs-pagination-disabled-border-color: #e0e6ed;
}

.pagination .page-link {
  position: relative;
  display: block;
  color: var(--bs-pagination-color);
  text-decoration: none;
  background-color: var(--bs-pagination-bg);
  border: var(--bs-pagination-border-width) solid var(--bs-pagination-border-color);
  transition: all 0.3s ease-in-out;
  font-weight: 500;
  border-radius: var(--bs-pagination-border-radius) !important;
  margin: 0 0.125rem;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination .page-link:hover {
  z-index: 2;
  color: var(--bs-pagination-hover-color);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.pagination .page-link:focus {
  z-index: 3;
  color: var(--bs-pagination-focus-color);
  background-color: var(--bs-pagination-focus-bg);
  outline: 0;
  box-shadow: var(--bs-pagination-focus-box-shadow);
  border-color: var(--bs-pagination-focus-bg);
}

.pagination .page-item.active .page-link {
  z-index: 3;
  color: var(--bs-pagination-active-color);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

.pagination .page-item.disabled .page-link {
  color: var(--bs-pagination-disabled-color);
  pointer-events: none;
  background-color: var(--bs-pagination-disabled-bg);
  border-color: var(--bs-pagination-disabled-border-color);
  cursor: not-allowed;
  opacity: 0.5;
}

.pagination .page-item.disabled .page-link:hover {
  background-color: var(--bs-pagination-disabled-bg);
  border-color: var(--bs-pagination-disabled-border-color);
  color: var(--bs-pagination-disabled-color);
  transform: none;
  box-shadow: none;
}

/* Navigation arrows styling */
.pagination .page-link i {
  font-size: 0.875rem;
  font-weight: 600;
}

/* Card footer styling for pagination */
.card-footer {
  background: linear-gradient(to right, #f8f9fa 0%, #e9ecef 100%);
  border-top: 1px solid #dee2e6;
  padding: 1.25rem 1.5rem;
}

/* Pagination container styling */
.pagination {
  margin: 0;
  gap: 0.25rem;
}

/* Reset button styling */
.reset-btn {
  width: 38px;
  height: 35px; /* Match form-control height */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 1px solid #6c757d;
  color: #6c757d;
  transition: all 0.2s ease-in-out;
}

.reset-btn:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
  transform: rotate(180deg);
}

.reset-btn:focus {
  box-shadow: 0 0 0 0.2rem rgba(108, 117, 125, 0.25);
}

.reset-btn i {
  font-size: 1rem;
}
</style>
