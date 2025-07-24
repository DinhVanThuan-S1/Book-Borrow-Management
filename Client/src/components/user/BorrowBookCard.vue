<template>
  <div class="borrow-book-card client-card" :class="{ overdue: isOverdue }">
    <div class="row g-0">
      <!-- Book Image -->
      <div class="col-md-2">
        <div class="book-image-container">
          <img
            :src="getBookImage(borrow.MaSach?.BiaSach)"
            :alt="borrow.MaSach?.TenSach"
            class="book-image"
            @error="handleImageError"
          />

          <!-- Status Badge -->
          <div class="status-badge" :class="getStatusClass()">
            {{ getStatusText() }}
          </div>
        </div>
      </div>

      <!-- Book Info -->
      <div class="col-md-7">
        <div class="book-content">
          <div class="book-header">
            <h5 class="book-title" @click="viewBookDetail">
              {{ borrow.MaSach?.TenSach }}
            </h5>
            <div class="book-meta">
              <span class="author">
                <i class="bi bi-person me-1"></i>
                {{ borrow.MaSach?.TacGia }}
              </span>
              <span class="category">
                <i class="bi bi-tag me-1"></i>
                {{ borrow.MaSach?.MaDM?.TenDM }}
              </span>
              <span class="publisher">
                <i class="bi bi-building me-1"></i>
                {{ borrow.MaSach?.MaNXB?.TenNXB }}
              </span>
            </div>
          </div>

          <div class="borrow-info">
            <div class="info-item">
              <label>Ngày mượn:</label>
              <span>{{ formatDate(borrow.NgayMuon || borrow.createdAt) }}</span>
            </div>

            <div v-if="borrow.NgayTraDuKien" class="info-item">
              <label>Ngày trả dự kiến:</label>
              <span :class="getDueDateClass()">
                {{ formatDate(borrow.NgayTraDuKien) }}
              </span>
            </div>

            <div v-if="borrow.NgayTraThucTe" class="info-item">
              <label>Ngày trả thực tế:</label>
              <span>{{ formatDate(borrow.NgayTraThucTe) }}</span>
            </div>

            <div v-if="borrow.LyDoTuChoi" class="info-item">
              <label>Lý do từ chối:</label>
              <span class="text-danger">{{ borrow.LyDoTuChoi }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="col-md-3">
        <div class="borrow-actions">
          <!-- Status Info -->
          <div class="status-info mb-3">
            <div class="current-status" :class="getStatusClass()">
              <i :class="getStatusIcon()" class="me-2"></i>
              {{ borrow.TrangThai }}
            </div>

            <div
              v-if="showTimeRemaining()"
              class="time-remaining"
              :class="getTimeClass()"
            >
              <i class="bi bi-clock me-1"></i>
              {{ getTimeRemaining() }}
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button
              v-if="canExtend()"
              @click="extendBorrow"
              class="btn btn-warning btn-sm w-100 mb-2"
              :disabled="extending"
            >
              <span
                v-if="extending"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-calendar-plus me-2"></i>
              {{ extending ? "Đang gia hạn..." : "Gia hạn" }}
            </button>

            <button
              v-if="canCancel()"
              @click="cancelBorrow"
              class="btn btn-outline-danger btn-sm w-100 mb-2"
              :disabled="canceling"
            >
              <span
                v-if="canceling"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-x-circle me-2"></i>
              {{ canceling ? "Đang hủy..." : "Hủy yêu cầu" }}
            </button>

            <button
              @click="viewBookDetail"
              class="btn btn-outline-primary btn-sm w-100"
            >
              <i class="bi bi-info-circle me-2"></i>
              Chi tiết sách
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
  name: "BorrowBookCard",
  props: {
    borrow: {
      type: Object,
      required: true,
    },
  },
  emits: ["action"],
  setup(props, { emit }) {
    const router = useRouter();
    const toast = useToast();

    const extending = ref(false);
    const canceling = ref(false);

    // Computed
    const isOverdue = computed(() => {
      if (props.borrow.TrangThai !== "Đã mượn") return false;
      const dueDate = new Date(props.borrow.NgayTraDuKien);
      const now = new Date();
      return now > dueDate;
    });

    // Methods
    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const handleImageError = (event) => {
      event.target.src = "/src/assets/images/book-placeholder.jpg";
    };

    const getStatusClass = () => {
      if (isOverdue.value) return "overdue";

      const classes = {
        "Chờ duyệt": "warning",
        "Đã duyệt": "info",
        "Đã mượn": "primary",
        "Đã trả": "success",
        "Từ chối": "danger",
      };
      return classes[props.borrow.TrangThai] || "secondary";
    };

    const getStatusText = () => {
      return isOverdue.value ? "Quá hạn" : props.borrow.TrangThai;
    };

    const getStatusIcon = () => {
      if (isOverdue.value) return "bi bi-exclamation-triangle";

      const icons = {
        "Chờ duyệt": "bi bi-clock",
        "Đã duyệt": "bi bi-check-circle",
        "Đã mượn": "bi bi-book",
        "Đã trả": "bi bi-check-square",
        "Từ chối": "bi bi-x-circle",
      };
      return icons[props.borrow.TrangThai] || "bi bi-question-circle";
    };

    const getDueDateClass = () => {
      if (props.borrow.TrangThai !== "Đã mượn") return "";
      if (isOverdue.value) return "text-danger fw-bold";

      const dueDate = new Date(props.borrow.NgayTraDuKien);
      const now = new Date();
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) return "text-warning fw-bold";
      return "";
    };

    const showTimeRemaining = () => {
      return props.borrow.TrangThai === "Đã mượn";
    };

    const getTimeRemaining = () => {
      if (!props.borrow.NgayTraDuKien) return "";

      const dueDate = new Date(props.borrow.NgayTraDuKien);
      const now = new Date();
      const diffTime = dueDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return `Quá hạn ${Math.abs(diffDays)} ngày`;
      } else if (diffDays === 0) {
        return "Hết hạn hôm nay";
      } else if (diffDays === 1) {
        return "Hết hạn ngày mai";
      } else {
        return `Còn ${diffDays} ngày`;
      }
    };

    const getTimeClass = () => {
      if (isOverdue.value) return "overdue";

      const dueDate = new Date(props.borrow.NgayTraDuKien);
      const now = new Date();
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) return "warning";
      return "normal";
    };

    const canExtend = () => {
      return props.borrow.TrangThai === "Đã mượn" && !props.borrow.daGiaHan;
    };

    const canCancel = () => {
      return ["Chờ duyệt", "Đã duyệt"].includes(props.borrow.TrangThai);
    };

    const extendBorrow = async () => {
      const result = await Swal.fire({
        title: "Gia hạn sách",
        text: `Bạn có muốn gia hạn thêm 14 ngày cho cuốn "${props.borrow.MaSach?.TenSach}"?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Gia hạn",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        extending.value = true;

        try {
          await api.borrowing.extendBorrow(props.borrow._id);
          toast.success("Gia hạn sách thành công!");
          emit("action", { type: "extend", borrow: props.borrow });
        } catch (error) {
          console.error("Error extending borrow:", error);
        } finally {
          extending.value = false;
        }
      }
    };

    const cancelBorrow = async () => {
      const result = await Swal.fire({
        title: "Hủy yêu cầu mượn sách",
        text: `Bạn có chắc chắn muốn hủy yêu cầu mượn "${props.borrow.MaSach?.TenSach}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        confirmButtonText: "Hủy yêu cầu",
        cancelButtonText: "Giữ lại",
      });

      if (result.isConfirmed) {
        canceling.value = true;

        try {
          await api.borrowing.cancelRequest(props.borrow._id);
          toast.success("Hủy yêu cầu thành công!");
          emit("action", { type: "cancel", borrow: props.borrow });
        } catch (error) {
          console.error("Error canceling borrow:", error);
        } finally {
          canceling.value = false;
        }
      }
    };

    const viewBookDetail = () => {
      router.push({
        name: "BookDetail",
        params: { id: props.borrow.MaSach?._id },
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
      extending,
      canceling,
      isOverdue,
      getBookImage,
      handleImageError,
      getStatusClass,
      getStatusText,
      getStatusIcon,
      getDueDateClass,
      showTimeRemaining,
      getTimeRemaining,
      getTimeClass,
      canExtend,
      canCancel,
      extendBorrow,
      cancelBorrow,
      viewBookDetail,
      formatDate,
    };
  },
};
</script>

<style scoped>
.borrow-book-card {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.borrow-book-card:hover {
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.borrow-book-card.overdue {
  border-left: 4px solid var(--danger-color);
  background: rgba(239, 68, 68, 0.05);
}

.book-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.book-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.status-badge.warning {
  background: var(--warning-color);
}
.status-badge.info {
  background: var(--accent-color);
}
.status-badge.primary {
  background: var(--primary-color);
}
.status-badge.success {
  background: var(--success-color);
}
.status-badge.danger {
  background: var(--danger-color);
}
.status-badge.overdue {
  background: var(--danger-color);
}

.book-content {
  padding: 1.5rem;
  height: 100%;
}

.book-title {
  font-weight: 600;
  color: var(--dark-color);
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.book-title:hover {
  color: var(--primary-color);
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.borrow-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.info-item label {
  font-weight: 500;
  color: var(--dark-color);
  margin-bottom: 0;
}

.borrow-actions {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.current-status {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  text-align: center;
  margin-bottom: 0.5rem;
}

.current-status.warning {
  background: var(--warning-color);
}
.current-status.info {
  background: var(--accent-color);
}
.current-status.primary {
  background: var(--primary-color);
}
.current-status.success {
  background: var(--success-color);
}
.current-status.danger {
  background: var(--danger-color);
}
.current-status.overdue {
  background: var(--danger-color);
}

.time-remaining {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  padding: 0.25rem;
}

.time-remaining.normal {
  color: var(--success-color);
}
.time-remaining.warning {
  color: var(--warning-color);
}
.time-remaining.overdue {
  color: var(--danger-color);
}

.action-buttons {
  margin-top: auto;
}

@media (max-width: 768px) {
  .book-content {
    padding: 1rem;
  }

  .borrow-actions {
    padding: 1rem;
  }

  .book-meta {
    font-size: 0.8rem;
  }

  .info-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .action-buttons .btn {
    font-size: 0.8rem;
  }
}
</style>
