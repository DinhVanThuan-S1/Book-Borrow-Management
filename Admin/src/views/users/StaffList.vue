<template>
  <div class="staff-list fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Quản lý nhân viên</h1>
        </div>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary btn-custom"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Thêm nhân viên
        </button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="admin-card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search"></i>
              </span>
              <input
                v-model="filters.search"
                type="text"
                class="form-control"
                placeholder="Tên, email, số điện thoại..."
                @input="debouncedSearch"
              />
            </div>
          </div>

          <div class="col-md-3">
            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-funnel"></i>
              </span>
              <select
                v-model="filters.chucVu"
                class="form-select"
                @change="fetchStaffs"
              >
                <option value="">Tất cả chức vụ</option>
                <option value="Admin">Quản trị viên</option>
                <option value="NhanVien">Nhân viên</option>
              </select>
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
                @change="fetchStaffs"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="a-z">Tên A-Z</option>
                <option value="z-a">Tên Z-A</option>
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

    <!-- Staff Table -->
    <div class="admin-card">
      <div
        class="card-header-custom d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-people me-2"></i>
          Danh sách nhân viên ( {{ pagination.total }} )
        </h5>
      </div>

      <div class="card-body p-0">
        <!-- Loading -->
        <div v-if="loading" class="loading-container">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <p class="mt-2 text-muted">Đang tải danh sách nhân viên...</p>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="staffs.length === 0 && !loading"
          class="empty-state text-center py-5"
        >
          <i class="bi bi-people display-1 text-muted mb-3"></i>
          <h4 class="text-muted">Không có nhân viên nào</h4>
          <p class="text-muted mb-4">
            Thêm nhân viên đầu tiên để bắt đầu quản lý
          </p>
          <button
            @click="showCreateModal = true"
            class="btn btn-primary btn-custom"
          >
            <i class="bi bi-plus-circle me-2"></i>
            Thêm nhân viên
          </button>
        </div>

        <!-- Staff Table -->
        <div v-else>
          <table class="table table-hover table-bordered mb-0">
            <thead>
              <tr>
                <th style="width: 60px" class="text-center">STT</th>
                <th style="width: 80px" class="text-center">Avatar</th>
                <th style="width: 230px" class="text-center">
                  Thông tin cá nhân
                </th>
                <th style="width: 100px" class="text-center">Chức vụ</th>

                <th style="width: 130px" class="text-center">Số điện thoại</th>
                <th style="width: 170px" class="text-center">Địa chỉ</th>
                <th style="width: 120px" class="text-center">
                  Mã số nhân viên
                </th>
                <th style="width: 150px" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(staff, index) in staffs" :key="staff._id">
                <td class="text-center align-middle">
                  {{ (pagination.page - 1) * pagination.limit + index + 1 }}
                </td>
                <td class="text-center align-middle">
                  <div class="user-avatar-wrapper">
                    <div class="user-avatar-placeholder">
                      {{ getInitials(staff.HoTenNV) }}
                    </div>
                  </div>
                </td>
                <td class="align-middle">
                  <div>
                    <div class="fw-bold">{{ staff.HoTenNV }}</div>
                    <div class="text-muted small">{{ staff.Email }}</div>
                  </div>
                </td>
                <td class="text-center align-middle">
                  <span :class="getRoleBadgeClass(staff.ChucVu)">
                    <i :class="getRoleIcon(staff.ChucVu)" class="me-1"></i>
                    {{ getRoleText(staff.ChucVu) }}
                  </span>
                </td>

                <td class="align-middle">
                  <div class="small">
                    <div class="text-muted">
                      <i class="bi bi-telephone me-1"></i>
                      {{ staff.SoDienThoai || "-" }}
                    </div>
                  </div>
                </td>
                <td class="align-middle">
                  <div
                    class="text-muted text-truncate small"
                    style="max-width: 280px"
                    :title="staff.DiaChi"
                  >
                    <i class="bi bi-geo-alt me-1"></i>
                    {{ staff.DiaChi || "-" }}
                  </div>
                </td>
                <td class="text-center align-middle">
                  <code class="bg-light px-2 py-1 rounded">{{
                    staff.MSNV || "N/A"
                  }}</code>
                </td>
                <td class="text-center align-middle">
                  <div class="btn-group" role="group">
                    <button
                      @click="viewStaff(staff)"
                      class="btn btn-sm btn-outline-info"
                      title="Xem chi tiết"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      @click="editStaff(staff)"
                      class="btn btn-sm btn-outline-primary"
                      title="Chỉnh sửa"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      @click="deleteStaff(staff)"
                      class="btn btn-sm btn-outline-danger"
                      title="Xóa"
                      v-if="canDeleteStaff(staff)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="card-footer">
        <nav>
          <ul class="pagination justify-content-center mb-0">
            <li class="page-item" :class="{ disabled: pagination.page <= 1 }">
              <button
                class="page-link"
                @click="changePage(pagination.page - 1)"
                :disabled="pagination.page <= 1"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>

            <li
              v-for="page in getVisiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === pagination.page }"
            >
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
            </li>

            <li
              class="page-item"
              :class="{ disabled: pagination.page >= pagination.totalPages }"
            >
              <button
                class="page-link"
                @click="changePage(pagination.page + 1)"
                :disabled="pagination.page >= pagination.totalPages"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Staff Modal -->
    <StaffModal
      v-if="showCreateModal || showEditModal"
      :show="showCreateModal || showEditModal"
      :staff="selectedStaff"
      :mode="showEditModal ? 'edit' : 'create'"
      @close="closeModal"
      @success="handleModalSuccess"
    />

    <!-- Staff Detail Modal -->
    <StaffDetailModal
      v-if="showDetailModal"
      :show="showDetailModal"
      :staff="selectedStaff"
      @close="showDetailModal = false"
      @edit="editFromDetail"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import api from "@/services/api";
import StaffModal from "@/components/modals/StaffModal.vue";
import StaffDetailModal from "@/components/modals/StaffDetailModal.vue";

export default {
  name: "StaffList",
  components: {
    StaffModal,
    StaffDetailModal,
  },
  setup() {
    const toast = useToast();

    // Reactive data
    const staffs = ref([]);
    const loading = ref(false);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const showDetailModal = ref(false);
    const selectedStaff = ref(null);

    const filters = reactive({
      search: "",
      chucVu: "",
      sort: "newest",
    });

    const pagination = reactive({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });

    // Search debounce
    let searchTimeout = null;
    const debouncedSearch = () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        pagination.page = 1;
        fetchStaffs();
      }, 500);
    };

    // Computed
    const getVisiblePages = computed(() => {
      const pages = [];
      const total = pagination.totalPages;
      const current = pagination.page;

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
    const fetchStaffs = async () => {
      loading.value = true;
      try {
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          search: filters.search.trim(),
          chucvu: filters.chucVu, // Fixed: Use lowercase 'chucvu' to match server
          sort: filters.sort,
        };

        // Remove empty params
        Object.keys(params).forEach((key) => {
          if (params[key] === "") {
            delete params[key];
          }
        });

        const response = await api.get("/nhanvien", { params });

        if (response.success) {
          // For paginated response structure: { success: true, data: [], pagination: {} }
          staffs.value = response.data || [];
          pagination.total = response.pagination?.total || 0;
          pagination.totalPages = response.pagination?.pages || 0;
        } else {
          staffs.value = [];
          pagination.total = 0;
          pagination.totalPages = 0;
        }
      } catch (error) {
        console.error("Error fetching staffs:", error);
        toast.error("Không thể tải danh sách nhân viên");
        staffs.value = [];
        pagination.total = 0;
        pagination.totalPages = 0;
      } finally {
        loading.value = false;
      }
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.totalPages && page !== "...") {
        pagination.page = page;
        fetchStaffs();
      }
    };

    const changeLimit = () => {
      pagination.page = 1;
      fetchStaffs();
    };

    const resetFilters = () => {
      filters.search = "";
      filters.chucVu = "";
      filters.sort = "newest";
      pagination.page = 1;
      fetchStaffs();
    };

    const viewStaff = (staff) => {
      selectedStaff.value = staff;
      showDetailModal.value = true;
    };

    const editStaff = (staff) => {
      selectedStaff.value = { ...staff };
      showEditModal.value = true;
    };

    const editFromDetail = (staff) => {
      showDetailModal.value = false;
      setTimeout(() => {
        selectedStaff.value = { ...staff };
        showEditModal.value = true;
      }, 100);
    };

    const deleteStaff = async (staff) => {
      const result = await Swal.fire({
        title: "Xác nhận xóa",
        text: `Bạn có chắc chắn muốn xóa nhân viên "${staff.HoTenNV}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
        allowOutsideClick: false,
        allowEscapeKey: true,
      });

      if (result.isConfirmed) {
        try {
          const response = await api.delete(`/nhanvien/${staff._id}`);
          if (response.success) {
            toast.success("Xóa nhân viên thành công");
            fetchStaffs();
          }
        } catch (error) {
          console.error("Error deleting staff:", error);
          toast.error(
            error.response?.data?.message || "Không thể xóa nhân viên"
          );
        }
      }
    };

    const closeModal = () => {
      showCreateModal.value = false;
      showEditModal.value = false;
      selectedStaff.value = null;
    };

    const handleModalSuccess = () => {
      closeModal();
      fetchStaffs();
    };

    // Helper functions
    const getInitials = (name) => {
      if (!name) return "NV";
      const words = name.split(" ");
      if (words.length === 1) return words[0].charAt(0).toUpperCase();
      return (
        words[0].charAt(0) + words[words.length - 1].charAt(0)
      ).toUpperCase();
    };

    const getRoleBadgeClass = (role) => {
      const classes = {
        Admin: "badge bg-danger",
        NhanVien: "badge bg-primary",
      };
      return classes[role] || "badge bg-secondary";
    };

    const getRoleIcon = (role) => {
      const icons = {
        Admin: "bi bi-star-fill",
        NhanVien: "bi bi-person-badge",
      };
      return icons[role] || "bi bi-person";
    };

    const getRoleText = (role) => {
      const texts = {
        Admin: "Quản trị viên",
        NhanVien: "Nhân viên",
      };
      return texts[role] || role;
    };

    const canDeleteStaff = (staff) => {
      // Không cho phép xóa Admin nếu chỉ còn 1 Admin
      if (staff.ChucVu === "Admin") {
        const adminCount = staffs.value.filter(
          (s) => s.ChucVu === "Admin"
        ).length;
        return adminCount > 1;
      }
      return true;
    };

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Lifecycle
    onMounted(() => {
      fetchStaffs();
    });

    return {
      staffs,
      loading,
      filters,
      pagination,
      showCreateModal,
      showEditModal,
      showDetailModal,
      selectedStaff,
      debouncedSearch,
      getVisiblePages,
      fetchStaffs,
      changePage,
      changeLimit,
      resetFilters,
      viewStaff,
      editStaff,
      editFromDetail,
      deleteStaff,
      closeModal,
      handleModalSuccess,
      getInitials,
      getRoleBadgeClass,
      getRoleIcon,
      getRoleText,
      canDeleteStaff,
      formatDate,
    };
  },
};
</script>

<style scoped>
.user-avatar-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.user-avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #6f42c1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
}

.empty-state {
  padding: 3rem 1rem;
}

.empty-state i {
  opacity: 0.5;
}

.table td {
  vertical-align: middle;
  height: 82.8px;
}

.table th {
  border-bottom: 1px solid #dee2e6;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.5px;
  background-color: #f8f9fa;
}

.table-bordered {
  border: 1px solid #dee2e6;
}

.table-bordered th,
.table-bordered td {
  border: 1px solid #dee2e6;
}

.btn-group .btn {
  width: 41.2px;
  height: 37px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-group .btn:hover {
  transform: translateY(-1px);
}

.reset-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Custom Pagination Styles */
.pagination {
  gap: 0.25rem;
}

.pagination .page-link {
  border: 1px solid #dee2e6;
  color: #6c757d;
  padding: 0.5rem 0.75rem;
  margin: 0;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  min-width: 40px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination .page-link:hover {
  background-color: #f8f9fa;
  border-color: #0d6efd;
  color: #0d6efd;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.pagination .page-link:focus {
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
  border-color: #0d6efd;
  outline: 0;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(13, 110, 253, 0.3);
}

.pagination .page-item.active .page-link:hover {
  background-color: #0b5ed7;
  border-color: #0b5ed7;
  transform: none;
}

.pagination .page-item.disabled .page-link {
  color: #adb5bd;
  background-color: #f8f9fa;
  border-color: #dee2e6;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination .page-item.disabled .page-link:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
  color: #adb5bd;
  transform: none;
  box-shadow: none;
}

/* Navigation arrows styling */
.pagination .page-link i {
  font-size: 0.875rem;
}

/* Card footer styling for pagination */
.card-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.sticky-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.bg-pink {
  background-color: #e91e63 !important;
}
</style>
