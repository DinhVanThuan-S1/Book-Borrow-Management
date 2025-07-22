<template>
  <div class="book-list fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Quản lý sách</h1>
          <!-- <p class="page-subtitle">Quản lý sách trong thư viện</p> -->
        </div>
        <router-link to="/books/create" class="btn btn-primary btn-custom">
          <i class="bi bi-plus-circle me-2"></i>
          Thêm sách mới
        </router-link>
      </div>
    </div>

    <!-- Filters -->
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
                placeholder="Tìm kiếm tên sách, tác giả..."
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
                v-model="filters.category"
                class="form-select"
                @change="fetchBooks"
              >
                <option value="">Tất cả danh mục</option>
                <option
                  v-for="category in categories"
                  :key="category._id"
                  :value="category._id"
                >
                  {{ category.TenDM }}
                </option>
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
                @change="fetchBooks"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="a-z">Tên A-Z</option>
                <option value="z-a">Tên Z-A</option>
                <option value="price-low">Giá tăng dần</option>
                <option value="price-high">Giá giảm dần</option>
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

    <!-- Books Table -->
    <div class="admin-card">
      <div
        class="card-header-custom d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-book me-2"></i>
          Danh sách sách ( {{ pagination.total }} quyển )
        </h5>
        <div class="d-flex gap-2">
          <div class="btn-group" role="group">
            <input
              type="radio"
              class="btn-check"
              id="view-table"
              v-model="viewMode"
              value="table"
            />
            <label class="btn btn-outline-secondary btn-sm" for="view-table">
              <i class="bi bi-table"></i>
            </label>
            <input
              type="radio"
              class="btn-check"
              id="view-grid"
              v-model="viewMode"
              value="grid"
            />
            <label class="btn btn-outline-secondary btn-sm" for="view-grid">
              <i class="bi bi-grid-3x3-gap"></i>
            </label>
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
        <div v-else-if="books.length === 0" class="text-center p-5 text-muted">
          <i class="bi bi-inbox display-4 d-block mb-3"></i>
          <h5>Không có sách nào</h5>
          <p>
            {{
              filters.search
                ? "Không tìm thấy sách phù hợp"
                : "Chưa có sách nào trong hệ thống"
            }}
          </p>
          <router-link to="/books/create" class="btn btn-primary">
            <i class="bi bi-plus-circle me-2"></i>
            Thêm sách đầu tiên
          </router-link>
        </div>

        <!-- Table View -->
        <div v-else-if="viewMode === 'table'">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th
                  style="
                    width: 60px;
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                  "
                >
                  STT
                </th>
                <th
                  style="
                    width: 90px;
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                  "
                >
                  Ảnh
                </th>
                <th style="border-right: 1px solid #dee2e6; text-align: center">
                  Thông tin sách
                </th>
                <th
                  style="
                    width: 150px;
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                  "
                >
                  Danh mục
                </th>
                <th
                  style="
                    width: 120px;
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                  "
                >
                  Giá ( VND )
                </th>
                <th
                  style="
                    width: 100px;
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                  "
                >
                  Số lượng
                </th>
                <th
                  style="
                    width: 100px;
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                  "
                >
                  Năm XB
                </th>
                <th style="width: 120px; text-align: center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(book, index) in books" :key="book._id">
                <td
                  style="
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                    vertical-align: middle;
                  "
                >
                  {{ (pagination.current - 1) * pagination.limit + index + 1 }}
                </td>
                <td
                  style="
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                    vertical-align: middle;
                  "
                >
                  <div class="book-thumbnail">
                    <img
                      :src="getBookImage(book.BiaSach)"
                      :alt="book.TenSach"
                      class="img-fluid rounded"
                      style="width: 70px; height: 85px; object-fit: cover"
                    />
                  </div>
                </td>
                <td
                  style="
                    padding-left: 1rem;
                    border-right: 1px solid #dee2e6;
                    vertical-align: middle;
                  "
                >
                  <div>
                    <div class="fw-bold">{{ book.TenSach }}</div>
                    <div class="text-muted small">
                      <i class="bi bi-person me-1"></i>
                      {{ book.TacGia }}
                    </div>
                    <div class="text-muted small">
                      <i class="bi bi-building me-1"></i>
                      {{ book.MaNXB?.TenNXB }}
                    </div>
                    <div class="text-info small">
                      {{ book.MaSach }}
                    </div>
                  </div>
                </td>
                <td
                  style="
                    border-right: 1px solid #dee2e6;
                    vertical-align: middle;
                  "
                >
                  <span class="badge bg-primary text-white">
                    {{ book.MaDM?.TenDM }}
                  </span>
                </td>
                <td
                  style="
                    border-right: 1px solid #dee2e6;
                    vertical-align: middle;
                  "
                >
                  <span class="fw-bold text-danger">
                    {{ formatCurrency(book.DonGia) }}
                  </span>
                </td>
                <td
                  style="
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                    vertical-align: middle;
                  "
                >
                  <span
                    class="badge"
                    :class="
                      book.SoQuyen > 5
                        ? 'bg-success'
                        : book.SoQuyen > 0
                        ? 'bg-warning'
                        : 'bg-danger'
                    "
                  >
                    {{ book.SoQuyen }}
                  </span>
                </td>
                <td
                  style="
                    border-right: 1px solid #dee2e6;
                    text-align: center;
                    vertical-align: middle;
                  "
                >
                  {{ book.NamXuatBan }}
                </td>
                <td style="text-align: center; vertical-align: middle">
                  <div class="btn-group" role="group">
                    <router-link
                      :to="`/books/${book._id}`"
                      class="btn btn-sm btn-outline-info"
                      title="Xem chi tiết"
                    >
                      <i class="bi bi-eye"></i>
                    </router-link>
                    <router-link
                      :to="`/books/${book._id}/edit`"
                      class="btn btn-sm btn-outline-primary"
                      title="Chỉnh sửa"
                    >
                      <i class="bi bi-pencil"></i>
                    </router-link>
                    <button
                      @click="deleteBook(book)"
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

        <!-- Grid View -->
        <div v-else class="p-3">
          <div class="row g-3">
            <div
              v-for="book in books"
              :key="book._id"
              class="col-xl-3 col-lg-4 col-md-6"
            >
              <div class="book-card">
                <div class="book-image">
                  <img
                    :src="getBookImage(book.BiaSach)"
                    :alt="book.TenSach"
                    class="img-fluid"
                  />
                  <div class="book-actions">
                    <router-link
                      :to="`/books/${book._id}`"
                      class="btn btn-sm btn-info"
                      title="Xem chi tiết"
                    >
                      <i class="bi bi-eye"></i>
                    </router-link>
                    <router-link
                      :to="`/books/${book._id}/edit`"
                      class="btn btn-sm btn-primary"
                    >
                      <i class="bi bi-pencil"></i>
                    </router-link>
                    <button
                      @click="deleteBook(book)"
                      class="btn btn-sm btn-danger"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="book-info">
                  <h6 class="book-title">{{ book.TenSach }}</h6>
                  <p class="book-author">{{ book.TacGia }}</p>
                  <div class="book-meta">
                    <span class="badge bg-primary text-white">{{
                      book.MaDM?.TenDM
                    }}</span>
                    <span class="price text-danger">{{
                      formatCurrency(book.DonGia)
                    }}</span>
                  </div>
                  <div class="book-stock">
                    <span
                      class="badge"
                      :class="
                        book.SoQuyen > 5
                          ? 'bg-success'
                          : book.SoQuyen > 0
                          ? 'bg-warning'
                          : 'bg-danger'
                      "
                    >
                      Còn {{ book.SoQuyen }} quyển
                    </span>
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
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import api from "@/services/api";

export default {
  name: "BookList",
  setup() {
    const toast = useToast();

    const books = ref([]);
    const categories = ref([]);
    const isLoading = ref(false);
    const viewMode = ref("table");

    const filters = reactive({
      search: "",
      category: "",
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
    const fetchBooks = async () => {
      try {
        isLoading.value = true;

        const params = {
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
        };

        if (filters.search) params.search = filters.search;
        if (filters.category) params.danhmuc = filters.category;

        const response = await api.get("/sach", { params });

        if (response.success) {
          books.value = response.data;
          Object.assign(pagination, response.pagination);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        toast.error("Có lỗi khi tải danh sách sách");
      } finally {
        isLoading.value = false;
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get("/danhmuc/all");
        if (response.success) {
          categories.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const debouncedSearch = debounce(() => {
      filters.page = 1;
      fetchBooks();
    }, 500);

    const resetFilters = () => {
      filters.search = "";
      filters.category = "";
      filters.sort = "newest";
      filters.page = 1;
      fetchBooks();
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages) {
        filters.page = page;
        fetchBooks();
      }
    };

    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN").format(amount);
    };

    const deleteBook = async (book) => {
      const result = await Swal.fire({
        title: "Xác nhận xóa sách",
        html: `
          <div class="text-start">
            <p>Bạn có chắc chắn muốn xóa sách này?</p>
            <div class="bg-light p-3 rounded">
              <strong>${book.TenSach}</strong><br>
              <small class="text-muted">Tác giả: ${book.TacGia}</small><br>
              <small class="text-muted">Mã sách: ${book.MaSach}</small>
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
          await api.delete(`/sach/${book._id}`);
          toast.success("Xóa sách thành công");
          fetchBooks();
        } catch (error) {
          console.error("Error deleting book:", error);
        }
      }
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
      fetchBooks();
      fetchCategories();
    });

    return {
      books,
      categories,
      isLoading,
      viewMode,
      filters,
      pagination,
      getVisiblePages,
      fetchBooks,
      debouncedSearch,
      resetFilters,
      changePage,
      getBookImage,
      formatCurrency,
      deleteBook,
    };
  },
};
</script>

<style scoped>
.book-card {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 100%;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.book-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-card:hover .book-actions {
  opacity: 1;
}

.book-info {
  padding: 1rem;
}

.book-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-author {
  color: #6c757d;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.book-meta .price {
  font-weight: 600;
  color: #dc3545;
}

.book-stock {
  text-align: center;
}

.book-thumbnail {
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
