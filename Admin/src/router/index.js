import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Layout
import AdminLayout from "@/components/layout/AdminLayout.vue";

// Auth Views
import Login from "@/views/auth/Login.vue";

// Dashboard
import Dashboard from "@/views/dashboard/Dashboard.vue";

// Book Management
import BookList from "@/views/books/BookList.vue";
import BookCreate from "@/views/books/BookCreate.vue";
import BookEdit from "@/views/books/BookEdit.vue";
import BookDetail from "@/views/books/BookDetail.vue";

// Category Management
import CategoryList from "@/views/categories/CategoryList.vue";

// Publisher Management
import PublisherList from "@/views/publishers/PublisherList.vue";

// User Management
import UserList from "@/views/users/UserList.vue";
import StaffList from "@/views/users/StaffList.vue";

// Borrowing Management
import BorrowList from "@/views/borrowing/BorrowList.vue";

// Reports
import Reports from "@/views/reports/Reports.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: {
      requiresAuth: false,
      title: "Đăng nhập",
    },
  },
  {
    path: "/",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: Dashboard,
        meta: {
          title: "Trang chủ",
          icon: "bi-house-door",
          sidebar: true,
        },
      },
      {
        path: "/books",
        name: "BookList",
        component: BookList,
        meta: {
          title: "Quản lý sách",
          icon: "bi-book",
          sidebar: true,
        },
      },
      {
        path: "/books/create",
        name: "BookCreate",
        component: BookCreate,
        meta: {
          title: "Thêm sách mới",
          parent: "BookList",
        },
      },
      {
        path: "/books/:id/edit",
        name: "BookEdit",
        component: BookEdit,
        meta: {
          title: "Chỉnh sửa sách",
          parent: "BookList",
        },
      },
      {
        path: "/books/:id",
        name: "BookDetail",
        component: BookDetail,
        meta: {
          title: "Chi tiết sách",
          parent: "BookList",
        },
      },
      {
        path: "/categories",
        name: "CategoryList",
        component: CategoryList,
        meta: {
          title: "Danh mục sách",
          icon: "bi-grid-3x3-gap",
          sidebar: true,
        },
      },
      {
        path: "/publishers",
        name: "PublisherList",
        component: PublisherList,
        meta: {
          title: "Nhà xuất bản",
          icon: "bi-building",
          sidebar: true,
        },
      },
      {
        path: "/users",
        name: "UserList",
        component: UserList,
        meta: {
          title: "Quản lý độc giả",
          icon: "bi-people",
          sidebar: true,
        },
      },
      {
        path: "/staff",
        name: "StaffList",
        component: StaffList,
        meta: {
          title: "Quản lý nhân viên",
          icon: "bi-person-badge",
          sidebar: true,
          requiresAdmin: true,
        },
      },
      {
        path: "/borrowing",
        name: "BorrowList",
        component: BorrowList,
        meta: {
          title: "Quản lý mượn sách",
          icon: "bi-arrow-left-right",
          sidebar: true,
        },
      },
      {
        path: "/reports",
        name: "Reports",
        component: Reports,
        meta: {
          title: "Báo cáo thống kê",
          icon: "bi-graph-up",
          sidebar: true,
        },
      },
    ],
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
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Admin Panel`;
  }

  // Check authentication
  if (to.meta.requiresAuth !== false) {
    if (!authStore.isAuthenticated) {
      next("/login");
      return;
    }

    // Check admin permission
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next("/"); // Redirect to dashboard
      return;
    }
  } else if (to.name === "Login" && authStore.isAuthenticated) {
    next("/"); // Redirect to dashboard if already logged in
    return;
  }

  next();
});

export default router;
