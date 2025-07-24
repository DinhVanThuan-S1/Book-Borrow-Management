<template>
  <div class="book-list-item client-card">
    <div class="row g-0">
      <!-- Book Image -->
      <div class="col-md-3 col-lg-2">
        <div class="book-image-container">
          <img
            :src="getBookImage(book.BiaSach)"
            :alt="book.TenSach"
            class="book-image"
            @error="handleImageError"
          />
          <div class="availability-badge" :class="availabilityClass">
            {{ availabilityText }}
          </div>
        </div>
      </div>

      <!-- Book Info -->
      <div class="col-md-9 col-lg-10">
        <div class="book-content">
          <div class="book-header">
            <h5 class="book-title" @click="viewDetails">
              {{ book.TenSach }}
            </h5>
            <div class="book-actions-mobile d-md-none">
              <button
                @click="toggleFavorite"
                class="btn btn-sm"
                :class="isFavorite ? 'btn-danger' : 'btn-outline-danger'"
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

          <div class="book-meta mb-2">
            <span class="author">
              <i class="bi bi-person me-1"></i>
              {{ book.TacGia }}
            </span>
            <span class="category">
              <i class="bi bi-tag me-1"></i>
              {{ book.MaDM?.TenDM || "Chưa phân loại" }}
            </span>
            <span class="publisher">
              <i class="bi bi-building me-1"></i>
              {{ book.MaNXB?.TenNXB || "Chưa rõ" }}
            </span>
            <span class="year">
              <i class="bi bi-calendar me-1"></i>
              {{ book.NamXuatBan }}
            </span>
          </div>

          <p class="book-description">
            {{ book.MoTa || "Chưa có mô tả cho cuốn sách này." }}
          </p>

          <div class="book-actions">
            <button
              @click="requestBorrow"
              class="btn btn-primary-gradient"
              :disabled="!canBorrow || requesting"
            >
              <span
                v-if="requesting"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-arrow-right me-2"></i>
              {{ borrowButtonText }}
            </button>

            <button @click="viewDetails" class="btn btn-outline-primary">
              <i class="bi bi-info-circle me-2"></i>
              Chi tiết
            </button>

            <button
              @click="toggleFavorite"
              class="btn d-none d-md-inline-flex"
              :class="isFavorite ? 'btn-danger' : 'btn-outline-danger'"
              :disabled="togglingFavorite"
            >
              <span
                v-if="togglingFavorite"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i
                v-else
                :class="isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart'"
                class="me-2"
              ></i>
              {{ isFavorite ? "Bỏ thích" : "Yêu thích" }}
            </button>
          </div>
        </div>
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
  name: "BookListItem",
  props: {
    book: {
      type: Object,
      required: true,
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
.book-list-item {
  transition: all 0.3s ease;
  cursor: pointer;
}

.book-list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.book-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
  border-radius: var(--border-radius);
}

.book-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-list-item:hover .book-image {
  transform: scale(1.05);
}

.availability-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
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

.book-content {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.book-title {
  font-weight: 600;
  color: var(--dark-color);
  margin: 0;
  cursor: pointer;
  transition: color 0.3s ease;
  flex-grow: 1;
  margin-right: 1rem;
}

.book-title:hover {
  color: var(--primary-color);
}

.book-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.book-meta > span {
  display: flex;
  align-items: center;
}

.book-description {
  color: #6b7280;
  line-height: 1.6;
  flex-grow: 1;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.book-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.book-actions .btn {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .book-image-container {
    height: 150px;
  }

  .book-content {
    padding: 1rem;
  }

  .book-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .book-actions {
    flex-direction: column;
  }

  .book-actions .btn {
    width: 100%;
  }
}
</style>
