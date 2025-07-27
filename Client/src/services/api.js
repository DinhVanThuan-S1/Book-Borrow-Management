import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

const toast = useToast();

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();

    // Add auth token to requests
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }

    // Add loading indicator class to body
    document.body.classList.add("loading");

    return config;
  },
  (error) => {
    document.body.classList.remove("loading");
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Remove loading indicator
    document.body.classList.remove("loading");

    // Handle successful responses with success messages
    if (
      response.data.message &&
      !["get", "head", "options"].includes(
        response.config.method?.toLowerCase()
      )
    ) {
      toast.success(response.data.message);
    }

    return response.data;
  },
  async (error) => {
    // Remove loading indicator
    document.body.classList.remove("loading");

    const authStore = useAuthStore();

    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          if (authStore.token) {
            authStore.logout();
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            // Redirect to login with current path
            const currentPath = window.location.pathname;
            if (!["/auth/dang-nhap", "/auth/dang-ky"].includes(currentPath)) {
              window.location.href = `/auth/dang-nhap?redirect=${encodeURIComponent(
                currentPath
              )}`;
            }
          }
          break;

        case 403:
          toast.error("Bạn không có quyền thực hiện thao tác này");
          break;

        case 404:
          if (error.config.url?.includes("/sach/")) {
            toast.error("Không tìm thấy sách này");
          } else {
            toast.error("Không tìm thấy dữ liệu");
          }
          break;

        case 422:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((err) => {
              toast.error(`${err.field}: ${err.message}`);
            });
          } else {
            toast.error(data.message || "Dữ liệu không hợp lệ");
          }
          break;

        case 429:
          toast.warning(
            "Bạn đang thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau."
          );
          break;

        case 500:
          toast.error("Lỗi hệ thống. Vui lòng thử lại sau.");
          break;

        default:
          toast.error(data.message || "Có lỗi xảy ra");
      }
    } else if (error.request) {
      toast.error("Không thể kết nối đến server. Kiểm tra kết nối mạng.");
    } else {
      toast.error("Có lỗi xảy ra");
    }

    return Promise.reject(error);
  }
);

// API methods
export default {
  // Auth APIs
  auth: {
    login: (credentials) => api.post("/auth/login/docgia", credentials),
    register: (userData) => api.post("/auth/register/docgia", userData),
    logout: () => api.post("/auth/logout"),
    refreshToken: () => api.post("/auth/refresh"),
    getProfile: () => api.get("/auth/me"),
    updateProfile: (data) => api.put("/docgia/profile", data),
    changePassword: (passwords) => api.put("/auth/change-password", passwords),
    uploadAvatar: (formData) =>
      api.post("/docgia/upload-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      }),
  },

  // Books APIs
  books: {
    getAll: (params) => api.get("/sach", { params }),
    getPublic: (params) => api.get("/sach", { params }),
    getById: (id) => api.get(`/sach/${id}`),
    getPopular: (limit = 12) =>
      api.get("/sach/popular/top", { params: { limit } }),
    search: (query, params) =>
      api.get("/sach", { params: { search: query, ...params } }),
    getByCategory: (categoryId, params) =>
      api.get("/sach", { params: { MaDanhMuc: categoryId, ...params } }),
  },

  // Categories APIs
  categories: {
    getAll: () => api.get("/danhmuc/all"),
    getWithStats: () => api.get("/danhmuc/stats"),
    getById: (id) => api.get(`/danhmuc/${id}`),
  },

  // Publishers APIs
  publishers: {
    getAll: () => api.get("/nhaxuatban/all"),
    getById: (id) => api.get(`/nhaxuatban/${id}`),
  },

  // Borrowing APIs
  borrowing: {
    requestBorrow: (bookId) =>
      api.post("/muonsach/register", { MaSach: bookId }),
    getMyBorrows: (params) => api.get("/muonsach/my-borrows", { params }),
    getBorrowHistory: (params) => api.get("/muonsach/my-history", { params }),
    cancelRequest: (borrowId) => api.delete(`/muonsach/cancel/${borrowId}`),
  },

  // Favorites APIs
  favorites: {
    getMyFavorites: (params) => api.get("/yeuthich/my-favorites", { params }),
    add: (bookId) => api.post("/yeuthich", { MaSach: bookId }),
    remove: (bookId) => api.delete(`/yeuthich/${bookId}`),
    check: (bookId) => api.get(`/yeuthich/check/${bookId}`),
    sync: (bookIds) => api.post("/yeuthich/sync", { books: bookIds }),
  },

  // Stats APIs
  stats: {
    getOverview: () => api.get("/thongke/overview"),
    getUserStats: () => api.get("/docgia/my-stats"),
    getDashboard: () => api.get("/thongke/dashboard"),
  },
};

// Export for use in components
export { api };
