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
      <div class="row">
        <!-- Book Image -->
        <div class="col-lg-4 mb-4">
          <div class="book-image-section">
            <div class="main-image">
              <img
                :src="getBookImage(book.BiaSach)"
                :alt="book.TenSach"
                class="img-fluid rounded shadow"
                @error="handleImageError"
              />

              <!-- Availability Badge -->
              <div class="availability-badge-large" :class="availabilityClass">
                <i :class="availabilityIcon" class="me-2"></i>
                {{ availabilityText }}
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions mt-4">
              <button
                @click="requestBorrow"
                class="btn btn-primary-gradient btn-lg w-100 mb-3"
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
                @click="toggleFavorite"
                class="btn btn-lg w-100"
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
                {{ isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Book Information -->
        <div class="col-lg-8">
          <div class="book-info-section">
            <!-- Title and Basic Info -->
            <div class="book-header mb-4">
              <h1 class="book-title">{{ book.TenSach }}</h1>
              <div class="book-meta">
                <span class="author">
                  <i class="bi bi-person me-2"></i>
                  <strong>Tác giả:</strong> {{ book.TacGia }}
                </span>
                <span class="category">
                  <i class="bi bi-tag me-2"></i>
                  <strong>Danh mục:</strong>
                  <router-link
                    :to="{
                      name: 'BookCatalog',
                      query: { category: book.MaDM?._id },
                    }"
                    class="text-decoration-none"
                  >
                    {{ book.MaDM?.TenDM || "Chưa phân loại" }}
                  </router-link>
                </span>
                <span class="publisher">
                  <i class="bi bi-building me-2"></i>
                  <strong>Nhà xuất bản:</strong>
                  {{ book.MaNXB?.TenNXB || "Chưa rõ" }}
                </span>
                <span class="year">
                  <i class="bi bi-calendar me-2"></i>
                  <strong>Năm xuất bản:</strong> {{ book.NamXuatBan }}
                </span>
                <span class="id">
                  <i class="bi bi-hash me-2"></i>
                  <strong>Mã sách:</strong> <code>{{ book.MaSach }}</code>
                </span>
              </div>
            </div>

            <!-- Description -->
            <div class="book-description mb-4">
              <h5>
                <i class="bi bi-book-half me-2"></i>
                Mô tả
              </h5>
              <div class="description-content">
                <p v-if="book.MoTa" class="lead">{{ book.MoTa }}</p>
                <p v-else class="text-muted fst-italic">
                  Chưa có mô tả cho cuốn sách này.
                </p>
              </div>
            </div>

            <!-- Stats -->
            <div class="book-stats mb-4">
              <h5>
                <i class="bi bi-graph-up me-2"></i>
                Thống kê
              </h5>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <div class="stat-item">
                    <div class="stat-icon">
                      <i class="bi bi-collection"></i>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ book.SoQuyen || 0 }}</div>
                      <div class="stat-label">Số quyển hiện có</div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <div class="stat-item">
                    <div class="stat-icon">
                      <i class="bi bi-arrow-repeat"></i>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">{{ book.soLanMuon || 0 }}</div>
                      <div class="stat-label">Lượt mượn</div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <div class="stat-item">
                    <div class="stat-icon">
                      <i class="bi bi-heart"></i>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">
                        {{ book.soLuotYeuThich || 0 }}
                      </div>
                      <div class="stat-label">Lượt yêu thích</div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <div class="stat-item">
                    <div class="stat-icon">
                      <i class="bi bi-star"></i>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">
                        {{ book.danhGiaTrungBinh || "N/A" }}
                      </div>
                      <div class="stat-label">Đánh giá</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Share -->
            <div class="book-share">
              <h6>
                <i class="bi bi-share me-2"></i>
                Chia sẻ sách này
              </h6>
              <div class="share-buttons">
                <button
                  @click="shareBook('facebook')"
                  class="btn btn-outline-primary btn-sm"
                >
                  <i class="bi bi-facebook me-1"></i>
                  Facebook
                </button>
                <button
                  @click="shareBook('twitter')"
                  class="btn btn-outline-info btn-sm"
                >
                  <i class="bi bi-twitter me-1"></i>
                  Twitter
                </button>
                <button
                  @click="copyLink"
                  class="btn btn-outline-secondary btn-sm"
                >
                  <i class="bi bi-link me-1"></i>
                  Sao chép link
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
      return book.value.SoQuyen > 0 && authStore.isAuthenticated;
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
      if (!authStore.isAuthenticated) return "Đăng nhập để mượn";
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

          // Fetch related books
          fetchRelatedBooks(bookId);
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

    const fetchRelatedBooks = async (bookId) => {
      try {
        const response = await api.books.getRelated(bookId, 4);
        if (response.success) {
          relatedBooks.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching related books:", error);
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

      if (!canBorrow.value) return;

      requesting.value = true;

      try {
        await api.borrowing.requestBorrow(book.value._id);
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
      handleImageError,
    };
  },
};
</script>

<style scoped>
.book-image-section {
  position: sticky;
  top: 120px;
}

.main-image {
  position: relative;
  text-align: center;
}

.main-image img {
  max-width: 100%;
  height: auto;
  max-height: 500px;
}

.availability-badge-large {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
}

.availability-badge-large.available {
  background: var(--success-color);
}

.availability-badge-large.limited {
  background: var(--warning-color);
}

.availability-badge-large.unavailable {
  background: var(--danger-color);
}

.book-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 1.1rem;
  margin-bottom: 2rem;
}

.book-meta > span {
  display: flex;
  align-items: center;
  color: #6b7280;
}

.book-meta strong {
  color: var(--dark-color);
}

.description-content {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.2);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--dark-color);
}

.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.share-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--dark-color);
}

@media (max-width: 991px) {
  .book-image-section {
    position: static;
    margin-bottom: 2rem;
  }

  .main-image {
    text-align: center;
  }

  .quick-actions {
    max-width: 400px;
    margin: 1rem auto 0;
  }
}

@media (max-width: 768px) {
  .book-title {
    font-size: 2rem;
  }

  .book-meta {
    font-size: 1rem;
  }

  .stat-item {
    padding: 1rem;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }

  .stat-number {
    font-size: 1.2rem;
  }

  .share-buttons {
    justify-content: center;
  }
}
</style>
