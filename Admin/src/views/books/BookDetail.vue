<template>
  <div class="book-detail fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Chi tiết sách</h1>
          <p class="page-subtitle">Thông tin chi tiết về sách trong thư viện</p>
        </div>
        <div class="d-flex gap-2">
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

        <!-- Quick Stats -->
        <div class="admin-card mt-4">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-bar-chart me-2"></i>
              Thống kê nhanh
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-6">
                <div class="stat-item text-center">
                  <div class="stat-value text-primary">{{ book.SoQuyen }}</div>
                  <div class="stat-label">Số lượng</div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-item text-center">
                  <div class="stat-value text-info">{{ borrowedCount }}</div>
                  <div class="stat-label">Đã mượn</div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-item text-center">
                  <div class="stat-value text-success">
                    {{ availableCount }}
                  </div>
                  <div class="stat-label">Còn lại</div>
                </div>
              </div>
              <div class="col-6">
                <div class="stat-item text-center">
                  <div class="stat-value text-warning">{{ favoriteCount }}</div>
                  <div class="stat-label">Yêu thích</div>
                </div>
              </div>
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
              <div class="col-12">
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

        <!-- Additional Information -->
        <div class="admin-card mt-4">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-clock-history me-2"></i>
              Thông tin bổ sung
            </h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Ngày thêm</label>
                  <div class="info-value">
                    <i class="bi bi-calendar-plus me-2 text-muted"></i>
                    {{ formatDate(book.createdAt) }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Cập nhật lần cuối</label>
                  <div class="info-value">
                    <i class="bi bi-calendar-check me-2 text-muted"></i>
                    {{ formatDate(book.updatedAt) }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Trạng thái</label>
                  <div class="info-value">
                    <span
                      class="badge"
                      :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-danger'"
                    >
                      {{ book.SoQuyen > 0 ? "Có sẵn" : "Hết sách" }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Vị trí</label>
                  <div class="info-value">
                    <i class="bi bi-geo-alt me-2 text-muted"></i>
                    {{ book.ViTri || "Chưa cập nhật" }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Borrowing History -->
    <div class="admin-card mt-4" v-if="book._id">
      <div
        class="card-header-custom d-flex justify-content-between align-items-center"
      >
        <h5 class="mb-0">
          <i class="bi bi-clock-history me-2"></i>
          Lịch sử mượn sách
        </h5>
        <span class="badge bg-light text-dark"
          >{{ borrowHistory.length }} lượt mượn</span
        >
      </div>
      <div class="card-body">
        <div
          v-if="borrowHistory.length === 0"
          class="text-center text-muted py-4"
        >
          <i class="bi bi-inbox display-4 d-block mb-3"></i>
          <h6>Chưa có lịch sử mượn</h6>
          <p>Sách này chưa được mượn lần nào</p>
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Độc giả</th>
                <th>Ngày mượn</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in borrowHistory" :key="record._id">
                <td>
                  <div>
                    <div class="fw-bold">
                      {{ record.MaDocGia?.HoLot }} {{ record.MaDocGia?.Ten }}
                    </div>
                    <small class="text-muted">{{
                      record.MaDocGia?.Email
                    }}</small>
                  </div>
                </td>
                <td>{{ formatDate(record.NgayMuon) }}</td>
                <td>
                  {{
                    record.NgayTraThucTe
                      ? formatDate(record.NgayTraThucTe)
                      : formatDate(record.NgayHenTra)
                  }}
                </td>
                <td>
                  <span
                    class="badge"
                    :class="getBorrowStatusClass(record.TrangThai)"
                  >
                    {{ getBorrowStatusText(record.TrangThai) }}
                  </span>
                </td>
                <td>{{ record.GhiChu || "-" }}</td>
              </tr>
            </tbody>
          </table>
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
    const borrowHistory = ref([]);
    const isLoading = ref(false);
    const error = ref("");

    // Stats
    const borrowedCount = ref(0);
    const availableCount = ref(0);
    const favoriteCount = ref(0);

    // Methods
    const fetchBookDetail = async () => {
      try {
        isLoading.value = true;
        error.value = "";

        const bookId = route.params.id;
        const response = await api.get(`/sach/${bookId}`);

        if (response.success) {
          book.value = response.data;
          availableCount.value = book.value.SoQuyen;

          // Fetch additional stats
          await fetchBorrowHistory();
          await fetchStats();
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

    const fetchBorrowHistory = async () => {
      try {
        const bookId = route.params.id;
        const response = await api.get(`/muonsach/sach/${bookId}`);

        if (response.success) {
          borrowHistory.value = response.data;

          // Calculate borrowed count (currently borrowed)
          borrowedCount.value = borrowHistory.value.filter(
            (record) => record.TrangThai === "DANG_MUON"
          ).length;

          // Update available count
          availableCount.value = book.value.SoQuyen - borrowedCount.value;
        }
      } catch (err) {
        console.error("Error fetching borrow history:", err);
      }
    };

    const fetchStats = async () => {
      try {
        const bookId = route.params.id;
        // Fetch favorite count if API exists
        // const favoriteResponse = await api.get(`/yeuthich/sach/${bookId}/count`);
        // favoriteCount.value = favoriteResponse.data.count || 0;
        favoriteCount.value = 0; // Placeholder
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };

    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
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

    const getBorrowStatusClass = (status) => {
      switch (status) {
        case "DANG_MUON":
          return "bg-warning";
        case "DA_TRA":
          return "bg-success";
        case "QUA_HAN":
          return "bg-danger";
        default:
          return "bg-secondary";
      }
    };

    const getBorrowStatusText = (status) => {
      switch (status) {
        case "DANG_MUON":
          return "Đang mượn";
        case "DA_TRA":
          return "Đã trả";
        case "QUA_HAN":
          return "Quá hạn";
        default:
          return "Không xác định";
      }
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
      borrowHistory,
      isLoading,
      error,
      borrowedCount,
      availableCount,
      favoriteCount,
      getBookImage,
      formatCurrency,
      formatDate,
      getStockStatusClass,
      getStockStatusText,
      getBorrowStatusClass,
      getBorrowStatusText,
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

.stat-item {
  padding: 1rem;
  border-radius: 0.5rem;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
  margin-top: 0.25rem;
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
