import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Layout
import ClientLayout from "@/components/layout/ClientLayout.vue";
import AuthLayout from "@/components/layout/AuthLayout.vue";

// Public Pages
import Home from "@/views/Home.vue";
import BookCatalog from "@/views/BookCatalog.vue";
import BookDetail from "@/views/BookDetail.vue";

// Auth Pages
import Login from "@/views/auth/Login.vue";
import Register from "@/views/auth/Register.vue";

// User Dashboard
import BorrowHistory from "@/views/user/BorrowHistory.vue";
import Favorites from "@/views/user/Favorites.vue";

const routes = [
  // Public Routes
  {
    path: "/",
    component: ClientLayout,
    children: [
      {
        path: "",
        name: "Home",
        component: Home,
        meta: {
          title: "Trang chủ",
          description: "Thư viện trực tuyến - Khám phá kho sách phong phú",
        },
      },
      {
        path: "/sach",
        name: "BookCatalog",
        component: BookCatalog,
        meta: {
          title: "Danh mục sách",
          description: "Khám phá hàng ngàn đầu sách hay",
        },
      },
      {
        path: "/sach/:id",
        name: "BookDetail",
        component: BookDetail,
        meta: {
          title: "Chi tiết sách",
          description: "Thông tin chi tiết và đánh giá sách",
        },
      },
    ],
  },

  // Auth Routes
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "dang-nhap",
        name: "Login",
        component: Login,
        meta: {
          title: "Đăng nhập",
          guest: true,
        },
      },
      {
        path: "dang-ky",
        name: "Register",
        component: Register,
        meta: {
          title: "Đăng ký",
          guest: true,
        },
      },
    ],
  },

  // User Dashboard Routes
  {
    path: "/tai-khoan",
    component: ClientLayout,
    meta: { requiresAuth: true },
    redirect: "/tai-khoan/yeu-thich",
    children: [
      {
        path: "lich-su-muon",
        name: "BorrowHistory",
        component: BorrowHistory,
        meta: {
          title: "Lịch sử mượn sách",
          requiresAuth: true,
        },
      },
      {
        path: "yeu-thich",
        name: "Favorites",
        component: Favorites,
        meta: {
          title: "Sách yêu thích",
          requiresAuth: true,
        },
      },
    ],
  },

  // 404 Route
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: { title: "Không tìm thấy trang" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Thư viện trực tuyến`;
  }

  // Initialize auth if not already done
  if (!authStore.initialized) {
    await authStore.initializeAuth();
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      next({
        name: "Login",
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  // Redirect authenticated users away from guest routes
  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: "Dashboard" });
    return;
  }

  next();
});

export default router;
