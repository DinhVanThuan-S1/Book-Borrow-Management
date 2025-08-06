<template>
  <div class="book-catalog">
    <!-- Page Header -->
    <section class="catalog-header py-4">
      <div class="container">
        <div class="row">
          <div class="col-12 text-center">
            <h1 class="page-title fade-in-up">
              <i class="bi bi-book me-3"></i>
              Danh mục sách
            </h1>
            <p class="page-subtitle fade-in-up">
              Khám phá kho sách phong phú với hàng nghìn đầu sách hay
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Search & Filters -->
    <section class="container mt-3">
      <div class="row">
        <!-- Sidebar Filters -->
        <div class="col-lg-3 mb-4">
          <div class="filters-sidebar">
            <h5 class="filter-title">
              <i class="bi bi-funnel me-2"></i>
              Bộ lọc
            </h5>

            <!-- Search -->
            <div class="filter-section">
              <label class="form-label fw-bold">Tìm kiếm</label>
              <div class="input-group">
                <input
                  v-model="filters.search"
                  type="text"
                  class="form-control"
                  placeholder="Tên sách, tác giả..."
                  @keyup.enter="applyFilters"
                />
                <button class="btn btn-outline-primary" @click="applyFilters">
                  <i class="bi bi-search"></i>
                </button>
              </div>
            </div>

            <!-- Categories -->
            <div class="filter-section">
              <label class="form-label fw-bold">Danh mục</label>
              <select
                v-model="filters.category"
                class="form-select"
                @change="applyFilters"
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

            <!-- Publishers -->
            <div class="filter-section">
              <label class="form-label fw-bold">Nhà xuất bản</label>
              <select
                v-model="filters.publisher"
                class="form-select"
                @change="applyFilters"
              >
                <option value="">Tất cả nhà xuất bản</option>
                <option
                  v-for="publisher in publishers"
                  :key="publisher._id"
                  :value="publisher._id"
                >
                  {{ publisher.TenNXB }}
                </option>
              </select>
            </div>

            <!-- Year Selection -->
            <div class="filter-section">
              <label class="form-label fw-bold">Năm xuất bản</label>
              <select
                v-model="filters.publishYear"
                class="form-select"
                @change="applyFilters"
              >
                <option value="">Tất cả năm</option>
                <option
                  v-for="year in yearOptions"
                  :key="year"
                  :value="year"
                >
                  {{ year }}
                </option>
              </select>
            </div>

            <!-- Reset Filters -->
            <button
              @click="resetFilters"
              class="btn btn-outline-secondary w-100"
            >
              <i class="bi bi-arrow-clockwise me-2"></i>
              Xóa bộ lọc
            </button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9">
          <!-- Results Header -->
          <div class="results-header">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div class="results-info">
                <h5 class="mb-1">
                  {{ pagination.total }} quyển sách
                </h5>
                <p class="text-muted mb-0">
                  Trang {{ pagination.current }} / {{ pagination.pages }}
                </p>
              </div>

              <div class="view-controls">
                <select
                  v-model="filters.sort"
                  class="form-select"
                  style="width: auto"
                  @change="applyFilters"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </div>
            </div>

            <!-- Active Filters -->
            <div v-if="hasActiveFilters" class="active-filters">
              <span class="filter-label">Bộ lọc đang áp dụng:</span>

              <span v-if="filters.search" class="filter-tag">
                <i class="bi bi-search me-1"></i>
                "{{ filters.search }}"
                <button
                  @click="
                    filters.search = '';
                    applyFilters();
                  "
                  class="btn-close-filter"
                >
                  <i class="bi bi-x"></i>
                </button>
              </span>

              <span v-if="filters.category" class="filter-tag">
                <i class="bi bi-tag me-1"></i>
                {{ safeCategoryName(filters.category) }}
                <button
                  @click="
                    filters.category = '';
                    applyFilters();
                  "
                  class="btn-close-filter"
                >
                  <i class="bi bi-x"></i>
                </button>
              </span>

              <span v-if="filters.publisher" class="filter-tag">
                <i class="bi bi-building me-1"></i>
                {{ safePublisherName(filters.publisher) }}
                <button
                  @click="
                    filters.publisher = '';
                    applyFilters();
                  "
                  class="btn-close-filter"
                >
                  <i class="bi bi-x"></i>
                </button>
              </span>

              <span
                v-if="filters.publishYear"
                class="filter-tag"
              >
                <i class="bi bi-calendar me-1"></i>
                Năm {{ filters.publishYear }}
                <button
                  @click="
                    filters.publishYear = '';
                    applyFilters();
                  "
                  class="btn-close-filter"
                >
                  <i class="bi bi-x"></i>
                </button>
              </span>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <div class="mt-3">Đang tải danh sách sách...</div>
          </div>

          <!-- Empty State -->
          <div v-else-if="books.length === 0" class="empty-state">
            <div class="empty-state-icon">
              <i class="bi bi-search"></i>
            </div>
            <h4 class="empty-state-title">Không tìm thấy sách nào</h4>
            <p class="empty-state-description">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm được kết quả phù
              hợp.
            </p>
            <button @click="resetFilters" class="btn btn-primary-gradient">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Xóa bộ lọc
            </button>
          </div>

          <!-- Books Grid -->
          <div v-else>
            <div class="row">
              <div
                v-for="book in books"
                :key="book._id"
                class="col-lg-4 col-md-6 mb-4"
              >
                <BookCard :book="book" />
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
                    title="Trang trước"
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
                    :title="`Trang ${page}`"
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
                    title="Trang sau"
                  >
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "@/services/api";
import BookCard from "@/components/common/BookCard.vue";

export default {
  name: "BookCatalog",
  components: {
    BookCard,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const books = ref([]);
    const categories = ref([]);
    const publishers = ref([]);
    const isLoading = ref(false);

    const currentYear = new Date().getFullYear();
    
    // Generate year options (last 30 years)
    const yearOptions = computed(() => {
      const years = [];
      for (let year = currentYear; year >= currentYear - 30; year--) {
        years.push(year);
      }
      return years;
    });

    const filters = reactive({
      search: "",
      category: "",
      publisher: "",
      publishYear: "",
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
    const hasActiveFilters = computed(() => {
      return !!(
        filters.search ||
        filters.category ||
        filters.publisher ||
        filters.publishYear
      );
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

      return pages;
    });

    const safeCategoryName = computed(() => {
      return (categoryId) => {
        if (
          !categoryId ||
          !Array.isArray(categories.value) ||
          categories.value.length === 0
        ) {
          return "Không xác định";
        }
        const category = categories.value.find((c) => c._id === categoryId);
        return category ? category.TenDM : "Không xác định";
      };
    });

    const safePublisherName = computed(() => {
      return (publisherId) => {
        if (
          !publisherId ||
          !Array.isArray(publishers.value) ||
          publishers.value.length === 0
        ) {
          return "Không xác định";
        }
        const publisher = publishers.value.find((p) => p._id === publisherId);
        return publisher ? publisher.TenNXB : "Không xác định";
      };
    });

    // Methods
    const initializeFromQuery = () => {
      if (route.query.q) filters.search = route.query.q;
      if (route.query.category) filters.category = route.query.category;
      if (route.query.publisher) filters.publisher = route.query.publisher;
      if (route.query.year) filters.publishYear = route.query.year;
      if (route.query.sort) filters.sort = route.query.sort;
      if (route.query.page) filters.page = parseInt(route.query.page);
    };

    const updateQuery = () => {
      const query = {};
      if (filters.search) query.q = filters.search;
      if (filters.category) query.category = filters.category;
      if (filters.publisher) query.publisher = filters.publisher;
      if (filters.publishYear) query.year = filters.publishYear;
      if (filters.sort !== "newest") query.sort = filters.sort;
      if (filters.page > 1) query.page = filters.page;

      router.replace({ query });
    };

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
        if (filters.publisher) params.nhaxuatban = filters.publisher;
        if (filters.publishYear) params.namxb = filters.publishYear;

        console.log('Fetching books with params:', params);
        const response = await api.books.getPublic(params);
        console.log('Books response:', response);

        if (response.success && response.data) {
          // Xử lý data - có thể là array sách hoặc object chứa books
          if (Array.isArray(response.data)) {
            books.value = response.data;
          } else if (response.data.books) {
            books.value = response.data.books;
          } else {
            books.value = response.data;
          }

          // Xử lý pagination - từ response root level
          if (response.pagination) {
            console.log('Setting pagination from response:', response.pagination);
            Object.assign(pagination, response.pagination);
          } else {
            // Fallback nếu không có pagination
            pagination.current = 1;
            pagination.pages = 1;
            pagination.total = books.value.length;
            pagination.limit = filters.limit;
          }

          console.log('Final pagination state:', pagination);
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
        // Ưu tiên dùng API getAll để lấy tất cả categories
        const response = await api.categories.getAll();
        
        if (response.data && Array.isArray(response.data)) {
          categories.value = response.data;
        } else if (response && Array.isArray(response)) {
          categories.value = response;
        } else {
          categories.value = [];
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        categories.value = [];
        
        // Fallback với API stats nếu getAll fails
        try {
          const statsResponse = await api.categories.getWithStats();
          
          if (statsResponse.data && statsResponse.data.topCategories && Array.isArray(statsResponse.data.topCategories)) {
            categories.value = statsResponse.data.topCategories;
          }
        } catch (statsError) {
          console.error("Error fetching stats categories:", statsError);
        }
      }
    };

    const fetchPublishers = async () => {
      try {
        const response = await api.publishers.getAll();
        if (response.data && Array.isArray(response.data)) {
          publishers.value = response.data;
        } else if (response && Array.isArray(response)) {
          publishers.value = response;
        } else {
          publishers.value = [];
        }
      } catch (error) {
        console.error("Error fetching publishers:", error);
        publishers.value = [];
      }
    };

    const applyFilters = () => {
      filters.page = 1;
      updateQuery();
      fetchBooks();
    };

    const resetFilters = () => {
      Object.assign(filters, {
        search: "",
        category: "",
        publisher: "",
        publishYear: "",
        sort: "newest",
        page: 1,
      });
      updateQuery();
      fetchBooks();
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages && page !== "...") {
        filters.page = page;
        updateQuery();
        fetchBooks();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const getCategoryName = (categoryId) => {
      if (!Array.isArray(categories.value) || categories.value.length === 0) {
        return "Không xác định";
      }
      const category = categories.value.find((c) => c._id === categoryId);
      return category ? category.TenDM : "Không xác định";
    };

    const getPublisherName = (publisherId) => {
      if (!Array.isArray(publishers.value) || publishers.value.length === 0) {
        return "Không xác định";
      }
      const publisher = publishers.value.find((p) => p._id === publisherId);
      return publisher ? publisher.TenNXB : "Không xác định";
    };

    // Watch for route changes
    watch(
      () => route.query,
      () => {
        initializeFromQuery();
        fetchBooks();
      }
    );

    // Lifecycle
    onMounted(() => {
      initializeFromQuery();
      fetchCategories();
      fetchPublishers();
      fetchBooks();
    });

    return {
      books,
      categories,
      publishers,
      isLoading,
      filters,
      pagination,
      currentYear,
      yearOptions,
      hasActiveFilters,
      getVisiblePages,
      safeCategoryName,
      safePublisherName,
      applyFilters,
      resetFilters,
      changePage,
      getCategoryName,
      getPublisherName,
    };
  },
};
</script>

<style scoped>
.catalog-header {
  background: var(--gradient-primary);
  color: white;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.page-subtitle {
  font-size: 1.2rem;
  opacity: 0.9;
}

.filters-sidebar {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 100px;
}

.filter-title {
  color: var(--dark-color);
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-color);
}

.filter-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.filter-section:last-of-type {
  border-bottom: none;
  padding-bottom: 1.5rem;
}

.results-header {
  background: white;
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.active-filters {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.filter-label {
  font-weight: 500;
  color: var(--dark-color);
  margin-right: 0.5rem;
}

.filter-tag {
  display: inline-flex;
  align-items: center;
  background: var(--light-color);
  border: 1px solid #d1d5db;
  color: var(--dark-color);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  margin: 0.25rem;
  gap: 0.25rem;
}

.btn-close-filter {
  background: none;
  border: none;
  color: #6b7280;
  padding: 0;
  margin-left: 0.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-close-filter:hover {
  color: var(--danger-color);
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
  padding: 1.25rem 1.5rem;
}
</style>
