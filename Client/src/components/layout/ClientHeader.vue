<template>
  <header class="client-header">
    <nav class="navbar navbar-expand-lg">
      <div class="container">
        <!-- Brand -->
        <router-link to="/" class="navbar-brand">
          <i class="bi bi-book me-2"></i>
          Thư Viện Online
        </router-link>

        <!-- Mobile Toggle -->
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon">
            <i class="bi bi-list text-white"></i>
          </span>
        </button>

        <!-- Navigation -->
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link
                to="/"
                class="nav-link"
                :class="{ active: $route.name === 'Home' }"
              >
                <i class="bi bi-house me-1"></i>
                Trang chủ
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                to="/sach"
                class="nav-link"
                :class="{ active: $route.name === 'BookCatalog' }"
              >
                <i class="bi bi-book me-1"></i>
                Danh mục sách
              </router-link>
            </li>
          </ul>

          <!-- User Actions -->
          <div class="navbar-nav">
            <!-- Search Button -->
            <button
              class="btn btn-outline-light me-2 d-lg-none"
              @click="showSearchModal = true"
            >
              <i class="bi bi-search"></i>
            </button>

            <!-- Quick Search (Desktop) -->
            <div class="nav-item me-2 d-none d-lg-block">
              <form @submit.prevent="quickSearch" class="search-form">
                <div class="input-group input-group-sm">
                  <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control"
                    placeholder="Tìm kiếm sách..."
                    style="min-width: 200px"
                  />
                  <button class="btn btn-outline-light" type="submit">
                    <i class="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>

            <!-- Authentication -->
            <div v-if="!authStore.isAuthenticated" class="nav-item">
              <div class="d-flex gap-2">
                <router-link
                  to="/auth/dang-nhap"
                  class="btn btn-outline-light btn-sm"
                >
                  <i class="bi bi-box-arrow-in-right me-1"></i>
                  Đăng nhập
                </router-link>
                <router-link to="/auth/dang-ky" class="btn btn-light btn-sm">
                  <i class="bi bi-person-plus me-1"></i>
                  Đăng ký
                </router-link>
              </div>
            </div>

            <!-- User Menu -->
            <div v-else class="nav-item dropdown">
              <button
                class="btn btn-outline-light dropdown-toggle d-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                <div class="user-avatar me-2">
                  <img
                    v-if="authStore.userAvatar"
                    :src="authStore.userAvatar"
                    :alt="authStore.userName"
                    class="avatar-img"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ authStore.userInitials }}
                  </div>
                </div>
                <span class="d-none d-md-inline">{{ authStore.userName }}</span>
              </button>

              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <h6 class="dropdown-header">
                    <i class="bi bi-person-circle me-2"></i>
                    {{ authStore.userName }}
                  </h6>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <router-link to="/tai-khoan" class="dropdown-item">
                    <i class="bi bi-speedometer2 me-2"></i>
                    Trang cá nhân
                  </router-link>
                </li>
                <li>
                  <router-link
                    to="/tai-khoan/sach-dang-muon"
                    class="dropdown-item"
                  >
                    <i class="bi bi-book me-2"></i>
                    Sách đang mượn
                    <span
                      v-if="borrowingCount > 0"
                      class="badge bg-primary ms-2"
                    >
                      {{ borrowingCount }}
                    </span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/tai-khoan/yeu-thich" class="dropdown-item">
                    <i class="bi bi-heart me-2"></i>
                    Yêu thích
                    <span
                      v-if="favoritesCount > 0"
                      class="badge bg-danger ms-2"
                    >
                      {{ favoritesCount }}
                    </span>
                  </router-link>
                </li>
                <li>
                  <router-link
                    to="/tai-khoan/lich-su-muon"
                    class="dropdown-item"
                  >
                    <i class="bi bi-clock-history me-2"></i>
                    Lịch sử mượn
                  </router-link>
                </li>
                <li>
                  <router-link to="/tai-khoan/thong-tin" class="dropdown-item">
                    <i class="bi bi-gear me-2"></i>
                    Cài đặt
                  </router-link>
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <button @click="logout" class="dropdown-item text-danger">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Đăng xuất
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Mobile Search Modal -->
    <SearchModal :show="showSearchModal" @close="showSearchModal = false" />
  </header>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import api from "@/services/api";
import SearchModal from "@/components/modals/SearchModal.vue";

export default {
  name: "ClientHeader",
  components: {
    SearchModal,
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const toast = useToast();

    const searchQuery = ref("");
    const showSearchModal = ref(false);
    const borrowingCount = ref(0);
    const favoritesCount = ref(0);

    const quickSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          name: "BookCatalog",
          query: { q: searchQuery.value.trim() },
        });
        searchQuery.value = "";
      }
    };

    const logout = async () => {
      try {
        await authStore.logout();
        router.push("/");
        toast.success("Đăng xuất thành công");
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

    const fetchUserStats = async () => {
      if (!authStore.isAuthenticated) return;

      try {
        const [borrowsRes, favoritesRes] = await Promise.all([
          api.borrowing.getMyBorrows({ limit: 1, status: "Đã mượn" }),
          api.favorites.getMyFavorites({ limit: 1 }),
        ]);

        borrowingCount.value = borrowsRes.pagination?.total || 0;
        favoritesCount.value = favoritesRes.pagination?.total || 0;
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    onMounted(() => {
      fetchUserStats();
    });

    return {
      authStore,
      searchQuery,
      showSearchModal,
      borrowingCount,
      favoritesCount,
      quickSearch,
      logout,
    };
  },
};
</script>

<style scoped>
.client-header {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.navbar-toggler {
  border: none;
  padding: 0.25rem;
}

.navbar-toggler:focus {
  box-shadow: none;
}

.search-form .input-group {
  transition: all 0.3s ease;
}

.search-form .form-control {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.search-form .form-control::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.search-form .form-control:focus {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  color: white;
  box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.25);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  color: white;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-radius: var(--border-radius);
}

.dropdown-item {
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.dropdown-item:hover {
  background: var(--light-color);
}

.badge {
  font-size: 0.7rem;
}

@media (max-width: 991px) {
  .navbar-nav {
    text-align: center;
  }

  .nav-item {
    margin: 0.25rem 0;
  }
}
</style>
