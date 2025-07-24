<template>
  <div class="search-form-container">
    <form @submit.prevent="handleSearch" class="search-form">
      <div class="row g-3">
        <div class="col-lg-6">
          <div class="search-input-group">
            <i class="bi bi-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control search-input"
              placeholder="Nhập tên sách, tác giả, từ khóa..."
            />
          </div>
        </div>

        <div class="col-lg-3">
          <select v-model="selectedCategory" class="form-select search-select">
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

        <div class="col-lg-3">
          <button type="submit" class="btn search-btn w-100">
            <i class="bi bi-search me-2"></i>
            Tìm kiếm
          </button>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="quick-filters mt-3">
        <span class="filter-label">Tìm nhanh:</span>
        <button
          v-for="filter in quickFilters"
          :key="filter.value"
          type="button"
          class="btn btn-outline-primary btn-sm me-2 mb-2"
          @click="quickSearch(filter.value)"
        >
          <i :class="filter.icon" class="me-1"></i>
          {{ filter.label }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import api from "@/services/api";

export default {
  name: "SearchForm",
  emits: ["search"],
  setup(props, { emit }) {
    const searchQuery = ref("");
    const selectedCategory = ref("");
    const categories = ref([]);

    const quickFilters = [
      { label: "Văn học", value: "văn học", icon: "bi bi-book" },
      { label: "Khoa học", value: "khoa học", icon: "bi bi-flask" },
      { label: "Công nghệ", value: "công nghệ", icon: "bi bi-cpu" },
      { label: "Kinh tế", value: "kinh tế", icon: "bi bi-graph-up" },
      { label: "Tâm lý", value: "tâm lý", icon: "bi bi-heart" },
    ];

    const fetchCategories = async () => {
      try {
        const response = await api.categories.getAll();
        if (response.success) {
          categories.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const handleSearch = () => {
      emit("search", {
        query: searchQuery.value.trim(),
        category: selectedCategory.value,
      });
    };

    const quickSearch = (query) => {
      searchQuery.value = query;
      handleSearch();
    };

    onMounted(() => {
      fetchCategories();
    });

    return {
      searchQuery,
      selectedCategory,
      categories,
      quickFilters,
      handleSearch,
      quickSearch,
    };
  },
};
</script>

<style scoped>
.search-form-container {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: var(--box-shadow);
}

.search-input-group {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  z-index: 5;
}

.search-input {
  padding-left: 3rem;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  height: 50px;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
}

.search-select {
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  height: 50px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
}

.search-btn {
  background: var(--gradient-primary);
  border: none;
  color: white;
  font-weight: 600;
  height: 50px;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -8px var(--primary-color);
  color: white;
}

.quick-filters {
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.filter-label {
  font-weight: 500;
  color: var(--dark-color);
  margin-right: 1rem;
}

.quick-filters .btn {
  border-radius: 20px;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
}

@media (max-width: 768px) {
  .search-form-container {
    padding: 1.5rem;
  }

  .quick-filters {
    text-align: center;
  }

  .filter-label {
    display: block;
    margin-bottom: 0.5rem;
  }
}
</style>
