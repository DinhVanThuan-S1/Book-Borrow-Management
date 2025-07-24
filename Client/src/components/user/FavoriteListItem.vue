<template>
  <div class="favorite-list-item client-card">
    <div class="row g-0">
      <!-- Book Image -->
      <div class="col-md-2">
        <div class="book-image-container">
          <img
            :src="getBookImage(favorite.MaSach?.BiaSach)"
            :alt="favorite.MaSach?.TenSach"
            class="book-image"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Book Info -->
      <div class="col-md-7">
        <div class="book-content">
          <div class="book-header">
            <h6 class="book-title" @click="viewDetails">
              {{ favorite.MaSach?.TenSach }}
            </h6>
            <div class="added-info">
              <i class="bi bi-heart-fill text-danger me-1"></i>
              <small class="text-muted"
                >Đã thêm {{ formatRelativeTime(favorite.createdAt) }}</small
              >
            </div>
          </div>

          <div class="book-meta">
            <span class="author">
              <i class="bi bi-person me-1"></i>
              <strong>Tác giả:</strong> {{ favorite.MaSach?.TacGia }}
            </span>
            <span class="category">
              <i class="bi bi-tag me-1"></i>
              <strong>Danh mục:</strong>
              {{ favorite.MaSach?.MaDM?.TenDM || "Chưa phân loại" }}
            </span>
            <span class="publisher">
              <i class="bi bi-building me-1"></i>
              <strong>NXB:</strong>
              {{ favorite.MaSach?.MaNXB?.TenNXB || "Chưa rõ" }}
            </span>
            <span class="year">
              <i class="bi bi-calendar me-1"></i>
              <strong>Năm XB:</strong> {{ favorite.MaSach?.NamXuatBan }}
            </span>
          </div>

          <div v-if="favorite.MaSach?.MoTa" class="book-description">
            {{ favorite.MaSach.MoTa }}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="col-md-3">
        <div class="favorite-actions">
          <div class="availability-info mb-3">
            <div class="availability-badge" :class="getAvailabilityClass()">
              <i :class="getAvailabilityIcon()" class="me-1"></i>
              {{ getAvailabilityText() }}
            </div>
          </div>

          <div class="action-buttons">
            <button
              @click="requestBorrow"
              class="btn btn-primary-gradient w-100 mb-2"
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
              @click="removeFavorite"
              class="btn btn-outline-danger w-100 mb-2"
              :disabled="removing"
            >
              <span
                v-if="removing"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-heart-fill me-2"></i>
              {{ removing ? "Đang xóa..." : "Xóa yêu thích" }}
            </button>

            <button @click="viewDetails" class="btn btn-outline-primary w-100">
              <i class="bi bi-info-circle me-2"></i>
              Chi tiết
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import api from "@/services/api";

export default {
  name: "FavoriteListItem",
  props: {
    favorite: {
      type: Object,
      required: true,
    },
  },
  emits: ["removed"],
  setup(props, { emit }) {
    const router = useRouter();
    const toast = useToast();

    const removing = ref(false);
    const requesting = ref(false);

    const canBorrow = computed(() => {
      return props.favorite.MaSach?.SoQuyen > 0;
    });

    const borrowButtonText = computed(() => {
      if (!props.favorite.MaSach?.SoQuyen) return "Hết sách";
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

    const getAvailabilityClass = () => {
      const quantity = props.favorite.MaSach?.SoQuyen || 0;
      if (quantity > 5) return "available";
      if (quantity > 0) return "limited";
      return "unavailable";
    };

    const getAvailabilityIcon = () => {
      const quantity = props.favorite.MaSach?.SoQuyen || 0;
      if (quantity > 5) return "bi bi-check-circle";
      if (quantity > 0) return "bi bi-exclamation-triangle";
      return "bi bi-x-circle";
    };

    const getAvailabilityText = () => {
      const quantity = props.favorite.MaSach?.SoQuyen || 0;
      if (quantity > 5) return "Còn nhiều";
      if (quantity > 0) return `Còn ${quantity} quyển`;
      return "Hết sách";
    };

    const removeFavorite = async () => {
      const result = await Swal.fire({
        title: "Xóa khỏi yêu thích",
        text: `Bạn có chắc chắn muốn xóa "${props.favorite.MaSach?.TenSach}" khỏi danh sách yêu thích?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        removing.value = true;

        try {
          await api.favorites.remove(props.favorite.MaSach._id);
          toast.success("Đã xóa khỏi danh sách yêu thích");
          emit("removed", props.favorite._id);
        } catch (error) {
          console.error("Error removing favorite:", error);
        } finally {
          removing.value = false;
        }
      }
    };

    const requestBorrow = async () => {
      if (!canBorrow.value) return;

      requesting.value = true;

      try {
        await api.borrowing.requestBorrow(props.favorite.MaSach._id);
        toast.success("Yêu cầu mượn sách đã được gửi thành công!");
      } catch (error) {
        console.error("Error requesting borrow:", error);
      } finally {
        requesting.value = false;
      }
    };

    const viewDetails = () => {
      router.push({
        name: "BookDetail",
        params: { id: props.favorite.MaSach._id },
      });
    };

    const formatRelativeTime = (date) => {
      if (!date) return "";

      const now = new Date();
      const diffMs = now - new Date(date);
      const diffDays = Math.floor(diffMs / 86400000);
      const diffWeeks = Math.floor(diffDays / 7);
      const diffMonths = Math.floor(diffDays / 30);

      if (diffDays < 1) return "hôm nay";
      if (diffDays === 1) return "hôm qua";
      if (diffDays < 7) return `${diffDays} ngày trước`;
      if (diffWeeks === 1) return "1 tuần trước";
      if (diffWeeks < 4) return `${diffWeeks} tuần trước`;
      if (diffMonths === 1) return "1 tháng trước";
      if (diffMonths < 12) return `${diffMonths} tháng trước`;

      return new Date(date).toLocaleDateString("vi-VN");
    };

    return {
      removing,
      requesting,
      canBorrow,
      borrowButtonText,
      getBookImage,
      handleImageError,
      getAvailabilityClass,
      getAvailabilityIcon,
      getAvailabilityText,
      removeFavorite,
      requestBorrow,
      viewDetails,
      formatRelativeTime,
    };
  },
};
</script>

<style scoped>
.favorite-list-item {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.favorite-list-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.book-image-container {
  height: 150px;
  overflow: hidden;
}

.book-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.book-content {
  padding: 1.5rem;
  height: 100%;
}

.book-header {
  margin-bottom: 1rem;
}

.book-title {
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.book-title:hover {
  color: var(--primary-color);
}

.added-info {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.book-meta strong {
  color: var(--dark-color);
}

.book-description {
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.favorite-actions {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.availability-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
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

.action-buttons {
  margin-top: auto;
}

@media (max-width: 768px) {
  .book-content {
    padding: 1rem;
  }

  .favorite-actions {
    padding: 1rem;
  }

  .book-meta {
    font-size: 0.8rem;
  }

  .added-info {
    justify-content: center;
  }
}
</style>
