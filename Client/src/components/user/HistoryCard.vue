<template>
  <div class="history-card client-card" :class="getCardClass()">
    <div class="row g-0">
      <!-- Book Image -->
      <div class="col-md-2">
        <div class="book-image-container">
          <img
            :src="getBookImage(history.MaSach?.BiaSach)"
            :alt="history.MaSach?.TenSach"
            class="book-image"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- History Info -->
      <div class="col-md-7">
        <div class="history-content">
          <div class="book-header">
            <h6 class="book-title" @click="viewBookDetail">
              {{ history.MaSach?.TenSach }}
            </h6>
            <div class="book-meta">
              <span class="author">
                <i class="bi bi-person me-1"></i>
                {{ history.MaSach?.TacGia }}
              </span>
              <span class="category">
                <i class="bi bi-tag me-1"></i>
                {{ history.MaSach?.MaDM?.TenDM }}
              </span>
            </div>
          </div>

          <div class="history-timeline">
            <div class="timeline-row">
              <div class="timeline-label">Ngày mượn:</div>
              <div class="timeline-value">
                <i class="bi bi-calendar me-1"></i>
                {{ formatDateTime(history.NgayMuon || history.createdAt) }}
              </div>
            </div>

            <div v-if="history.NgayTraDuKien" class="timeline-row">
              <div class="timeline-label">Hạn trả:</div>
              <div class="timeline-value" :class="getDueDateClass()">
                <i class="bi bi-calendar-event me-1"></i>
                {{ formatDateTime(history.NgayTraDuKien) }}
                {{ getDueDateStatus() }}
              </div>
            </div>

            <div v-if="history.NgayTraThucTe" class="timeline-row">
              <div class="timeline-label">Ngày trả:</div>
              <div class="timeline-value" :class="getReturnDateClass()">
                <i class="bi bi-calendar-check me-1"></i>
                {{ formatDateTime(history.NgayTraThucTe) }}
                {{ getReturnStatus() }}
              </div>
            </div>

            <div v-if="history.LyDoTuChoi" class="timeline-row">
              <div class="timeline-label">Lý do từ chối:</div>
              <div class="timeline-value text-danger">
                <i class="bi bi-x-circle me-1"></i>
                {{ history.LyDoTuChoi }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status & Actions -->
      <div class="col-md-3">
        <div class="history-status">
          <div class="status-badge" :class="getStatusClass()">
            <i :class="getStatusIcon()" class="me-2"></i>
            {{ getStatusText() }}
          </div>

          <div
            v-if="showDaysInfo()"
            class="days-info"
            :class="getDaysInfoClass()"
          >
            <i class="bi bi-hourglass me-1"></i>
            {{ getDaysInfo() }}
          </div>

          <div v-if="showFineInfo()" class="fine-info">
            <div class="fine-amount">
              <i class="bi bi-exclamation-triangle me-1"></i>
              Phí phạt: {{ formatCurrency(history.PhiPhat || 0) }}
            </div>
          </div>

          <div class="history-actions">
            <button
              @click="viewBookDetail"
              class="btn btn-outline-primary btn-sm w-100 mb-2"
            >
              <i class="bi bi-info-circle me-2"></i>
              Chi tiết sách
            </button>

            <button
              v-if="canBorrowAgain()"
              @click="borrowAgain"
              class="btn btn-primary-gradient btn-sm w-100"
              :disabled="borrowingAgain"
            >
              <span
                v-if="borrowingAgain"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="bi bi-arrow-repeat me-2"></i>
              {{ borrowingAgain ? "Đang xử lý..." : "Mượn lại" }}
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
import api from "@/services/api";

export default {
  name: "HistoryCard",
  props: {
    history: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const router = useRouter();
    const toast = useToast();

    const borrowingAgain = ref(false);

    // Computed
    const isOverdue = computed(() => {
      if (props.history.TrangThai !== "Đã mượn") return false;
      const dueDate = new Date(props.history.NgayTraDuKien);
      const now = new Date();
      return now > dueDate;
    });

    const isReturnedLate = computed(() => {
      if (props.history.TrangThai !== "Đã trả" || !props.history.NgayTraThucTe)
        return false;
      const dueDate = new Date(props.history.NgayTraDuKien);
      const returnDate = new Date(props.history.NgayTraThucTe);
      return returnDate > dueDate;
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

    const getCardClass = () => {
      if (isOverdue.value) return "overdue";
      if (isReturnedLate.value) return "late";
      if (props.history.TrangThai === "Đã trả") return "returned";
      return "";
    };

    const getStatusClass = () => {
      if (isOverdue.value) return "danger";
      if (isReturnedLate.value) return "warning";

      const classes = {
        "Chờ duyệt": "warning",
        "Đã duyệt": "info",
        "Đã mượn": "primary",
        "Đã trả": "success",
        "Từ chối": "danger",
      };
      return classes[props.history.TrangThai] || "secondary";
    };

    const getStatusIcon = () => {
      if (isOverdue.value) return "bi bi-exclamation-triangle";
      if (isReturnedLate.value) return "bi bi-clock-history";

      const icons = {
        "Chờ duyệt": "bi bi-clock",
        "Đã duyệt": "bi bi-check-circle",
        "Đã mượn": "bi bi-book",
        "Đã trả": "bi bi-check-square",
        "Từ chối": "bi bi-x-circle",
      };
      return icons[props.history.TrangThai] || "bi bi-question-circle";
    };

    const getStatusText = () => {
      if (isOverdue.value) return "Quá hạn";
      if (isReturnedLate.value) return "Trả muộn";
      return props.history.TrangThai;
    };

    const getDueDateClass = () => {
      if (props.history.TrangThai !== "Đã mượn") return "";
      if (isOverdue.value) return "text-danger fw-bold";

      const dueDate = new Date(props.history.NgayTraDuKien);
      const now = new Date();
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays <= 2) return "text-warning fw-bold";
      return "";
    };

    const getDueDateStatus = () => {
      if (props.history.TrangThai !== "Đã mượn") return "";
      if (isOverdue.value) return "(Quá hạn)";

      const dueDate = new Date(props.history.NgayTraDuKien);
      const now = new Date();
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "(Hôm nay)";
      if (diffDays === 1) return "(Ngày mai)";
      if (diffDays <= 2) return `(Còn ${diffDays} ngày)`;
      return "";
    };

    const getReturnDateClass = () => {
      return isReturnedLate.value ? "text-warning" : "text-success";
    };

    const getReturnStatus = () => {
      return isReturnedLate.value ? "(Trả muộn)" : "(Đúng hạn)";
    };

    const showDaysInfo = () => {
      return (
        props.history.TrangThai === "Đã mượn" ||
        props.history.TrangThai === "Đã trả"
      );
    };

    const getDaysInfo = () => {
      if (props.history.TrangThai === "Đã mượn") {
        if (isOverdue.value) {
          const dueDate = new Date(props.history.NgayTraDuKien);
          const now = new Date();
          const diffDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
          return `Quá hạn ${diffDays} ngày`;
        } else {
          const dueDate = new Date(props.history.NgayTraDuKien);
          const now = new Date();
          const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
          return `Còn ${diffDays} ngày`;
        }
      } else if (props.history.TrangThai === "Đã trả") {
        const borrowDate = new Date(
          props.history.NgayMuon || props.history.createdAt
        );
        const returnDate = new Date(props.history.NgayTraThucTe);
        const diffDays = Math.ceil(
          (returnDate - borrowDate) / (1000 * 60 * 60 * 24)
        );
        return `Mượn ${diffDays} ngày`;
      }
      return "";
    };

    const getDaysInfoClass = () => {
      if (isOverdue.value) return "text-danger";
      if (props.history.TrangThai === "Đã mượn") {
        const dueDate = new Date(props.history.NgayTraDuKien);
        const now = new Date();
        const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
        if (diffDays <= 2) return "text-warning";
      }
      return "text-muted";
    };

    const showFineInfo = () => {
      return props.history.PhiPhat && props.history.PhiPhat > 0;
    };

    const canBorrowAgain = () => {
      return (
        props.history.TrangThai === "Đã trả" &&
        props.history.MaSach?.SoQuyen > 0
      );
    };

    const borrowAgain = async () => {
      borrowingAgain.value = true;

      try {
        await api.borrowing.requestBorrow(props.history.MaSach._id);
        toast.success("Yêu cầu mượn lại đã được gửi thành công!");
      } catch (error) {
        console.error("Error borrowing again:", error);
      } finally {
        borrowingAgain.value = false;
      }
    };

    const viewBookDetail = () => {
      router.push({
        name: "BookDetail",
        params: { id: props.history.MaSach._id },
      });
    };

    const formatDateTime = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    return {
      borrowingAgain,
      isOverdue,
      isReturnedLate,
      getBookImage,
      handleImageError,
      getCardClass,
      getStatusClass,
      getStatusIcon,
      getStatusText,
      getDueDateClass,
      getDueDateStatus,
      getReturnDateClass,
      getReturnStatus,
      showDaysInfo,
      getDaysInfo,
      getDaysInfoClass,
      showFineInfo,
      canBorrowAgain,
      borrowAgain,
      viewBookDetail,
      formatDateTime,
      formatCurrency,
    };
  },
};
</script>

<style scoped>
.history-card {
  transition: all 0.3s ease;
  border: 1px solid #e5e7eb;
}

.history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.history-card.overdue {
  border-left: 4px solid var(--danger-color);
  background: rgba(239, 68, 68, 0.03);
}

.history-card.late {
  border-left: 4px solid var(--warning-color);
  background: rgba(245, 158, 11, 0.03);
}

.history-card.returned {
  border-left: 4px solid var(--success-color);
  background: rgba(16, 185, 129, 0.03);
}

.book-image-container {
  height: 120px;
  overflow: hidden;
}

.book-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-content {
  padding: 1.5rem;
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

.book-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timeline-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}

.timeline-label {
  font-weight: 500;
  color: var(--dark-color);
  min-width: 80px;
}

.timeline-value {
  color: #6b7280;
  display: flex;
  align-items: center;
}

.history-status {
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.status-badge {
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

.status-badge.primary {
  background: var(--primary-color);
}
.status-badge.success {
  background: var(--success-color);
}
.status-badge.warning {
  background: var(--warning-color);
}
.status-badge.danger {
  background: var(--danger-color);
}
.status-badge.info {
  background: var(--accent-color);
}
.status-badge.secondary {
  background: #6c757d;
}

.days-info {
  font-size: 0.8rem;
  font-weight: 500;
  text-align: center;
  padding: 0.25rem;
}

.fine-info {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger-color);
  border-radius: 0.375rem;
  padding: 0.75rem;
}

.fine-amount {
  color: var(--danger-color);
  font-weight: 600;
  font-size: 0.9rem;
  text-align: center;
}

.history-actions {
  margin-top: auto;
}

@media (max-width: 768px) {
  .history-content {
    padding: 1rem;
  }

  .history-status {
    padding: 1rem;
  }

  .book-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .timeline-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .timeline-label {
    min-width: auto;
  }
}
</style>
