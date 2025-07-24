<template>
  <div class="book-card" :class="{ featured: featured }">
    <div class="book-image">
      <img
        :src="getBookImage(book.BiaSach)"
        :alt="book.TenSach"
        @error="handleImageError"
      />

      <!-- Overlay Actions -->
      <div class="book-overlay">
        <div class="overlay-actions">
          <button
            @click="viewDetails"
            class="btn btn-light btn-sm me-2"
            title="Xem chi tiết"
          >
            <i class="bi bi-eye"></i>
          </button>
          <button
            @click="toggleFavorite"
            class="btn btn-sm"
            :class="isFavorite ? 'btn-danger' : 'btn-outline-light'"
            title="Yêu thích"
            :disabled="togglingFavorite"
          >
            <span
              v-if="togglingFavorite"
              class="spinner-border spinner-border-sm"
            ></span>
            <i
              v-else
              :class="isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart'"
            ></i>
          </button>
        </div>
      </div>

      <!-- Featured Badge -->
      <div v-if="featured" class="featured-badge">
        <i class="bi bi-star-fill"></i>
        Nổi bật
      </div>

      <!-- Status Badge -->
      <div class="availability-badge" :class="availabilityClass">
        {{ availabilityText }}
      </div>
    </div>

    <div class="book-info">
      <h6 class="book-title" :title="book.TenSach">
        {{ book.TenSach }}
      </h6>

      <p class="book-author">
        <i class="bi bi-person me-1"></i>
        {{ book.TacGia }}
      </p>

      <div class="book-meta">
        <span class="book-category">
          <i class="bi bi-tag me-1"></i>
          {{ book.MaDM?.TenDM || "Chưa phân loại" }}
        </span>
        <span class="book-year">{{ book.NamXuatBan }}</span>
      </div>

      <div class="book-actions">
        <button
          @click="requestBorrow"
          class="btn btn-primary-gradient btn-sm flex-grow-1"
          :disabled="!canBorrow || requesting"
        >
          <span
            v-if="requesting"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          <i v-else class="bi bi-arrow-right me-2"></i>
          {{ borrowButtonText }}
        </button>

        <button
          @click="viewDetails"
          class="btn btn-outline-primary btn-sm ms-2"
        >
          <i class="bi bi-info-circle"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "BookCard",
  props: {
    book: {
      type: Object,
      required: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const router = useRouter();
    const authStore = useAuthStore();
    const toast = useToast();

    const isFavorite = ref(false);
    const togglingFavorite = ref(false);
    const requesting = ref(false);

    const canBorrow = computed(() => {
      return props.book.SoQuyen > 0 && authStore.isAuthenticated;
    });

    const availabilityClass = computed(() => {
      if (props.book.SoQuyen > 5) return "available";
      if (props.book.SoQuyen > 0) return "limited";
      return "unavailable";
    });

    const availabilityText = computed(() => {
      if (props.book.SoQuyen > 5) return "Còn nhiều";
      if (props.book.SoQuyen > 0) return `Còn ${props.book.SoQuyen}`;
      return "Hết sách";
    });

    const borrowButtonText = computed(() => {
      if (!authStore.isAuthenticated) return "Đăng nhập để mượn";
      if (props.book.SoQuyen === 0) return "Hết sách";
      if (requesting.value) return "Đang xử lý...";
      return "Mượn sách";
    });

    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const handleImageError = (event) => {
      event.target.src = "/src/assets/images/book-placeholder.jpg";
    };

    const viewDetails = () => {
      router.push({ name: "BookDetail", params: { id: props.book._id } });
    };

    const requestBorrow = async () => {
      if (!authStore.isAuthenticated) {
        router.push({
          name: "Login",
          query: { redirect: router.currentRoute.value.fullPath },
        });
        return;
      }

      if (!canBorrow.value) return;

      requesting.value = true;

      try {
        await api.borrowing.requestBorrow(props.book._id);
        toast.success("Yêu cầu mượn sách đã được gửi thành công!");
      } catch (error) {
        console.error("Error requesting borrow:", error);
      } finally {
        requesting.value = false;
      }
    };

    const toggleFavorite = async () => {
      if (!authStore.isAuthenticated) {
        router.push({
          name: "Login",
          query: { redirect: router.currentRoute.value.fullPath },
        });
        return;
      }

      togglingFavorite.value = true;

      try {
        if (isFavorite.value) {
          await api.favorites.remove(props.book._id);
          isFavorite.value = false;
          toast.info("Đã xóa khỏi danh sách yêu thích");
        } else {
          await api.favorites.add(props.book._id);
          isFavorite.value = true;
          toast.success("Đã thêm vào danh sách yêu thích");
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
      } finally {
        togglingFavorite.value = false;
      }
    };

    const checkFavoriteStatus = async () => {
      if (!authStore.isAuthenticated) return;

      try {
        const response = await api.favorites.check(props.book._id);
        isFavorite.value = response.data.isFavorite;
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    onMounted(() => {
      checkFavoriteStatus();
    });

    return {
      isFavorite,
      togglingFavorite,
      requesting,
      canBorrow,
      availabilityClass,
      availabilityText,
      borrowButtonText,
      getBookImage,
      handleImageError,
      viewDetails,
      requestBorrow,
      toggleFavorite,
    };
  },
};
</script>

<style scoped>
.book-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px -12px rgba(0, 0, 0, 0.25);
}

.book-card.featured {
  border: 2px solid var(--primary-color);
}

.book-image {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.book-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-card:hover .book-image img {
  transform: scale(1.05);
}

.book-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-card:hover .book-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 0.5rem;
}

.featured-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: var(--gradient-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.availability-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.availability-badge.available {
  background: var(--success-color);
}

.availability-badge.limited {
  background: var(--warning-color);
}

.availability-badge.unavailable {
  background: var(--danger-color);
}

.book-info {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.75rem;
  color: var(--dark-color);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.book-author {
  color: #6b7280;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.book-category {
  background: var(--gradient-secondary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.book-year {
  color: #9ca3af;
  font-size: 0.85rem;
  font-weight: 500;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .book-image {
    height: 200px;
  }

  .book-info {
    padding: 1rem;
  }

  .book-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
