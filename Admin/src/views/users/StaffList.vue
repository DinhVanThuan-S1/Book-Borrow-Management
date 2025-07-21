<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2>Quản lý nhân viên</h2>
      <button class="btn btn-primary" @click="openAddModal">
        <i class="fas fa-plus me-2"></i>
        Thêm nhân viên
      </button>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <input
              type="text"
              class="form-control"
              placeholder="Tìm kiếm theo tên, email..."
              v-model="filters.search"
              @input="debouncedSearch"
            />
          </div>
          <div class="col-md-3">
            <select
              class="form-select"
              v-model="filters.chucVu"
              @change="loadStaffs"
            >
              <option value="">Tất cả chức vụ</option>
              <option value="Admin">Admin</option>
              <option value="NhanVien">Nhân viên</option>
            </select>
          </div>
          <div class="col-md-2">
            <select
              class="form-select"
              v-model="filters.limit"
              @change="loadStaffs"
            >
              <option value="10">10/trang</option>
              <option value="25">25/trang</option>
              <option value="50">50/trang</option>
            </select>
          </div>
          <div class="col-md-3">
            <button class="btn btn-outline-secondary" @click="resetFilters">
              <i class="fas fa-redo me-1"></i>
              Làm mới
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Staff Table -->
    <div class="card">
      <div class="card-body">
        <div v-if="loading" class="text-center py-4">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
        </div>
        <div
          v-else-if="staffs.length === 0"
          class="text-center py-4 text-muted"
        >
          <i class="fas fa-users fa-3x mb-3"></i>
          <p>Không có nhân viên nào</p>
        </div>
        <div v-else>
          <div class="table-responsive">
            <table class="table table-striped table-hover">
              <thead class="table-dark">
                <tr>
                  <th>STT</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Chức vụ</th>
                  <th>Điện thoại</th>
                  <th>Địa chỉ</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(staff, index) in staffs" :key="staff._id">
                  <td>
                    {{ (pagination.page - 1) * pagination.limit + index + 1 }}
                  </td>
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar-circle me-2">
                        {{ getInitials(staff.HoTenNV) }}
                      </div>
                      <div>
                        <strong>{{ staff.HoTenNV }}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{{ staff.Email }}</td>
                  <td>
                    <span :class="getRoleClass(staff.ChucVu)">
                      {{ getRoleText(staff.ChucVu) }}
                    </span>
                  </td>
                  <td>{{ staff.SoDienThoai || "-" }}</td>
                  <td>{{ staff.DiaChi || "-" }}</td>
                  <td>{{ formatDate(staff.createdAt) }}</td>
                  <td>
                    <div class="btn-group" role="group">
                      <button
                        class="btn btn-sm btn-outline-info"
                        @click="viewDetail(staff)"
                        title="Xem chi tiết"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-warning"
                        @click="editStaff(staff)"
                        title="Chỉnh sửa"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        class="btn btn-sm btn-outline-danger"
                        @click="deleteStaff(staff)"
                        title="Xóa"
                        v-if="
                          staff.ChucVu !== 'Admin' ||
                          staffs.filter((s) => s.ChucVu === 'Admin').length > 1
                        "
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <nav v-if="pagination.totalPages > 1" class="mt-4">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: pagination.page === 1 }">
          <button class="page-link" @click="changePage(pagination.page - 1)">
            Trước
          </button>
        </li>
        <li
          v-for="page in getVisiblePages()"
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
          :class="{ disabled: pagination.page === pagination.totalPages }"
        >
          <button class="page-link" @click="changePage(pagination.page + 1)">
            Sau
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import api from "@/services/api";

export default {
  name: "StaffList",
  data() {
    return {
      staffs: [],
      loading: false,
      filters: {
        search: "",
        chucVu: "",
        limit: 10,
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      searchTimeout: null,
    };
  },
  mounted() {
    this.loadStaffs();
  },
  computed: {
    debouncedSearch() {
      return () => {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.pagination.page = 1;
          this.loadStaffs();
        }, 500);
      };
    },
  },
  methods: {
    async loadStaffs() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          limit: this.filters.limit,
          search: this.filters.search,
          chucVu: this.filters.chucVu,
        };

        const response = await api.get("/nhanvien", { params });
        this.staffs = response.data.data.nhanviens;
        this.pagination = response.data.data.pagination;
      } catch (error) {
        console.error("Lỗi tải danh sách nhân viên:", error);
        this.$toast.error("Không thể tải danh sách nhân viên");
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.pagination.totalPages) {
        this.pagination.page = page;
        this.loadStaffs();
      }
    },
    getVisiblePages() {
      const { page, totalPages } = this.pagination;
      const visiblePages = [];

      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, page + 2);

      for (let i = start; i <= end; i++) {
        visiblePages.push(i);
      }

      return visiblePages;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN");
    },
    getInitials(name) {
      return (
        name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "N/A"
      );
    },
    getRoleClass(role) {
      return role === "Admin" ? "badge bg-danger" : "badge bg-primary";
    },
    getRoleText(role) {
      return role === "Admin" ? "Quản trị" : "Nhân viên";
    },
    openAddModal() {
      // TODO: Implement add staff modal
      this.$toast.info("Chức năng đang phát triển");
    },
    viewDetail(staff) {
      // TODO: Implement view detail modal
      this.$toast.info("Chức năng đang phát triển");
    },
    editStaff(staff) {
      // TODO: Implement edit staff modal
      this.$toast.info("Chức năng đang phát triển");
    },
    async deleteStaff(staff) {
      const result = await Swal.fire({
        title: "Xác nhận xóa",
        text: `Bạn có chắc muốn xóa nhân viên "${staff.HoTenNV}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`/nhanvien/${staff._id}`);
          this.$toast.success("Xóa nhân viên thành công");
          this.loadStaffs();
        } catch (error) {
          console.error("Lỗi xóa nhân viên:", error);
          this.$toast.error(
            error.response?.data?.message || "Không thể xóa nhân viên"
          );
        }
      }
    },
    resetFilters() {
      this.filters = {
        search: "",
        chucVu: "",
        limit: 10,
      };
      this.pagination.page = 1;
      this.loadStaffs();
    },
  },
};
</script>

<style scoped>
.avatar-circle {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #6f42c1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
}
</style>
