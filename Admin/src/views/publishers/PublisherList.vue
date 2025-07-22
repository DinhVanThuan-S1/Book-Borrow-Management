<template>
  <div class="publisher-list fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Quản lý nhà xuất bản</h1>
          <!-- <p class="page-subtitle">Quản lý thông tin các nhà xuất bản</p> -->
        </div>
        <button
          @click="showCreateModal = true"
          class="btn btn-primary btn-custom"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Thêm nhà xuất bản
        </button>
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
                placeholder="Tên nhà xuất bản, địa chỉ..."
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
                @change="fetchPublishers"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="a-z">Tên A-Z</option>
                <option value="z-a">Tên Z-A</option>
              </select>
            </div>
          </div>

          <div class="col-md-3 d-flex align-items-end">
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

    <!-- Publishers Table -->
    <div class="admin-card">
      <div class="card-header-custom">
        <h5 class="mb-0">
          <i class="bi bi-building me-2"></i>
          Danh sách nhà xuất bản ( {{ pagination.total }} )
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
        <div
          v-else-if="publishers.length === 0"
          class="text-center p-5 text-muted"
        >
          <i class="bi bi-building display-4 d-block mb-3"></i>
          <h5>Không có nhà xuất bản nào</h5>
          <p>
            {{
              filters.search
                ? "Không tìm thấy nhà xuất bản phù hợp"
                : "Chưa có nhà xuất bản nào trong hệ thống"
            }}
          </p>
          <button @click="showCreateModal = true" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>
            Thêm nhà xuất bản đầu tiên
          </button>
        </div>

        <!-- Publishers Table -->

        <div v-else class="table">
          <table class="table table-bordered table-hover mb-0">
            <thead>
              <tr>
                <th style="width: 60px" class="text-center fw-bold">STT</th>
                <th class="text-center fw-bold">Tên nhà xuất bản</th>
                <th class="text-center fw-bold">Địa chỉ</th>
                <th style="width: 140px" class="text-center fw-bold">
                  Số lượng sách
                </th>
                <th style="width: 100px" class="text-center fw-bold">Mã NXB</th>
                <th style="width: 120px" class="text-center fw-bold">
                  Ngày tạo
                </th>
                <th style="width: 120px" class="text-center fw-bold">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(publisher, index) in publishers" :key="publisher._id">
                <td class="text-center align-middle centered-content">
                  {{ (pagination.current - 1) * pagination.limit + index + 1 }}
                </td>
                <td class="align-middle">
                  <div class="d-flex align-items-center">
                    <div class="publisher-icon me-3">
                      <i class="bi bi-building-fill"></i>
                    </div>
                    <div>
                      <div class="fw-bold">{{ publisher.TenNXB }}</div>
                    </div>
                  </div>
                </td>
                <td class="align-middle">
                  <div class="d-flex align-items-center">
                    <i class="bi bi-geo-alt text-muted me-2"></i>
                    <span class="text-muted">{{ publisher.DiaChi }}</span>
                  </div>
                </td>
                <td class="text-center align-middle centered-content">
                  <span
                    class="badge"
                    :class="getBookCountBadgeClass(publisher.soLuongSach)"
                  >
                    {{ publisher.soLuongSach || 0 }} sách
                  </span>
                </td>
                <td class="text-center align-middle centered-content">
                  <code class="bg-light px-2 py-1 rounded">{{
                    publisher.MaNXB
                  }}</code>
                </td>
                <td class="text-center align-middle centered-content">
                  <small class="text-muted">{{
                    formatDate(publisher.createdAt)
                  }}</small>
                </td>
                <td class="text-center align-middle centered-content">
                  <div class="btn-group" role="group">
                    <button
                      @click="viewBooks(publisher)"
                      class="btn btn-sm btn-outline-info"
                      title="Xem sách"
                    >
                      <i class="bi bi-book"></i>
                    </button>
                    <button
                      @click="editPublisher(publisher)"
                      class="btn btn-sm btn-outline-primary"
                      title="Chỉnh sửa"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      @click="deletePublisher(publisher)"
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
    <PublisherModal
      :show="showCreateModal || showEditModal"
      :publisher="selectedPublisher"
      :is-edit="showEditModal"
      @close="closeModal"
      @saved="handlePublisherSaved"
    />

    <PublisherBooksModal
      :show="showBooksModal"
      :publisher="selectedPublisher"
      @close="showBooksModal = false"
    />
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import api from "@/services/api";
import PublisherModal from "@/components/modals/PublisherModal.vue";
import PublisherBooksModal from "@/components/modals/PublisherBooksModal.vue";

export default {
  name: "PublisherList",
  components: {
    PublisherModal,
    PublisherBooksModal,
  },
  setup() {
    const toast = useToast();

    const publishers = ref([]);
    const isLoading = ref(false);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const showBooksModal = ref(false);
    const selectedPublisher = ref(null);

    const filters = reactive({
      search: "",
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
    const fetchPublishers = async () => {
      try {
        isLoading.value = true;

        const params = {
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
        };

        if (filters.search) params.search = filters.search;

        const response = await api.get("/nhaxuatban", { params });

        if (response.success) {
          publishers.value = response.data;
          Object.assign(pagination, response.pagination);
        }
      } catch (error) {
        console.error("Error fetching publishers:", error);
        toast.error("Có lỗi khi tải danh sách nhà xuất bản");
      } finally {
        isLoading.value = false;
      }
    };

    const debouncedSearch = debounce(() => {
      filters.page = 1;
      fetchPublishers();
    }, 500);

    const resetFilters = () => {
      filters.search = "";
      filters.sort = "newest";
      filters.page = 1;
      fetchPublishers();
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages && page !== "...") {
        filters.page = page;
        fetchPublishers();
      }
    };

    const editPublisher = (publisher) => {
      selectedPublisher.value = { ...publisher };
      showEditModal.value = true;
    };

    const viewBooks = (publisher) => {
      selectedPublisher.value = publisher;
      showBooksModal.value = true;
    };

    const deletePublisher = async (publisher) => {
      const result = await Swal.fire({
        title: "Xác nhận xóa nhà xuất bản",
        html: `
          <div class="text-start">
            <p>Bạn có chắc chắn muốn xóa nhà xuất bản này?</p>
            <div class="bg-light p-3 rounded">
              <strong>${publisher.TenNXB}</strong><br>
              <small class="text-muted">${publisher.DiaChi}</small><br>
              <small class="text-muted">Mã NXB: ${publisher.MaNXB}</small>
            </div>
            <div class="alert alert-warning mt-3 mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Lưu ý:</strong> Việc xóa nhà xuất bản có thể ảnh hưởng đến các sách thuộc nhà xuất bản này.
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
          await api.delete(`/nhaxuatban/${publisher._id}`);
          toast.success("Xóa nhà xuất bản thành công");
          fetchPublishers();
        } catch (error) {
          console.error("Error deleting publisher:", error);
        }
      }
    };

    const closeModal = () => {
      showCreateModal.value = false;
      showEditModal.value = false;
      selectedPublisher.value = null;
    };

    const handlePublisherSaved = () => {
      closeModal();
      fetchPublishers();
    };

    const getBookCountBadgeClass = (count) => {
      if (!count || count === 0) return "bg-secondary";
      if (count < 5) return "bg-warning";
      if (count < 20) return "bg-info";
      return "bg-success";
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
      fetchPublishers();
    });

    return {
      publishers,
      isLoading,
      showCreateModal,
      showEditModal,
      showBooksModal,
      selectedPublisher,
      filters,
      pagination,
      getVisiblePages,
      fetchPublishers,
      debouncedSearch,
      resetFilters,
      changePage,
      editPublisher,
      viewBooks,
      deletePublisher,
      closeModal,
      handlePublisherSaved,
      getBookCountBadgeClass,
      formatDate,
    };
  },
};
</script>

<style scoped>
.publisher-icon {
  width: 40px;
  height: 40px;
  border-radius: 0.375rem;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

/* Table styling với căn giữa theo chiều dọc */
.table {
  margin-bottom: 0;
}

.table th,
.table td {
  vertical-align: middle !important;
  padding: 6px 4px 6px 12px; /* Thêm padding-left 12px */
  border-color: #dee2e6;
}

.table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  font-weight: 700 !important;
  color: #495057;
  text-align: center;
  vertical-align: middle;
  padding: 10px 6px 10px 12px; /* Thêm padding-left 12px */
}

.table tbody tr:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

/* Bootstrap align-middle override */
.align-middle {
  vertical-align: middle !important;
}

/* Centered content for specific columns */
.centered-content {
  padding-left: 4px !important; /* Reset left padding for centered columns */
  padding-right: 4px !important;
}

/* Giảm chiều cao các hàng */
.table td {
  height: 45px; /* Giảm từ 60px xuống 45px */
}

.table .d-flex {
  height: 100%;
  align-items: center;
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

/* Badge styling */
.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}

/* Code styling */
code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
}

/* Button group styling */
.btn-group {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-group .btn {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Pagination styling đẹp tương tự Book Management */
.card-footer {
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
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

/* Responsive pagination */
@media (max-width: 576px) {
  .pagination .page-link {
    padding: 0.375rem 0.5rem;
    font-size: 0.875rem;
    min-width: 35px;
  }

  .card-footer {
    padding: 0.75rem 1rem;
  }
}
</style>
