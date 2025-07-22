<template>
  <div class="user-list fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Quản lý độc giả</h1>
          <!-- <p class="page-subtitle">Danh sách tất cả độc giả trong hệ thống</p> -->
        </div>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary btn-custom"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Thêm độc giả
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
                v-model="filters.gender"
                class="form-select"
                @change="fetchUsers"
              >
                <option value="">Tất cả</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
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
                @change="fetchUsers"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="a-z">Tên A-Z</option>
                <option value="z-a">Tên Z-A</option>
                <option value="most-borrowed">Mượn nhiều nhất</option>
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

    <!-- Users Table -->
    <div class="admin-card">
      <div
        class="card-header-custom d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-people me-2"></i>
          Danh sách độc giả ( {{ pagination.total }} )
        </h5>
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
        <div v-else-if="users.length === 0" class="text-center p-5 text-muted">
          <i class="bi bi-people display-4 d-block mb-3"></i>
          <h5>Không có độc giả nào</h5>
          <p>
            {{
              filters.search
                ? "Không tìm thấy độc giả phù hợp"
                : "Chưa có độc giả nào trong hệ thống"
            }}
          </p>
          <button @click="showCreateModal = true" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>
            Thêm độc giả đầu tiên
          </button>
        </div>

        <!-- Users Table -->
        <div v-else>
          <table class="table table-hover table-bordered mb-0">
            <thead>
              <tr>
                <th style="width: 60px" class="text-center">STT</th>
                <th style="width: 80px" class="text-center">Avatar</th>
                <th style="width: 230px" class="text-center">
                  Thông tin cá nhân
                </th>
                <th style="width: 100px" class="text-center">Giới tính</th>
                <th style="width: 200px" class="text-center">Liên hệ</th>
                <th style="width: 100px" class="text-center">Mã độc giả</th>
                <th style="width: 130px" class="text-center">Số sách mượn</th>
                <th style="width: 150px" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(user, index) in users" :key="user._id">
                <td class="text-center align-middle">
                  {{ (pagination.current - 1) * pagination.limit + index + 1 }}
                </td>
                <td class="text-center align-middle">
                  <div class="user-avatar-wrapper">
                    <img
                      v-if="user.Avatar"
                      :src="getUserAvatar(user.Avatar)"
                      :alt="getFullName(user)"
                      class="user-avatar-img"
                    />
                    <div v-else class="user-avatar-placeholder">
                      {{ getUserInitials(user) }}
                    </div>
                  </div>
                </td>
                <td class="align-middle">
                  <div>
                    <div class="fw-bold">{{ getFullName(user) }}</div>
                    <div class="text-muted small">{{ user.Email }}</div>
                    <div class="text-muted small">
                      <i class="bi bi-calendar me-1"></i>
                      {{ formatBirthDate(user.NgaySinh) }}
                    </div>
                  </div>
                </td>
                <td class="align-middle">
                  <span
                    class="badge"
                    :class="user.Phai === 'Nam' ? 'bg-info' : 'bg-pink'"
                  >
                    <i
                      :class="
                        user.Phai === 'Nam'
                          ? 'bi bi-gender-male'
                          : 'bi bi-gender-female'
                      "
                    ></i>
                    {{ user.Phai }}
                  </span>
                </td>
                <td class="align-middle">
                  <div class="small">
                    <div class="text-muted">
                      <i class="bi bi-telephone me-1"></i>
                      {{ user.DienThoai }}
                    </div>
                    <div
                      class="text-muted text-truncate"
                      style="max-width: 280px"
                      :title="user.DiaChi"
                    >
                      <i class="bi bi-geo-alt me-1"></i>
                      {{ user.DiaChi }}
                    </div>
                  </div>
                </td>
                <td class="text-center align-middle">
                  <code class="bg-light px-2 py-1 rounded">{{
                    user.MaDocGia
                  }}</code>
                </td>
                <td class="text-center align-middle">
                  <span
                    class="badge"
                    :class="getBorrowCountBadgeClass(user.soSachDangMuon)"
                  >
                    {{ user.soSachDangMuon || 0 }}/5
                  </span>
                </td>
                <td class="text-center align-middle">
                  <div class="btn-group" role="group">
                    <button
                      @click="viewUserDetail(user)"
                      class="btn btn-sm btn-outline-info"
                      title="Xem chi tiết"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      @click="editUser(user)"
                      class="btn btn-sm btn-outline-primary"
                      title="Chỉnh sửa"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      @click="deleteUser(user)"
                      class="btn btn-sm btn-outline-danger"
                      title="Xóa"
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
    <UserModal
      :show="showCreateModal || showEditModal"
      :user="selectedUser"
      :is-edit="showEditModal"
      @close="closeModal"
      @saved="handleUserSaved"
    />

    <UserDetailModal
      :show="showDetailModal"
      :user="selectedUser"
      @close="showDetailModal = false"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import api from "@/services/api";
import UserModal from "@/components/modals/UserModal.vue";
import UserDetailModal from "@/components/modals/UserDetailModal.vue";

export default {
  name: "UserList",
  components: {
    UserModal,
    UserDetailModal,
  },
  setup() {
    const toast = useToast();

    const users = ref([]);
    const stats = ref({});
    const isLoading = ref(false);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const showDetailModal = ref(false);
    const selectedUser = ref(null);

    const filters = reactive({
      search: "",
      gender: "",
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

      return pages.filter(
        (page) =>
          page !== "..." || pages.indexOf(page) === pages.lastIndexOf(page)
      );
    });

    // Methods
    const fetchUsers = async () => {
      try {
        isLoading.value = true;

        const params = {
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
        };

        if (filters.search) params.search = filters.search;
        if (filters.gender) params.phai = filters.gender;

        const response = await api.get("/docgia", { params });

        if (response.success) {
          users.value = response.data;
          Object.assign(pagination, response.pagination);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Có lỗi khi tải danh sách độc giả");
      } finally {
        isLoading.value = false;
      }
    };

    const fetchStats = async () => {
      try {
        const response = await api.get("/docgia/stats");
        if (response.success) {
          stats.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const debouncedSearch = debounce(() => {
      filters.page = 1;
      fetchUsers();
    }, 500);

    const resetFilters = () => {
      filters.search = "";
      filters.gender = "";
      filters.sort = "newest";
      filters.page = 1;
      fetchUsers();
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages && page !== "...") {
        filters.page = page;
        fetchUsers();
      }
    };

    const editUser = (user) => {
      selectedUser.value = { ...user };
      showEditModal.value = true;
    };

    const viewUserDetail = (user) => {
      selectedUser.value = user;
      showDetailModal.value = true;
    };

    const deleteUser = async (user) => {
      const result = await Swal.fire({
        title: "Xác nhận xóa độc giả",
        html: `
          <div class="text-start">
            <p>Bạn có chắc chắn muốn xóa độc giả này?</p>
            <div class="bg-light p-3 rounded">
              <strong>${getFullName(user)}</strong><br>
              <small class="text-muted">${user.Email}</small><br>
              <small class="text-muted">Mã độc giả: ${user.MaDocGia}</small>
            </div>
            <div class="alert alert-warning mt-3 mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Lưu ý:</strong> Việc xóa độc giả sẽ ảnh hưởng đến lịch sử mượn sách.
            </div>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`/docgia/${user._id}`);
          toast.success("Xóa độc giả thành công");
          fetchUsers();
          fetchStats();
        } catch (error) {
          console.error("Error deleting user:", error);
        }
      }
    };

    const exportUsers = async () => {
      try {
        toast.info("Đang xuất dữ liệu...");
        const response = await api.get("/docgia/export", {
          responseType: "blob",
          params: filters,
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `danh-sach-doc-gia-${new Date().toISOString().split("T")[0]}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Xuất dữ liệu thành công");
      } catch (error) {
        console.error("Error exporting users:", error);
        toast.error("Có lỗi khi xuất dữ liệu");
      }
    };

    const closeModal = () => {
      showCreateModal.value = false;
      showEditModal.value = false;
      selectedUser.value = null;
    };

    const handleUserSaved = () => {
      closeModal();
      fetchUsers();
      fetchStats();
    };

    const getFullName = (user) => {
      return `${user.HoLot || ""} ${user.Ten || ""}`.trim();
    };

    const getUserInitials = (user) => {
      const fullName = getFullName(user);
      if (!fullName) return "U";
      const names = fullName.split(" ");
      return names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0];
    };

    const getUserAvatar = (avatarPath) => {
      if (!avatarPath) return "";
      if (avatarPath.startsWith("http")) return avatarPath;
      return `http://localhost:5000${avatarPath}`;
    };

    const getBorrowCountBadgeClass = (count) => {
      if (!count || count === 0) return "bg-secondary";
      if (count <= 2) return "bg-success";
      if (count <= 4) return "bg-warning";
      return "bg-danger";
    };

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const formatBirthDate = (date) => {
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
      fetchUsers();
      fetchStats();
    });

    return {
      users,
      stats,
      isLoading,
      showCreateModal,
      showEditModal,
      showDetailModal,
      selectedUser,
      filters,
      pagination,
      getVisiblePages,
      fetchUsers,
      debouncedSearch,
      resetFilters,
      changePage,
      editUser,
      viewUserDetail,
      deleteUser,
      exportUsers,
      closeModal,
      handleUserSaved,
      getFullName,
      getUserInitials,
      getUserAvatar,
      getBorrowCountBadgeClass,
      formatDate,
      formatBirthDate,
    };
  },
};
</script>

<style scoped>
.user-avatar-wrapper {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.user-avatar-img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
}

.user-avatar-placeholder {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.bg-pink {
  background-color: #e91e63 !important;
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
</style>
