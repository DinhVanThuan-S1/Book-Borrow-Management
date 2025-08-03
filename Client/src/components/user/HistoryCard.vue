<template>
  <div class="client-card" :class="getCardClass()">
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
            </div>
            <span class="category">
                <i class="bi bi-tag"></i>
                {{ history.MaSach?.MaDM?.TenDM }}
            </span>
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

          <div v-if="showFineInfo()" class="fine-info">
            <div class="fine-amount">
              <i class="bi bi-exclamation-triangle me-1"></i>
              Phí phạt: {{ formatCurrency(history.PhiPhat || 0) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

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

    // Computed
    const isOverdue = computed(() => {
      // Items with explicit overdue status
      if (props.history.TrangThai === "Quá hạn") return true;
      
      // Items that are actively borrowed but overdue
      if (props.history.TrangThai !== "Đang mượn") return false;
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
      // Ensure the path starts with /uploads if it doesn't already have a protocol
      if (imagePath.startsWith("/uploads")) {
        return `http://localhost:5000${imagePath}`;
      }
      return `http://localhost:5000/uploads/books/${imagePath}`;
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
        "Đã duyệt": "info",
        "Đang mượn": "primary",
        "Đã trả": "success",
        "Từ chối": "danger",
      };
      return classes[props.history.TrangThai] || "secondary";
    };

    const getStatusIcon = () => {
      if (isOverdue.value) return "bi bi-exclamation-triangle";
      if (isReturnedLate.value) return "bi bi-clock-history";

      const icons = {
        "Đã duyệt": "bi bi-check-circle",
        "Đang mượn": "bi bi-book",
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

    const showFineInfo = () => {
      return props.history.PhiPhat && props.history.PhiPhat > 0;
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
      isOverdue,
      isReturnedLate,
      getBookImage,
      handleImageError,
      getCardClass,
      getStatusClass,
      getStatusIcon,
      getStatusText,
      showFineInfo,
      viewBookDetail,
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
  height: 150px;
  overflow: hidden;
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.book-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.book-image:hover {
  transform: scale(1.05);
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

  .book-image-container {
    height: 120px;
  }

  .history-card .row.g-0 > .col-md-2 {
    flex: 0 0 auto;
    width: 25%;
  }

  .history-card .row.g-0 > .col-md-7 {
    flex: 0 0 auto;
    width: 75%;
  }

  .history-card .row.g-0 > .col-md-3 {
    flex: 0 0 auto;
    width: 100%;
    margin-top: 1rem;
  }
}
</style>
