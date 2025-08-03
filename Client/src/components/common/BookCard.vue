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
          <!-- Removed buttons - now in book-actions -->
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
          {{ getCategoryName(book) || "Chưa phân loại" }}
        </span>
        <div class="book-details">
          <span class="book-price">
            {{ formatPrice(book.DonGia) }}
          </span>
        </div>
      </div>

      <div class="book-actions">
        <button
          @click="requestBorrow"
          class="btn btn-primary-gradient btn-sm"
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
          class="btn btn-outline-primary btn-sm"
          title="Xem chi tiết"
        >
          <i class="bi bi-info-circle"></i>
        </button>

        <button
          @click="showFavoriteMessage"
          class="btn btn-outline-danger btn-sm"
          title="Yêu thích"
        >
          <i class="bi bi-heart"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
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

    const requesting = ref(false);

    const canBorrow = computed(() => {
      // Cho phép click nút để chuyển đến trang đăng nhập nếu chưa đăng nhập
      // Hoặc cho phép mượn nếu đã đăng nhập và còn sách
      return !authStore.isAuthenticated || props.book.SoQuyen > 0;
    });

    const availabilityClass = computed(() => {
      if (props.book.SoQuyen > 5) return "available";
      if (props.book.SoQuyen > 0) return "limited";
      return "unavailable";
    });

    const availabilityText = computed(() => {
      if (props.book.SoQuyen > 0) return `${props.book.SoQuyen} quyển`;
      return "Hết sách";
    });

    const borrowButtonText = computed(() => {
      if (!authStore.isAuthenticated) return "Mượn sách";
      if (props.book.SoQuyen === 0) return "Hết sách";
      if (requesting.value) return "Đang xử lý...";
      return "Mượn sách";
    });

    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const formatPrice = (price) => {
      if (!price) return "Liên hệ";
      return new Intl.NumberFormat("vi-VN").format(price) + " VND";
    };

    const getCategoryName = (book) => {
      // Xử lý trường hợp populate thông thường (MaDM là object)
      if (book.MaDM && typeof book.MaDM === 'object' && book.MaDM.TenDM) {
        return book.MaDM.TenDM;
      }
      
      // Xử lý trường hợp aggregation (danhmuc là array)
      if (book.danhmuc && Array.isArray(book.danhmuc) && book.danhmuc.length > 0) {
        return book.danhmuc[0].TenDM;
      }

      return null;
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

    const showFavoriteMessage = () => {
      // Nút tượng trưng, không cần thông báo
    };

    return {
      requesting,
      canBorrow,
      availabilityClass,
      availabilityText,
      borrowButtonText,
      getBookImage,
      formatPrice,
      getCategoryName,
      handleImageError,
      viewDetails,
      requestBorrow,
      showFavoriteMessage,
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
  background: rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-card:hover .book-overlay {
  opacity: 1;
}

.overlay-actions {
  display: none;
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

.book-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
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

.book-price {
  color: #dc3545;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.book-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: auto;
  align-items: center;
  width: 100%;
}

.book-actions .btn:first-child {
  flex: 1;
  min-width: 160px;
  max-width: 280px;
  color: white;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-actions .btn:first-child:disabled {
  color: white;
  opacity: 0.6;
}

.book-actions .btn:not(:first-child) {
  flex-shrink: 0;
  width: 45px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-sm {
  height: 40px;
  font-size: 0.875rem;
}
</style>
