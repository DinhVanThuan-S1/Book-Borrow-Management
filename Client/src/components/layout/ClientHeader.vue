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
            <!-- Quick Search -->
            <div class="nav-item me-2">
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
                class="btn btn-outline-light dropdown-toggle btn-sm d-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-person me-2"></i>
                <span>{{ authStore.userName }}</span>
              </button>

              <ul class="dropdown-menu dropdown-menu-end">
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
  </header>
</template>

<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "ClientHeader",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const toast = useToast();

    const searchQuery = ref("");

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
      // Removed favorites functionality
    };

    onMounted(() => {
      fetchUserStats();
    });

    return {
      authStore,
      searchQuery,
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
