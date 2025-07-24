<template>
  <div class="book-catalog">
    <!-- Page Header -->
    <section class="catalog-header py-5">
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
    <section class="container">
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
              <div class="category-filters">
                <div class="form-check">
                  <input
                    id="all-categories"
                    v-model="filters.category"
                    type="radio"
                    value=""
                    class="form-check-input"
                    @change="applyFilters"
                  />
                  <label for="all-categories" class="form-check-label">
                    Tất cả danh mục
                  </label>
                </div>
                <div
                  v-for="category in categories"
                  :key="category._id"
                  class="form-check"
                >
                  <input
                    :id="`category-${category._id}`"
                    v-model="filters.category"
                    type="radio"
                    :value="category._id"
                    class="form-check-input"
                    @change="applyFilters"
                  />
                  <label
                    :for="`category-${category._id}`"
                    class="form-check-label"
                  >
                    {{ category.TenDM }}
                    <span class="text-muted small"
                      >({{ category.soLuongSach || 0 }})</span
                    >
                  </label>
                </div>
              </div>
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

            <!-- Year Range -->
            <div class="filter-section">
              <label class="form-label fw-bold">Năm xuất bản</label>
              <div class="row g-2">
                <div class="col-6">
                  <input
                    v-model.number="filters.yearFrom"
                    type="number"
                    class="form-control"
                    placeholder="Từ năm"
                    min="1900"
                    :max="currentYear"
                    @change="applyFilters"
                  />
                </div>
                <div class="col-6">
                  <input
                    v-model.number="filters.yearTo"
                    type="number"
                    class="form-control"
                    placeholder="Đến năm"
                    min="1900"
                    :max="currentYear"
                    @change="applyFilters"
                  />
                </div>
              </div>
            </div>

            <!-- Availability -->
            <div class="filter-section">
              <label class="form-label fw-bold">Tình trạng</label>
              <div class="form-check">
                <input
                  id="available-only"
                  v-model="filters.availableOnly"
                  type="checkbox"
                  class="form-check-input"
                  @change="applyFilters"
                />
                <label for="available-only" class="form-check-label">
                  Chỉ sách còn trong kho
                </label>
              </div>
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
                  {{ pagination.total }} cuốn sách
                  <span v-if="hasActiveFilters" class="text-muted">
                    (đã lọc)
                  </span>
                </h5>
                <p class="text-muted mb-0">
                  Trang {{ pagination.current }} / {{ pagination.pages }}
                </p>
              </div>

              <div class="view-controls">
                <div class="btn-group me-3" role="group">
                  <input
                    type="radio"
                    class="btn-check"
                    id="grid-view"
                    v-model="viewMode"
                    value="grid"
                  />
                  <label class="btn btn-outline-primary" for="grid-view">
                    <i class="bi bi-grid-3x3-gap"></i>
                  </label>
                  <input
                    type="radio"
                    class="btn-check"
                    id="list-view"
                    v-model="viewMode"
                    value="list"
                  />
                  <label class="btn btn-outline-primary" for="list-view">
                    <i class="bi bi-list"></i>
                  </label>
                </div>

                <select
                  v-model="filters.sort"
                  class="form-select"
                  style="width: auto"
                  @change="applyFilters"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="a-to-z">Tên A-Z</option>
                  <option value="z-to-a">Tên Z-A</option>
                  <option value="year-desc">Năm XB mới nhất</option>
                  <option value="year-asc">Năm XB cũ nhất</option>
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
                v-if="filters.yearFrom || filters.yearTo"
                class="filter-tag"
              >
                <i class="bi bi-calendar me-1"></i>
                {{ filters.yearFrom || "..." }} - {{ filters.yearTo || "..." }}
                <button
                  @click="
                    filters.yearFrom = null;
                    filters.yearTo = null;
                    applyFilters();
                  "
                  class="btn-close-filter"
                >
                  <i class="bi bi-x"></i>
                </button>
              </span>

              <span v-if="filters.availableOnly" class="filter-tag">
                <i class="bi bi-check-circle me-1"></i>
                Còn trong kho
                <button
                  @click="
                    filters.availableOnly = false;
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

          <!-- Books Grid/List -->
          <div v-else>
            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="row">
              <div
                v-for="book in books"
                :key="book._id"
                class="col-lg-4 col-md-6 mb-4"
              >
                <BookCard :book="book" />
              </div>
            </div>

            <!-- List View -->
            <div v-else class="books-list">
              <BookListItem
                v-for="book in books"
                :key="book._id"
                :book="book"
                class="mb-3"
              />
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
    </section>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "@/services/api";
import BookCard from "@/components/common/BookCard.vue";
import BookListItem from "@/components/common/BookListItem.vue";

export default {
  name: "BookCatalog",
  components: {
    BookCard,
    BookListItem,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const books = ref([]);
    const categories = ref([]);
    const publishers = ref([]);
    const isLoading = ref(false);
    const viewMode = ref("grid");

    const currentYear = new Date().getFullYear();

    const filters = reactive({
      search: "",
      category: "",
      publisher: "",
      yearFrom: null,
      yearTo: null,
      availableOnly: false,
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
        filters.yearFrom ||
        filters.yearTo ||
        filters.availableOnly
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
      if (route.query.sort) filters.sort = route.query.sort;
      if (route.query.page) filters.page = parseInt(route.query.page);
      if (route.query.available)
        filters.availableOnly = route.query.available === "true";
    };

    const updateQuery = () => {
      const query = {};
      if (filters.search) query.q = filters.search;
      if (filters.category) query.category = filters.category;
      if (filters.publisher) query.publisher = filters.publisher;
      if (filters.sort !== "newest") query.sort = filters.sort;
      if (filters.page > 1) query.page = filters.page;
      if (filters.availableOnly) query.available = "true";

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
        if (filters.yearFrom) params.namxb_from = filters.yearFrom;
        if (filters.yearTo) params.namxb_to = filters.yearTo;
        if (filters.availableOnly) params.available = true;

        const response = await api.books.getPublic(params);

        if (response.data) {
          books.value = response.data.books || response.data;
          if (response.data.pagination) {
            Object.assign(pagination, response.data.pagination);
          }
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
        const response = await api.categories.getWithStats();
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
        // Fallback với danh sách danh mục cơ bản
        try {
          const basicResponse = await api.categories.getAll();
          if (basicResponse.data && Array.isArray(basicResponse.data)) {
            categories.value = basicResponse.data;
          } else if (basicResponse && Array.isArray(basicResponse)) {
            categories.value = basicResponse;
          }
        } catch (basicError) {
          console.error("Error fetching basic categories:", basicError);
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
        yearFrom: null,
        yearTo: null,
        availableOnly: false,
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
      viewMode,
      filters,
      pagination,
      currentYear,
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
  padding-bottom: 0;
}

.category-filters {
  max-height: 300px;
  overflow-y: auto;
}

.form-check {
  margin-bottom: 0.5rem;
}

.form-check-label {
  cursor: pointer;
  width: 100%;
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

.books-list {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1rem;
}

@media (max-width: 991px) {
  .filters-sidebar {
    position: static;
    margin-bottom: 2rem;
  }

  .view-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .results-info {
    margin-bottom: 1rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .catalog-header {
    padding: 3rem 0;
  }

  .results-header {
    padding: 1rem;
  }

  .active-filters {
    text-align: center;
  }

  .filter-tag {
    margin: 0.25rem 0.125rem;
  }
}
</style>
