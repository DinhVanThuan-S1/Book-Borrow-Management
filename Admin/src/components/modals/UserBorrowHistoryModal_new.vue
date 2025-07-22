<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-clock-history me-2"></i>
          Lịch sử mượn sách - {{ getFullName(user) }}
        </h5>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="isLoading" class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div class="mt-2">Đang tải lịch sử...</div>
        </div>

        <div
          v-else-if="borrowHistory.length === 0"
          class="text-center p-5 text-muted"
        >
          <i class="bi bi-journal-x display-4 d-block mb-3"></i>
          <h6>Chưa có lịch sử mượn sách</h6>
          <p>Độc giả này chưa mượn sách nào.</p>
        </div>

        <div v-else>
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>STT</th>
                  <th>Sách</th>
                  <th>Ngày mượn</th>
                  <th>Hạn trả</th>
                  <th>Ngày trả</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in borrowHistory" :key="item._id">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <div class="d-flex align-items-center">
                      <img
                        v-if="item.sach?.BiaSach"
                        :src="getBookImage(item.sach.BiaSach)"
                        :alt="item.sach.TenSach"
                        class="book-thumbnail me-2"
                      />
                      <div>
                        <div class="fw-bold">
                          {{ item.sach?.TenSach || "N/A" }}
                        </div>
                        <small class="text-muted">{{
                          item.sach?.TacGia || "N/A"
                        }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ formatDate(item.NgayMuon) }}</td>
                  <td>{{ formatDate(item.NgayHenTra) }}</td>
                  <td>{{ item.NgayTra ? formatDate(item.NgayTra) : "-" }}</td>
                  <td>
                    <span class="badge" :class="getStatusBadgeClass(item)">
                      {{ getStatusText(item) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          <i class="bi bi-x-circle me-2"></i>
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "UserBorrowHistoryModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      default: null,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const toast = useToast();
    const isLoading = ref(false);
    const borrowHistory = ref([]);

    const fetchBorrowHistory = async () => {
      if (!props.user?._id) return;

      isLoading.value = true;
      try {
        const response = await api.get(`/muonsach/docgia/${props.user._id}`);
        if (response.success) {
          borrowHistory.value = response.data || [];
        }
      } catch (error) {
        console.error("Error fetching borrow history:", error);
        toast.error("Có lỗi khi tải lịch sử mượn sách");
      } finally {
        isLoading.value = false;
      }
    };

    const closeModal = () => {
      emit("close");
    };

    const getFullName = (user) => {
      if (!user) return "";
      return `${user.HoLot || ""} ${user.Ten || ""}`.trim();
    };

    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const getStatusText = (item) => {
      if (item.NgayTra) {
        const returnDate = new Date(item.NgayTra);
        const dueDate = new Date(item.NgayHenTra);
        return returnDate > dueDate ? "Trả muộn" : "Đã trả";
      }

      const today = new Date();
      const dueDate = new Date(item.NgayHenTra);
      return today > dueDate ? "Quá hạn" : "Đang mượn";
    };

    const getStatusBadgeClass = (item) => {
      if (item.NgayTra) {
        const returnDate = new Date(item.NgayTra);
        const dueDate = new Date(item.NgayHenTra);
        return returnDate > dueDate ? "bg-warning" : "bg-success";
      }

      const today = new Date();
      const dueDate = new Date(item.NgayHenTra);
      return today > dueDate ? "bg-danger" : "bg-primary";
    };

    // Watch for show changes
    watch(
      () => props.show,
      (show) => {
        if (show && props.user) {
          fetchBorrowHistory();
        }
      }
    );

    return {
      isLoading,
      borrowHistory,
      closeModal,
      getFullName,
      getBookImage,
      formatDate,
      getStatusText,
      getStatusBadgeClass,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
}

.btn-close:hover {
  color: #dc3545;
  background-color: #f8f9fa;
}

.modal-body {
  padding: 0 1.5rem 1rem;
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.book-thumbnail {
  width: 40px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.25rem;
  border: 1px solid #dee2e6;
}

.table th {
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

.badge {
  font-size: 0.75rem;
  padding: 0.35em 0.65em;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
