<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="hero-content">
              <h1 class="hero-title fade-in-up">Thế giới tri thức</h1>
              <p class="hero-subtitle fade-in-up">
                <b>Hàng nghìn đầu sách hay đang chờ bạn khám phá...</b>
              </p>
              <div class="hero-actions fade-in-up">
                <router-link
                  to="/sach"
                  class="btn btn-primary-gradient btn-lg me-3"
                >
                  <i class="bi bi-book me-2"></i>
                  Khám phá sách
                </router-link>
                <router-link
                  v-if="!authStore.isAuthenticated"
                  to="/auth/dang-ky"
                  class="btn btn-primary-gradient btn-lg"
                >
                  <i class="bi bi-person-plus me-2"></i>
                  Đăng ký ngay
                </router-link>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image fade-in-up">
              <div class="floating-books">
                <div class="book-float book-1">
                  <i class="bi bi-book"></i>
                </div>
                <div class="book-float book-2">
                  <i class="bi bi-journal-bookmark"></i>
                </div>
                <div class="book-float book-3">
                  <i class="bi bi-book-half"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section -->
    <section class="container">
      <div class="search-container">
        <h3 class="text-center mb-4">
          <i class="bi bi-search me-2"></i>
          Tìm kiếm sách yêu thích
        </h3>
        <SearchForm @search="handleSearch" />
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section py-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card fade-in-up">
              <div class="stats-number">{{ stats.totalBooks || 0 }}</div>
              <div class="stats-label">Đầu sách</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card fade-in-up">
              <div class="stats-number">{{ stats.totalUsers || 0 }}</div>
              <div class="stats-label">Thành viên</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card fade-in-up">
              <div class="stats-number">{{ stats.totalBorrows || 0 }}</div>
              <div class="stats-label">Lượt mượn</div>
            </div>
          </div>
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="stats-card fade-in-up">
              <div class="stats-number">{{ stats.totalCategories || 0 }}</div>
              <div class="stats-label">Danh mục</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Books -->
    <section class="featured-section py-5">
      <div class="container">
        <div class="row mb-5">
          <div class="col-12 text-center">
            <h2 class="section-title">
              <i class="bi bi-star me-2"></i>
              Sách nổi bật
            </h2>
            <p class="section-subtitle">Những cuốn sách được yêu thích nhất</p>
          </div>
        </div>

        <FeaturedBooks :books="featuredBooks" :loading="loadingFeatured" />

        <div class="text-center mt-5">
          <router-link to="/sach" class="btn btn-secondary-gradient btn-lg">
            <i class="bi bi-arrow-right me-2"></i>
            Xem tất cả sách
          </router-link>
        </div>
      </div>
    </section>

    <!-- New Books -->
    <section class="new-books-section py-5 bg-light">
      <div class="container">
        <div class="row mb-5">
          <div class="col-12 text-center">
            <h2 class="section-title">
              <i class="bi bi-plus-circle me-2"></i>
              Sách mới nhất
            </h2>
            <p class="section-subtitle">
              Những cuốn sách vừa được thêm vào thư viện
            </p>
          </div>
        </div>

        <NewBooks :books="newBooks" :loading="loadingNew" />
      </div>
    </section>


    <!-- Features -->
    <section class="features-section py-5 bg-light">
      <div class="container">
        <div class="row mb-5">
          <div class="col-12 text-center">
            <h2 class="section-title">Tại sao chọn thư viện của chúng tôi?</h2>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="feature-card client-card h-100">
              <div class="feature-icon">
                <i class="bi bi-lightning-charge"></i>
              </div>
              <h5>Mượn sách nhanh chóng</h5>
              <p>
                Chỉ với vài click, bạn có thể đăng ký mượn và nhận sách tại thư viện.
              </p>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="feature-card client-card h-100">
              <div class="feature-icon">
                <i class="bi bi-collection"></i>
              </div>
              <h5>Kho sách phong phú</h5>
              <p>Hàng ngàn đầu sách từ nhiều lĩnh vực khác nhau.</p>
            </div>
          </div>

          <div class="col-lg-4 col-md-6 mb-4">
            <div class="feature-card client-card h-100">
              <div class="feature-icon">
                <i class="bi bi-shield-check"></i>
              </div>
              <h5>An toàn và tiện lợi</h5>
              <p>Hệ thống bảo mật cao và giao diện thân thiện.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import api from "@/services/api";
import SearchForm from "@/components/common/SearchForm.vue";
import FeaturedBooks from "@/components/sections/FeaturedBooks.vue";
import NewBooks from "@/components/sections/NewBooks.vue";
import CategoriesGrid from "@/components/sections/CategoriesGrid.vue";

export default {
  name: "Home",
  components: {
    SearchForm,
    FeaturedBooks,
    NewBooks,
    CategoriesGrid,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const stats = ref({});
    const featuredBooks = ref([]);
    const newBooks = ref([]);
    const categories = ref([]);

    const loadingFeatured = ref(false);
    const loadingNew = ref(false);
    const loadingCategories = ref(false);

    const fetchStats = async () => {
      try {
        // Gọi API thống kê công khai hoặc fake data nếu không có quyền
        stats.value = {
          totalBooks: 1250,
          totalUsers: 850,
          totalBorrows: 3200,
          totalCategories: 15,
        };
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Sử dụng dữ liệu mặc định
        stats.value = {
          totalBooks: 0,
          totalUsers: 0,
          totalBorrows: 0,
          totalCategories: 0,
        };
      }
    };

    const fetchFeaturedBooks = async () => {
      try {
        loadingFeatured.value = true;
        const response = await api.books.getPopular(8);
        if (response.data && Array.isArray(response.data)) {
          featuredBooks.value = response.data;
        } else if (response && Array.isArray(response)) {
          featuredBooks.value = response;
        } else {
          featuredBooks.value = [];
        }
      } catch (error) {
        console.error("Error fetching featured books:", error);
        featuredBooks.value = [];
      } finally {
        loadingFeatured.value = false;
      }
    };

    const fetchNewBooks = async () => {
      try {
        loadingNew.value = true;
        const response = await api.books.getAll({
          limit: 8,
          sort: "createdAt",
          order: "desc",
        });
        if (response.data && Array.isArray(response.data)) {
          newBooks.value = response.data;
        } else if (response && Array.isArray(response)) {
          newBooks.value = response;
        } else {
          newBooks.value = [];
        }
      } catch (error) {
        console.error("Error fetching new books:", error);
        newBooks.value = [];
      } finally {
        loadingNew.value = false;
      }
    };

    const fetchCategories = async () => {
      try {
        loadingCategories.value = true;
        const response = await api.categories.getWithStats();
        if (response.data && Array.isArray(response.data)) {
          categories.value = response.data.slice(0, 8);
        } else if (response && Array.isArray(response)) {
          categories.value = response.slice(0, 8);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback với danh sách danh mục cơ bản
        try {
          const basicResponse = await api.categories.getAll();
          if (basicResponse.data && Array.isArray(basicResponse.data)) {
            categories.value = basicResponse.data.slice(0, 8);
          } else if (basicResponse && Array.isArray(basicResponse)) {
            categories.value = basicResponse.slice(0, 8);
          } else {
            categories.value = [];
          }
        } catch (basicError) {
          console.error("Error fetching basic categories:", basicError);
          categories.value = [];
        }
      } finally {
        loadingCategories.value = false;
      }
    };

    const handleSearch = (searchData) => {
      router.push({
        name: "BookCatalog",
        query: {
          q: searchData.query,
          category: searchData.category,
        },
      });
    };

    onMounted(() => {
      fetchStats();
      fetchFeaturedBooks();
      fetchNewBooks();
      fetchCategories();
    });

    return {
      authStore,
      stats,
      featuredBooks,
      newBooks,
      categories,
      loadingFeatured,
      loadingNew,
      loadingCategories,
      handleSearch,
    };
  },
};
</script>

<style scoped>
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
  margin-bottom: 0;
}

.hero-actions {
  margin-top: 2rem;
}

.hero-image {
  position: relative;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.floating-books {
  position: relative;
  width: 300px;
  height: 300px;
}

.book-float {
  position: absolute;
  width: 80px;
  height: 80px;
  background: var(--gradient-primary);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
  box-shadow: var(--box-shadow);
}

.book-1 {
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.book-2 {
  top: 50%;
  right: 10%;
  animation-delay: 1s;
  background: var(--gradient-secondary);
}

.book-3 {
  bottom: 20%;
  left: 30%;
  animation-delay: 2s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

.stats-section {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.feature-card {
  text-align: center;
  padding: 2.5rem 2rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: var(--gradient-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  font-size: 2rem;
  color: white;
}

.feature-card h5 {
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--dark-color);
}

.feature-card p {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-actions {
    text-align: center;
  }

  .hero-actions .btn {
    display: block;
    width: 100%;
    margin: 0.5rem 0;
  }

  .floating-books {
    width: 250px;
    height: 250px;
  }

  .book-float {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 2rem;
  }
}
</style>
