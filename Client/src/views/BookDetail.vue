<template>
  <div class="book-detail">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <div class="mt-3">Đang tải thông tin sách...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container py-5">
      <div class="empty-state">
        <div class="empty-state-icon">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <h4 class="empty-state-title">Không tìm thấy sách</h4>
        <p class="empty-state-description">
          Sách bạn đang tìm có thể đã bị xóa hoặc không tồn tại.
        </p>
        <router-link to="/sach" class="btn btn-primary-gradient">
          <i class="bi bi-arrow-left me-2"></i>
          Quay lại danh mục
        </router-link>
      </div>
    </div>

    <!-- Book Details -->
    <div v-else class="container py-5">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none">
              <i class="bi bi-house me-1"></i>
              Trang chủ
            </router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link to="/sach" class="text-decoration-none">
              Danh mục sách
            </router-link>
          </li>
          <li class="breadcrumb-item active">{{ book.TenSach }}</li>
        </ol>
      </nav>

      <!-- Main Content -->
      <div class="row g-4">
        <!-- Book Image -->
        <div class="col-lg-5">
          <div class="book-image-wrapper">
            <div class="book-image-container">
              <img
                :src="getBookImage(book.BiaSach)"
                :alt="book.TenSach"
                class="book-image"
                @error="handleImageError"
              />
              
              <!-- Availability Badge -->
              <div class="status-badge" :class="availabilityClass">
                <i :class="availabilityIcon"></i>
                {{ availabilityText }}
              </div>
            </div>

            <!-- Price -->
            <div class="book-price">
              <span class="price-label">Giá sách</span>
              <span class="price-value">{{ formatPrice(book.DonGia) }}</span>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button
                @click="requestBorrow"
                class="btn-borrow"
                :disabled="(!canBorrow && authStore.isAuthenticated) || requesting"
              >
                <span v-if="requesting" class="spinner"></span>
                <i v-else class="bi bi-download"></i>
                {{ borrowButtonText }}
              </button>

              <button
                @click="toggleFavorite"
                class="btn-favorite"
                :class="{ active: isFavorite }"
                :disabled="togglingFavorite"
              >
                <span v-if="togglingFavorite" class="spinner"></span>
                <i v-else :class="isFavorite ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                {{ isFavorite ? "Đã yêu thích" : "Yêu thích" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Book Information -->
        <div class="col-lg-7">
          <div class="book-details">
            <div class="book-header">
              <h1 class="book-title">{{ book.TenSach }}</h1>
              <div class="book-author">
                <i class="bi bi-person-circle"></i>
                {{ book.TacGia }}
              </div>
            </div>

            <div class="book-info-grid">
              <div class="info-item" v-if="getCategoryName(book)">
                <span class="label">Danh mục</span>
                <router-link
                  :to="{ name: 'BookCatalog', query: { category: getCategoryId(book) } }"
                  class="value link"
                >
                  {{ getCategoryName(book) }}
                </router-link>
              </div>

              <div class="info-item" v-if="getPublisherName(book)">
                <span class="label">Nhà xuất bản</span>
                <span class="value">{{ getPublisherName(book) }}</span>
              </div>

              <div class="info-item" v-if="book.NamXuatBan">
                <span class="label">Năm xuất bản</span>
                <span class="value">{{ book.NamXuatBan }}</span>
              </div>

              <div class="info-item">
                <span class="label">Mã sách</span>
                <span class="value code">{{ book.MaSach }}</span>
              </div>
            </div>

            <!-- Description -->
            <div class="description-section" v-if="book.MoTa">
              <h3 class="section-title">Mô tả</h3>
              <p class="description-text">{{ book.MoTa }}</p>
            </div>

            <!-- Stats -->
            <div class="stats-section">
              <h3 class="section-title">Thông tin</h3>
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-icon books">
                    <i class="bi bi-stack"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ book.SoQuyen || 0 }}</div>
                    <div class="stat-label">Còn lại</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon borrows">
                    <i class="bi bi-arrow-repeat"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ book.soLanMuon || 0 }}</div>
                    <div class="stat-label">Lượt mượn</div>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon favorites">
                    <i class="bi bi-heart"></i>
                  </div>
                  <div class="stat-content">
                    <div class="stat-number">{{ book.soLuotYeuThich || 0 }}</div>
                    <div class="stat-label">Yêu thích</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Share -->
            <div class="share-section">
              <span class="share-label">Chia sẻ:</span>
              <div class="share-buttons">
                <button @click="shareBook('facebook')" class="share-btn facebook">
                  <i class="bi bi-facebook"></i>
                </button>
                <button @click="shareBook('twitter')" class="share-btn twitter">
                  <i class="bi bi-twitter"></i>
                </button>
                <button @click="copyLink" class="share-btn copy">
                  <i class="bi bi-link-45deg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Related Books -->
      <section v-if="relatedBooks.length > 0" class="related-books mt-5">
        <h3 class="section-title mb-4">
          <i class="bi bi-bookmark me-2"></i>
          Sách liên quan
        </h3>
        <div class="row">
          <div
            v-for="relatedBook in relatedBooks"
            :key="relatedBook._id"
            class="col-lg-3 col-md-4 col-sm-6 mb-4"
          >
            <BookCard :book="relatedBook" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import api from "@/services/api";
import BookCard from "@/components/common/BookCard.vue";

export default {
  name: "BookDetail",
  components: {
    BookCard,
  },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const toast = useToast();

    const book = ref({});
    const relatedBooks = ref([]);
    const isLoading = ref(false);
    const error = ref(false);
    const isFavorite = ref(false);
    const togglingFavorite = ref(false);
    const requesting = ref(false);

    const canBorrow = computed(() => {
      // Cho phép click nút để chuyển đến trang đăng nhập nếu chưa đăng nhập
      // Hoặc cho phép mượn nếu đã đăng nhập và còn sách
      return !authStore.isAuthenticated || book.value.SoQuyen > 0;
    });

    const availabilityClass = computed(() => {
      if (book.value.SoQuyen > 5) return "available";
      if (book.value.SoQuyen > 0) return "limited";
      return "unavailable";
    });

    const availabilityText = computed(() => {
      if (book.value.SoQuyen > 5) return "Còn nhiều";
      if (book.value.SoQuyen > 0) return `Còn ${book.value.SoQuyen} quyển`;
      return "Hết sách";
    });

    const availabilityIcon = computed(() => {
      if (book.value.SoQuyen > 5) return "bi bi-check-circle";
      if (book.value.SoQuyen > 0) return "bi bi-exclamation-triangle";
      return "bi bi-x-circle";
    });

    const borrowButtonText = computed(() => {
      if (!authStore.isAuthenticated) return "Mượn sách";
      if (book.value.SoQuyen === 0) return "Hết sách";
      if (requesting.value) return "Đang xử lý...";
      return "Mượn sách này";
    });

    const fetchBook = async (bookId) => {
      try {
        isLoading.value = true;
        error.value = false;

        const response = await api.books.getById(bookId);
        if (response.success) {
          book.value = response.data;

          // Update page title
          document.title = `${book.value.TenSach} - Thư viện trực tuyến`;

          // Fetch related books based on category
          fetchRelatedBooks();
        }
      } catch (err) {
        console.error("Error fetching book:", err);
        error.value = true;
        if (err.response?.status === 404) {
          document.title = "Không tìm thấy sách - Thư viện trực tuyến";
        }
      } finally {
        isLoading.value = false;
      }
    };

    const fetchRelatedBooks = async () => {
      try {
        const categoryId = getCategoryId(book.value);
        if (categoryId) {
          const response = await api.books.getByCategory(categoryId, {
            limit: 8,
          });
          if (response.success && response.data) {
            // Xử lý cấu trúc response khác nhau
            let books = [];
            
            // Trường hợp response.data là array trực tiếp
            if (Array.isArray(response.data)) {
              books = response.data;
            }
            // Trường hợp response.data có property sach
            else if (response.data.sach && Array.isArray(response.data.sach)) {
              books = response.data.sach;
            }
            // Trường hợp response.data có property data
            else if (response.data.data && Array.isArray(response.data.data)) {
              books = response.data.data;
            }

            // Lọc bỏ sách hiện tại khỏi danh sách liên quan
            relatedBooks.value = books
              .filter((item) => item._id !== book.value._id)
              .slice(0, 4);
          }
        }
      } catch (error) {
        console.error("Error fetching related books:", error);
        // Không hiển thị lỗi cho user, chỉ không hiện related books
        relatedBooks.value = [];
      }
    };

    const checkFavoriteStatus = async () => {
      if (!authStore.isAuthenticated || !book.value._id) return;

      try {
        const response = await api.favorites.check(book.value._id);
        isFavorite.value = response.data.isFavorite;
      } catch (error) {
        console.error("Error checking favorite status:", error);
      }
    };

    const requestBorrow = async () => {
      if (!authStore.isAuthenticated) {
        router.push({
          name: "Login",
          query: { redirect: route.fullPath },
        });
        return;
      }

      if (book.value.SoQuyen === 0) {
        toast.warning("Sách đã hết, không thể mượn!");
        return;
      }

      requesting.value = true;

      try {
        await api.borrowing.requestBorrow(book.value._id);
        toast.success("Yêu cầu mượn sách đã được gửi thành công!");
      } catch (error) {
        console.error("Error requesting borrow:", error);
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu mượn sách!");
      } finally {
        requesting.value = false;
      }
    };

    const toggleFavorite = async () => {
      if (!authStore.isAuthenticated) {
        router.push({
          name: "Login",
          query: { redirect: route.fullPath },
        });
        return;
      }

      togglingFavorite.value = true;

      try {
        if (isFavorite.value) {
          await api.favorites.remove(book.value._id);
          isFavorite.value = false;
          toast.info("Đã xóa khỏi danh sách yêu thích");
        } else {
          await api.favorites.add(book.value._id);
          isFavorite.value = true;
          toast.success("Đã thêm vào danh sách yêu thích");
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật danh sách yêu thích!");
      } finally {
        togglingFavorite.value = false;
      }
    };

    const shareBook = (platform) => {
      const url = window.location.href;
      const title = `${book.value.TenSach} - Thư viện trực tuyến`;
      const text = `Khám phá cuốn sách hay: ${book.value.TenSach} của ${book.value.TacGia}`;

      let shareUrl = "";

      switch (platform) {
        case "facebook":
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`;
          break;
        case "twitter":
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(text)}`;
          break;
      }

      if (shareUrl) {
        window.open(shareUrl, "_blank", "width=600,height=400");
      }
    };

    const copyLink = async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Đã sao chép link thành công!");
      } catch (error) {
        console.error("Error copying link:", error);
        toast.error("Không thể sao chép link");
      }
    };

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

    const getCategoryId = (book) => {
      // Xử lý trường hợp populate thông thường
      if (book.MaDM && typeof book.MaDM === 'object' && book.MaDM._id) {
        return book.MaDM._id;
      }
      
      // Xử lý trường hợp aggregation
      if (book.danhmuc && Array.isArray(book.danhmuc) && book.danhmuc.length > 0) {
        return book.danhmuc[0]._id;
      }

      // Xử lý trường hợp MaDM là string (chỉ có ID)
      if (book.MaDM && typeof book.MaDM === 'string') {
        return book.MaDM;
      }

      return null;
    };

    const getPublisherName = (book) => {
      // Xử lý trường hợp populate thông thường
      if (book.MaNXB && typeof book.MaNXB === 'object' && book.MaNXB.TenNXB) {
        return book.MaNXB.TenNXB;
      }
      
      // Xử lý trường hợp aggregation
      if (book.nhaxuatban && Array.isArray(book.nhaxuatban) && book.nhaxuatban.length > 0) {
        return book.nhaxuatban[0].TenNXB;
      }

      return null;
    };

    const handleImageError = (event) => {
      event.target.src = "/src/assets/images/book-placeholder.jpg";
    };

    // Watch for route changes
    watch(
      () => route.params.id,
      (newId) => {
        if (newId) {
          fetchBook(newId);
        }
      }
    );

    // Watch for authentication changes
    watch(
      () => authStore.isAuthenticated,
      () => {
        checkFavoriteStatus();
      }
    );

    // Watch for book changes
    watch(book, () => {
      checkFavoriteStatus();
    });

    // Lifecycle
    onMounted(() => {
      if (route.params.id) {
        fetchBook(route.params.id);
      }
    });

    return {
      book,
      relatedBooks,
      isLoading,
      error,
      isFavorite,
      togglingFavorite,
      requesting,
      canBorrow,
      availabilityClass,
      availabilityText,
      availabilityIcon,
      borrowButtonText,
      requestBorrow,
      toggleFavorite,
      shareBook,
      copyLink,
      getBookImage,
      formatPrice,
      getCategoryName,
      getCategoryId,
      getPublisherName,
      handleImageError,
    };
  },
};
</script>

<style scoped>
/* Book Image */
.book-image-wrapper {
  position: sticky;
  top: 100px;
}

.book-image-container {
  position: relative;
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  margin-bottom: 1.5rem;
}

.book-image {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;
}

.book-image:hover {
  transform: scale(1.02);
}

.status-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge.available {
  background: linear-gradient(135deg, #10b981, #059669);
}

.status-badge.limited {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.status-badge.unavailable {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

/* Book Price */
.book-price {
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.price-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.price-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: #dc2626;
  font-family: 'Inter', sans-serif;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-borrow {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-borrow:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
}

.btn-borrow:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-favorite {
  background: white;
  color: #ef4444;
  border: 2px solid #fee2e2;
  padding: 0.875rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-favorite:hover:not(:disabled) {
  border-color: #ef4444;
  background: #fef2f2;
}

.btn-favorite.active {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn-favorite:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Book Details */
.book-details {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.book-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.book-title {
  font-size: 2.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
  line-height: 1.2;
}

.book-author {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  color: #64748b;
  font-weight: 500;
}

.book-author i {
  color: #6366f1;
  font-size: 1.25rem;
}

/* Info Grid */
.book-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.value {
  font-size: 1rem;
  color: #1e293b;
  font-weight: 500;
}

.value.link {
  color: #6366f1;
  text-decoration: none;
  transition: color 0.2s ease;
}

.value.link:hover {
  color: #4f46e5;
}

.value.code {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f8fafc;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

/* Description */
.description-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.description-text {
  font-size: 1rem;
  line-height: 1.7;
  color: #475569;
  margin: 0;
}

/* Stats */
.stats-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #f1f5f9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
}

.stat-icon.books {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.borrows {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.favorites {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  margin-top: 0.25rem;
}

/* Share */
.share-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.share-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.share-buttons {
  display: flex;
  gap: 0.5rem;
}

.share-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
  cursor: pointer;
}

.share-btn:hover {
  transform: translateY(-1px);
}

.share-btn.facebook {
  background: #1877f2;
}

.share-btn.twitter {
  background: #1da1f2;
}

.share-btn.copy {
  background: #64748b;
}

/* Related Books */
.related-books {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1.5rem;
}

.section-title i {
  color: #6366f1;
}

/* Responsive */
@media (max-width: 991px) {
  .book-image-wrapper {
    position: static;
    margin-bottom: 2rem;
  }
  
  .book-title {
    font-size: 1.875rem;
  }
  
  .book-info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .book-details {
    padding: 1.5rem;
  }
  
  .book-image-container {
    padding: 1.5rem;
  }
  
  .book-title {
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .share-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}
</style>
