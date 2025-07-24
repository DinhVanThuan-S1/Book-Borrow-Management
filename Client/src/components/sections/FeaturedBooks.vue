<template>
  <div class="featured-books">
    <!-- Loading State -->
    <div v-if="loading" class="row">
      <div v-for="i in 6" :key="i" class="col-lg-4 col-md-6 mb-4">
        <div class="book-skeleton">
          <div class="skeleton-image"></div>
          <div class="skeleton-content">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-author"></div>
            <div class="skeleton-line skeleton-category"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Books Grid -->
    <div v-else-if="books.length > 0" class="row">
      <div v-for="book in books" :key="book._id" class="col-lg-4 col-md-6 mb-4">
        <BookCard :book="book" featured />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-state-icon">
        <i class="bi bi-book"></i>
      </div>
      <h4 class="empty-state-title">Chưa có sách nổi bật</h4>
      <p class="empty-state-description">
        Hiện tại chưa có sách nào được đánh dấu là nổi bật.
      </p>
    </div>
  </div>
</template>

<script>
import BookCard from "@/components/common/BookCard.vue";

export default {
  name: "FeaturedBooks",
  components: {
    BookCard,
  },
  props: {
    books: {
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
.book-skeleton {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-image {
  height: 250px;
  background: #e5e7eb;
}

.skeleton-content {
  padding: 1.5rem;
}

.skeleton-line {
  height: 16px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.skeleton-title {
  width: 80%;
}

.skeleton-author {
  width: 60%;
}

.skeleton-category {
  width: 40%;
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
