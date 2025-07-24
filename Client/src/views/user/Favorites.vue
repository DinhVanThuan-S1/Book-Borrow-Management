<template>
  <div class="favorites">
    <div class="container py-4">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <h1 class="page-title">
          <i class="bi bi-heart-fill text-danger me-3"></i>
          Sách yêu thích
        </h1>
        <p class="page-subtitle">Những cuốn sách bạn đã đánh dấu yêu thích</p>
      </div>

      <!-- Stats and Actions -->
      <div class="row mb-4">
        <div class="col-md-6">
          <div class="favorites-stats">
            <div class="stat-item">
              <i class="bi bi-heart-fill text-danger me-2"></i>
              <span class="fw-bold">{{ pagination.total || 0 }}</span> sách yêu
              thích
            </div>
          </div>
        </div>

        <div class="col-md-6 text-md-end">
          <div class="favorites-actions">
            <div class="btn-group me-2" role="group">
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
              class="form-select d-inline-block"
              style="width: auto"
              @change="fetchFavorites"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="book-title">Tên sách A-Z</option>
              <option value="author">Tác giả A-Z</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Favorites Content -->
      <div class="favorites-content">
        <!-- Loading -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <div class="mt-3">Đang tải danh sách yêu thích...</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="favorites.length === 0" class="empty-state">
          <div class="empty-state-icon">
            <i class="bi bi-heart"></i>
          </div>
          <h4 class="empty-state-title">Chưa có sách yêu thích</h4>
          <p class="empty-state-description">
            Bạn chưa đánh dấu yêu thích cuốn sách nào. Hãy khám phá và thêm
            những cuốn sách hay vào danh sách yêu thích!
          </p>
          <router-link to="/sach" class="btn btn-primary-gradient">
            <i class="bi bi-search me-2"></i>
            Khám phá sách
          </router-link>
        </div>

        <!-- Grid View -->
        <div v-else-if="viewMode === 'grid'" class="row">
          <div
            v-for="favorite in favorites"
            :key="favorite._id"
            class="col-lg-3 col-md-4 col-sm-6 mb-4"
          >
            <FavoriteBookCard
              :favorite="favorite"
              @removed="handleBookRemoved"
            />
          </div>
        </div>

        <!-- List View -->
        <div v-else class="favorites-list">
          <div v-for="favorite in favorites" :key="favorite._id" class="mb-3">
            <FavoriteListItem
              :favorite="favorite"
              @removed="handleBookRemoved"
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
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api";
import FavoriteBookCard from "@/components/user/FavoriteBookCard.vue";
import FavoriteListItem from "@/components/user/FavoriteListItem.vue";

export default {
  name: "Favorites",
  components: {
    FavoriteBookCard,
    FavoriteListItem,
  },
  setup() {
    const toast = useToast();

    const favorites = ref([]);
    const isLoading = ref(false);
    const viewMode = ref("grid");

    const filters = reactive({
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

    // Methods
    const fetchFavorites = async () => {
      try {
        isLoading.value = true;

        const params = {
          page: filters.page,
          limit: filters.limit,
          sort: filters.sort,
        };

        const response = await api.favorites.getMyFavorites(params);

        if (response.success) {
          favorites.value = response.data;
          Object.assign(pagination, response.pagination);
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
        toast.error("Có lỗi khi tải danh sách yêu thích");
      } finally {
        isLoading.value = false;
      }
    };

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.pages && page !== "...") {
        filters.page = page;
        fetchFavorites();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    const handleBookRemoved = (favoriteId) => {
      // Remove from local array
      const index = favorites.value.findIndex((f) => f._id === favoriteId);
      if (index !== -1) {
        favorites.value.splice(index, 1);
        pagination.total -= 1;
      }

      // If current page becomes empty and it's not the first page, go to previous page
      if (favorites.value.length === 0 && filters.page > 1) {
        filters.page -= 1;
        fetchFavorites();
      }
    };

    // Lifecycle
    onMounted(() => {
      fetchFavorites();
    });

    return {
      favorites,
      isLoading,
      viewMode,
      filters,
      pagination,
      getVisiblePages,
      fetchFavorites,
      changePage,
      handleBookRemoved,
    };
  },
};
</script>

<style scoped>
.favorites-stats {
  background: white;
  border-radius: var(--border-radius);
  padding: 1rem 1.5rem;
  box-shadow: var(--box-shadow);
  border-left: 4px solid var(--danger-color);
}

.stat-item {
  font-size: 1.1rem;
  color: var(--dark-color);
}

.favorites-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.favorites-list {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1rem;
}

@media (max-width: 768px) {
  .favorites-actions {
    justify-content: center;
    margin-top: 1rem;
  }

  .favorites-stats {
    text-align: center;
  }
}
</style>
