<template>
  <div class="favorite-book-card">
    <div class="book-card">
      <div class="book-image">
        <img
          :src="getBookImage(favorite.MaSach?.BiaSach)"
          :alt="favorite.MaSach?.TenSach"
          @error="handleImageError"
        />

        <!-- Remove Button -->
        <div class="remove-overlay">
          <button
            @click="removeFavorite"
            class="btn btn-danger btn-sm remove-btn"
            :disabled="removing"
            title="Xóa khỏi yêu thích"
          >
            <span
              v-if="removing"
              class="spinner-border spinner-border-sm"
            ></span>
            <i v-else class="bi bi-heart-fill"></i>
          </button>
        </div>

        <!-- Added Date -->
        <div class="added-date">
          <i class="bi bi-heart-fill me-1"></i>
          {{ formatDate(favorite.createdAt) }}
        </div>
      </div>

      <div class="book-info">
        <h6
          class="book-title"
          :title="favorite.MaSach?.TenSach"
          @click="viewDetails"
        >
          {{ favorite.MaSach?.TenSach }}
        </h6>

        <p class="book-author">
          <i class="bi bi-person me-1"></i>
          {{ favorite.MaSach?.TacGia }}
        </p>

        <div class="book-meta">
          <span class="book-category">
            <i class="bi bi-tag me-1"></i>
            {{ favorite.MaSach?.MaDM?.TenDM || "Chưa phân loại" }}
          </span>
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
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import api from "@/services/api";

export default {
  name: "FavoriteBookCard",
  props: {
    favorite: {
      type: Object,
      required: true,
    },
  },
  emits: ["removed"],
  setup(props, { emit }) {
    const router = useRouter();
    const authStore = useAuthStore();
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

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return {
      removing,
      requesting,
      canBorrow,
      borrowButtonText,
      getBookImage,
      handleImageError,
      removeFavorite,
      requestBorrow,
      viewDetails,
      formatDate,
    };
  },
};
</script>

<style scoped>
.favorite-book-card {
  height: 100%;
}

.book-card {
  background: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.book-image {
  position: relative;
  height: 200px;
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

.remove-overlay {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.book-card:hover .remove-overlay {
  opacity: 1;
}

.remove-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(220, 53, 69, 0.9);
  border: none;
  color: white;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #dc3545;
  transform: scale(1.1);
  color: white;
}

.added-date {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.book-info {
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.book-title {
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
  color: var(--dark-color);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.3;
  cursor: pointer;
  transition: color 0.3s ease;
}

.book-title:hover {
  color: var(--primary-color);
}

.book-author {
  color: #6b7280;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.book-meta {
  margin-bottom: 1rem;
  flex-grow: 1;
}

.book-category {
  background: var(--gradient-secondary);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 15px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

@media (max-width: 576px) {
  .book-image {
    height: 160px;
  }

  .book-info {
    padding: 0.75rem;
  }

  .book-title {
    font-size: 0.9rem;
  }
}
</style>
