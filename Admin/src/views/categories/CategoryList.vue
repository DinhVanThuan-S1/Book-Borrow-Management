<template>
  <div class="category-list fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Quản lý danh mục</h1>
          <!-- <p class="page-subtitle">Danh mục sách trong thư viện</p> -->
        </div>
        <button
          @click="
            showCreateModal = true;
            resetCategoryForm();
          "
          class="btn btn-primary btn-custom"
        >
          <i class="bi bi-plus-circle me-2"></i>
          Thêm danh mục
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
                placeholder="Tìm kiếm danh mục..."
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
                @change="fetchCategories"
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

    <!-- Categories Grid -->
    <div class="row">
      <div class="col-lg-8">
        <div class="admin-card">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-grid-3x3-gap me-2"></i>
              Danh sách danh mục ( {{ pagination.total }} )
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
              v-else-if="categories.length === 0"
              class="text-center p-5 text-muted"
            >
              <i class="bi bi-grid-3x3-gap display-4 d-block mb-3"></i>
              <h5>Không có danh mục nào</h5>
              <p>
                {{
                  filters.search
                    ? "Không tìm thấy danh mục phù hợp"
                    : "Chưa có danh mục nào trong hệ thống"
                }}
              </p>
              <button
                @click="
                  showCreateModal = true;
                  resetCategoryForm();
                "
                class="btn btn-primary"
              >
                <i class="bi bi-plus-circle me-2"></i>
                Thêm danh mục đầu tiên
              </button>
            </div>

            <!-- Categories List -->
            <div v-else class="p-3">
              <div class="row g-3">
                <div
                  v-for="category in categories"
                  :key="category._id"
                  class="col-md-6 col-lg-4"
                >
                  <div class="category-card">
                    <div class="category-header">
                      <div class="category-icon">
                        <i class="bi bi-bookmark-fill"></i>
                      </div>
                      <div class="category-actions">
                        <button
                          @click="editCategory(category)"
                          class="btn btn-sm btn-outline-primary"
                          title="Chỉnh sửa"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button
                          @click="deleteCategory(category)"
                          class="btn btn-sm btn-outline-danger"
                          title="Xóa"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div class="category-body">
                      <h6 class="category-name">{{ category.TenDM }}</h6>
                      <p class="category-description">{{ category.MoTa }}</p>

                      <div class="category-stats">
                        <div class="stat-item">
                          <i class="bi bi-book text-primary me-1"></i>
                          <span>{{ category.soLuongSach || 0 }} sách</span>
                        </div>
                        <div class="stat-item">
                          <i class="bi bi-person text-success me-1"></i>
                          <span>{{ category.NguoiTao?.HoTenNV || "N/A" }}</span>
                        </div>
                      </div>

                      <div class="category-footer">
                        <small class="text-muted">
                          <i class="bi bi-calendar me-1"></i>
                          {{ formatDate(category.createdAt) }}
                        </small>
                        <small class="category-id">{{ category.MaDM }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
      </div>

      <!-- Stats Panel -->
      <div class="col-lg-4">
        <div class="admin-card mb-4">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>
              Thống kê danh mục
            </h5>
          </div>
          <div class="card-body">
            <div class="stats-item mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <span>Tổng danh mục</span>
                <span class="badge bg-primary">{{ stats.total || 0 }}</span>
              </div>
            </div>
            <div class="stats-item mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <span>Có sách</span>
                <span class="badge bg-success">{{ stats.withBooks || 0 }}</span>
              </div>
            </div>
            <div class="stats-item mb-3">
              <div class="d-flex justify-content-between align-items-center">
                <span>Chưa có sách</span>
                <span class="badge bg-warning">{{
                  stats.withoutBooks || 0
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Categories -->
        <div class="admin-card">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-star me-2"></i>
              Danh mục phổ biến
            </h5>
          </div>
          <div class="card-body">
            <div
              v-if="topCategories.length === 0"
              class="text-center text-muted"
            >
              <i class="bi bi-inbox display-6 d-block mb-2"></i>
              <small>Chưa có dữ liệu</small>
            </div>
            <div v-else>
              <div
                v-for="(category, index) in topCategories"
                :key="category._id"
                class="d-flex align-items-center mb-3"
              >
                <div class="ranking-number me-3">
                  {{ index + 1 }}
                </div>
                <div class="flex-grow-1">
                  <div class="fw-medium">{{ category.TenDM }}</div>
                  <small class="text-muted"
                    >{{ category.soLuongSach || 0 }} sách</small
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
      @click.self="closeModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ showEditModal ? "Chỉnh sửa danh mục" : "Thêm danh mục mới" }}
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>

          <form @submit.prevent="handleSubmitCategory">
            <div class="modal-body">
              <div class="mb-3">
                <label for="tenDM" class="form-label">Tên danh mục *</label>
                <input
                  type="text"
                  class="form-control"
                  id="tenDM"
                  v-model="categoryForm.TenDM"
                  required
                  :class="{ 'is-invalid': categoryErrors.TenDM }"
                  placeholder="Nhập tên danh mục..."
                />
                <div v-if="categoryErrors.TenDM" class="invalid-feedback">
                  {{ categoryErrors.TenDM }}
                </div>
              </div>

              <div class="mb-3">
                <label for="moTa" class="form-label">Mô tả</label>
                <textarea
                  class="form-control"
                  id="moTa"
                  rows="3"
                  v-model="categoryForm.MoTa"
                  :class="{ 'is-invalid': categoryErrors.MoTa }"
                  placeholder="Nhập mô tả cho danh mục..."
                ></textarea>
                <div v-if="categoryErrors.MoTa" class="invalid-feedback">
                  {{ categoryErrors.MoTa }}
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModal"
                :disabled="categoryLoading"
              >
                Hủy
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                :disabled="categoryLoading || !categoryForm.TenDM?.trim()"
              >
                <span
                  v-if="categoryLoading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                {{ showEditModal ? "Cập nhật" : "Thêm mới" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import api from "@/services/api";

export default {
  name: "CategoryList",
  setup() {
    const toast = useToast();

    const categories = ref([]);
    const stats = ref({});
    const topCategories = ref([]);
    const isLoading = ref(false);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const selectedCategory = ref(null);

    // Category form data
    const categoryLoading = ref(false);
    const categoryForm = reactive({ TenDM: "", MoTa: "" });
    const categoryErrors = reactive({});

    const filters = reactive({
      search: "",
      sort: "newest",
      page: 1,
      limit: 12,
    });

    const pagination = reactive({
      current: 1,
      pages: 1,
      total: 0,
      limit: 12,
    });

    // Computed
    const getVisiblePages = computed(() => {
      const pages = [];
      const total = pagination.pages;
      const current = pagination.current;

      if (total <= 5) {
        for (let i = 1; i <= total; i++) {
          pages.push(i);
        }
      } else {
        if (current <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push("...");
          pages.push(total);
        } else if (current >= total - 2) {
          pages.push(1);
          pages.push("...");
          for (let i = total - 3; i <= total; i++) pages.push(i);
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
    const fetchCategories = async () => {
      try {
        isLoading.value = true;

        const params = {
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
        };

        if (filters.search) params.search = filters.search;

        const response = await api.get("/danhmuc", { params });

        if (response.success) {
          categories.value = response.data;
          Object.assign(pagination, response.pagination);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Có lỗi khi tải danh sách danh mục");
      } finally {
        isLoading.value = false;
      }
    };

    const fetchStats = async () => {
      try {
        const response = await api.get("/danhmuc/stats");
        if (response.success) {
          stats.value = response.data.overview || {};
          topCategories.value = (response.data.topCategories || []).slice(0, 5);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    const debouncedSearch = debounce(() => {
      filters.page = 1;
      fetchCategories();
    }, 500);

    const resetFilters = () => {
      filters.search = "";
      filters.sort = "newest";
      filters.page = 1;
      fetchCategories();
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages && page !== "...") {
        filters.page = page;
        fetchCategories();
      }
    };

    const editCategory = (category) => {
      selectedCategory.value = { ...category };
      categoryForm.TenDM = category.TenDM || "";
      categoryForm.MoTa = category.MoTa || "";
      showEditModal.value = true;
      clearCategoryErrors();
    };

    const deleteCategory = async (category) => {
      const result = await Swal.fire({
        title: "Xác nhận xóa danh mục",
        html: `
          <div class="text-start">
            <p>Bạn có chắc chắn muốn xóa danh mục này?</p>
            <div class="bg-light p-3 rounded">
              <strong>${category.TenDM}</strong><br>
              <small class="text-muted">${category.MoTa}</small><br>
              <small class="text-muted">Mã danh mục: ${category.MaDM}</small>
            </div>
            <div class="alert alert-warning mt-3 mb-0">
              <i class="bi bi-exclamation-triangle me-2"></i>
              <strong>Lưu ý:</strong> Việc xóa danh mục có thể ảnh hưởng đến các sách thuộc danh mục này.
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
          await api.delete(`/danhmuc/${category._id}`);
          toast.success("Xóa danh mục thành công");
          fetchCategories();
          fetchStats();
        } catch (error) {
          console.error("Error deleting category:", error);
        }
      }
    };

    const closeModal = () => {
      showCreateModal.value = false;
      showEditModal.value = false;
      selectedCategory.value = null;
      resetCategoryForm();
    };

    const resetCategoryForm = () => {
      categoryForm.TenDM = "";
      categoryForm.MoTa = "";
      clearCategoryErrors();
    };

    const clearCategoryErrors = () => {
      Object.keys(categoryErrors).forEach((key) => {
        delete categoryErrors[key];
      });
    };

    const validateCategoryForm = () => {
      clearCategoryErrors();
      let isValid = true;

      if (!categoryForm.TenDM?.trim()) {
        categoryErrors.TenDM = "Tên danh mục là bắt buộc";
        isValid = false;
      } else if (categoryForm.TenDM.trim().length < 2) {
        categoryErrors.TenDM = "Tên danh mục phải có ít nhất 2 ký tự";
        isValid = false;
      }

      if (categoryForm.MoTa && categoryForm.MoTa.length > 500) {
        categoryErrors.MoTa = "Mô tả không được vượt quá 500 ký tự";
        isValid = false;
      }

      return isValid;
    };

    const handleSubmitCategory = async () => {
      if (!validateCategoryForm()) return;

      categoryLoading.value = true;

      try {
        const submitData = {
          TenDM: categoryForm.TenDM.trim(),
          MoTa: categoryForm.MoTa?.trim() || "",
        };

        let response;

        if (showEditModal.value && selectedCategory.value?._id) {
          response = await api.put(
            `/danhmuc/${selectedCategory.value._id}`,
            submitData
          );
        } else {
          response = await api.post("/danhmuc", submitData);
        }

        if (response.success) {
          toast.success(
            showEditModal.value
              ? "Cập nhật danh mục thành công!"
              : "Thêm danh mục mới thành công!"
          );
          closeModal();
          fetchCategories();
          fetchStats();
        }
      } catch (error) {
        console.error("Error saving category:", error);

        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(
            showEditModal.value
              ? "Có lỗi khi cập nhật danh mục!"
              : "Có lỗi khi thêm danh mục mới!"
          );
        }
      } finally {
        categoryLoading.value = false;
      }
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
      fetchCategories();
      fetchStats();
    });

    return {
      categories,
      stats,
      topCategories,
      isLoading,
      showCreateModal,
      showEditModal,
      selectedCategory,
      categoryLoading,
      categoryForm,
      categoryErrors,
      filters,
      pagination,
      getVisiblePages,
      fetchCategories,
      debouncedSearch,
      resetFilters,
      changePage,
      editCategory,
      deleteCategory,
      closeModal,
      handleSubmitCategory,
      formatDate,
    };
  },
};
</script>

<style scoped>
.category-card {
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
  height: 100%;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-header {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-icon {
  font-size: 1.5rem;
  opacity: 0.8;
}

.category-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover .category-actions {
  opacity: 1;
}

.category-actions .btn {
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.category-actions .btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: white;
}

.category-body {
  padding: 1rem;
}

.category-name {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.category-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.4em;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
}

.category-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  border-top: 1px solid #f8f9fa;
}

.category-id {
  color: #007bff;
  font-weight: 500;
  font-size: 0.8rem;
}

.stats-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.stats-item:last-child {
  border-bottom: none;
}

.ranking-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
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
