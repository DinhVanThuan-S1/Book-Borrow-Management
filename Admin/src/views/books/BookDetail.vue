<template>
  <div class="book-detail fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Chi tiết sách</h1>
          <!-- <p class="page-subtitle">Thông tin chi tiết về sách trong thư viện</p> -->
        </div>
        <div class="d-flex gap-2">
          <router-link to="/books" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-2"></i>
            Quay lại
          </router-link>
          <router-link
            :to="`/books/${book._id}/edit`"
            class="btn btn-primary"
            v-if="book._id"
          >
            <i class="bi bi-pencil me-2"></i>
            Chỉnh sửa
          </router-link>
          <button
            @click="deleteBook"
            class="btn btn-outline-danger"
            v-if="book._id"
          >
            <i class="bi bi-trash me-2"></i>
            Xóa sách
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="mt-2">Đang tải thông tin sách...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="bi bi-exclamation-triangle me-2"></i>
      {{ error }}
    </div>

    <!-- Book Detail Content -->
    <div v-else-if="book._id" class="row g-4">
      <!-- Book Image and Basic Info -->
      <div class="col-lg-4">
        <div class="admin-card">
          <div class="card-body text-center">
            <div class="book-image-large mb-4">
              <img
                :src="getBookImage(book.BiaSach)"
                :alt="book.TenSach"
                class="img-fluid rounded shadow"
                style="max-height: 400px; object-fit: cover"
              />
            </div>
            <div class="book-status mb-3">
              <span
                class="badge fs-6 px-3 py-2"
                :class="getStockStatusClass(book.SoQuyen)"
              >
                <i class="bi bi-stack me-1"></i>
                {{ getStockStatusText(book.SoQuyen) }}
              </span>
            </div>
            <div class="book-price">
              <span class="h4 text-success fw-bold">
                {{ formatCurrency(book.DonGia) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Book Information -->
      <div class="col-lg-8">
        <!-- Basic Information -->
        <div class="admin-card">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-info-circle me-2"></i>
              Thông tin cơ bản
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-6">
                <div class="info-group">
                  <label class="info-label">Tên sách</label>
                  <div class="info-value h5 text-dark mb-0">
                    {{ book.TenSach }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Mã sách</label>
                  <div class="info-value">
                    <span class="badge bg-light text-dark">{{
                      book.MaSach
                    }}</span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Danh mục</label>
                  <div class="info-value">
                    <span class="badge bg-primary">{{ book.MaDM?.TenDM }}</span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Tác giả</label>
                  <div class="info-value">
                    <i class="bi bi-person me-2 text-muted"></i>
                    {{ book.TacGia }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Nhà xuất bản</label>
                  <div class="info-value">
                    <i class="bi bi-building me-2 text-muted"></i>
                    {{ book.MaNXB?.TenNXB }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Năm xuất bản</label>
                  <div class="info-value">
                    <i class="bi bi-calendar me-2 text-muted"></i>
                    {{ book.NamXuatBan }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Số trang</label>
                  <div class="info-value">
                    <i class="bi bi-file-text me-2 text-muted"></i>
                    {{ book.SoTrang || "Chưa cập nhật" }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Phần</label>
                  <div class="info-value">
                    <i class="bi bi-file-text me-2 text-muted"></i>
                    {{ book.Phan || "Chưa cập nhật" }}
                  </div>
                </div>
              </div>
              <div class="col-12" v-if="book.MoTa">
                <div class="info-group">
                  <label class="info-label">Mô tả</label>
                  <div class="info-value">
                    <p class="mb-0 text-muted">{{ book.MoTa }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";
import api from "@/services/api";

export default {
  name: "BookDetail",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const toast = useToast();

    const book = ref({});
    const isLoading = ref(false);
    const error = ref("");

    // Methods
    const fetchBookDetail = async () => {
      try {
        isLoading.value = true;
        error.value = "";

        const bookId = route.params.id;
        const response = await api.get(`/sach/${bookId}`);

        if (response.success) {
          book.value = response.data;
        } else {
          error.value = "Không tìm thấy thông tin sách";
        }
      } catch (err) {
        console.error("Error fetching book detail:", err);
        error.value = "Có lỗi khi tải thông tin sách";
      } finally {
        isLoading.value = false;
      }
    };

    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN").format(amount);
    };

    const formatDate = (dateString) => {
      if (!dateString) return "-";
      return new Date(dateString).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getStockStatusClass = (quantity) => {
      if (quantity > 5) return "bg-success";
      if (quantity > 0) return "bg-warning";
      return "bg-danger";
    };

    const getStockStatusText = (quantity) => {
      if (quantity > 5) return `Còn ${quantity} quyển`;
      if (quantity > 0) return `Sắp hết (${quantity} quyển)`;
      return "Hết sách";
    };

    const deleteBook = async () => {
      const result = await Swal.fire({
        title: "Xác nhận xóa sách",
        html: `
          <div class="text-start">
            <p>Bạn có chắc chắn muốn xóa sách này?</p>
            <div class="bg-light p-3 rounded">
              <strong>${book.value.TenSach}</strong><br>
              <small class="text-muted">Tác giả: ${book.value.TacGia}</small><br>
              <small class="text-muted">Mã sách: ${book.value.MaSach}</small>
            </div>
            <div class="alert alert-warning mt-2 mb-0">
              <small><i class="bi bi-exclamation-triangle me-1"></i>
              Hành động này không thể hoàn tác!</small>
            </div>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Xóa",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        try {
          await api.delete(`/sach/${book.value._id}`);
          toast.success("Xóa sách thành công");
          router.push("/books");
        } catch (error) {
          console.error("Error deleting book:", error);
          toast.error("Có lỗi khi xóa sách");
        }
      }
    };

    // Lifecycle
    onMounted(() => {
      fetchBookDetail();
    });

    return {
      book,
      isLoading,
      error,
      getBookImage,
      formatCurrency,
      formatDate,
      getStockStatusClass,
      getStockStatusText,
      deleteBook,
    };
  },
};
</script>

<style scoped>
.book-image-large {
  display: flex;
  justify-content: center;
  align-items: center;
}

.book-image-large img {
  max-width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.info-group {
  margin-bottom: 1rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
  display: block;
}

.info-value {
  font-size: 1rem;
  color: #212529;
  font-weight: 500;
}

.breadcrumb {
  background: none;
  padding: 0;
  margin-bottom: 1rem;
}

.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
  color: #6c757d;
}

.table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
  color: #6c757d;
  border-bottom: 2px solid #dee2e6;
}

.fade-in-up {
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
