<template>
  <div v-if="show" class="search-modal-backdrop" @click="handleBackdropClick">
    <div class="search-modal" @click.stop>
      <div class="search-modal-header">
        <h5 class="modal-title">
          <i class="bi bi-search me-2"></i>
          Tìm kiếm sách
        </h5>
        <button @click="$emit('close')" class="btn-close">
          <i class="bi bi-x"></i>
        </button>
      </div>

      <div class="search-modal-body">
        <form @submit.prevent="handleSearch">
          <div class="mb-3">
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Nhập tên sách, tác giả..."
              autofocus
            />
          </div>

          <div class="mb-3">
            <select v-model="selectedCategory" class="form-select">
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

          <button type="submit" class="btn btn-primary-gradient w-100">
            <i class="bi bi-search me-2"></i>
            Tìm kiếm
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "@/services/api";

export default {
  name: "SearchModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const router = useRouter();

    const searchQuery = ref("");
    const selectedCategory = ref("");
    const categories = ref([]);
    const searchInput = ref(null);

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
      router.push({
        name: "BookCatalog",
        query: {
          q: searchQuery.value.trim(),
          category: selectedCategory.value,
        },
      });
      emit("close");
    };

    const handleBackdropClick = () => {
      emit("close");
    };

    watch(
      () => props.show,
      (newVal) => {
        if (newVal) {
          setTimeout(() => {
            searchInput.value?.focus();
          }, 100);
        }
      }
    );

    onMounted(() => {
      fetchCategories();
    });

    return {
      searchQuery,
      selectedCategory,
      categories,
      searchInput,
      handleSearch,
      handleBackdropClick,
    };
  },
};
</script>

<style scoped>
.search-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1050;
  padding-top: 10vh;
}

.search-modal {
  background: white;
  border-radius: var(--border-radius);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-modal-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
}

.modal-title {
  margin: 0;
  font-weight: 600;
  color: var(--dark-color);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-close:hover {
  color: var(--danger-color);
}

.search-modal-body {
  padding: 1.5rem;
}
</style>
