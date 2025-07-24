<template>
  <div class="categories-grid">
    <!-- Loading State -->
    <div v-if="loading" class="row">
      <div v-for="i in 8" :key="i" class="col-lg-3 col-md-4 col-sm-6 mb-4">
        <div class="category-skeleton">
          <div class="skeleton-icon"></div>
          <div class="skeleton-title"></div>
          <div class="skeleton-count"></div>
        </div>
      </div>
    </div>

    <!-- Categories Grid -->
    <div v-else-if="categories.length > 0" class="row">
      <div
        v-for="category in categories"
        :key="category._id"
        class="col-lg-3 col-md-4 col-sm-6 mb-4"
      >
        <CategoryCard :category="category" />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <i class="bi bi-grid-3x3-gap"></i>
      </div>
      <h4 class="empty-state-title">Chưa có danh mục</h4>
      <p class="empty-state-description">
        Hiện tại chưa có danh mục sách nào được tạo.
      </p>
    </div>
  </div>
</template>

<script>
import CategoryCard from "@/components/common/CategoryCard.vue";

export default {
  name: "CategoriesGrid",
  components: {
    CategoryCard,
  },
  props: {
    categories: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.category-skeleton {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  text-align: center;
  box-shadow: var(--box-shadow);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #e5e7eb;
  margin: 0 auto 1rem;
}

.skeleton-title {
  height: 20px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.skeleton-count {
  height: 16px;
  background: #e5e7eb;
  border-radius: 4px;
  width: 60%;
  margin: 0 auto;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>
