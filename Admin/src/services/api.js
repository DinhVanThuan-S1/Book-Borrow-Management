import axios from "axios";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  timeout: 10000,
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

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    // Remove automatic success toast to prevent duplicates
    // Components will handle their own success messages
    return response.data;
  },
  (error) => {
    const authStore = useAuthStore();
    const toast = useToast(); // Create toast instance here

    // Handle error responses
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          authStore.logout();
          window.location.href = "/login";
          toast.error("Phiên đăng nhập đã hết hạn");
          break;

        case 403:
          toast.error("Bạn không có quyền thực hiện thao tác này");
          break;

        case 404:
          toast.error("Không tìm thấy dữ liệu");
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

        case 500:
          toast.error("Lỗi server nội bộ");
          break;

        default:
          toast.error(data.message || "Có lỗi xảy ra");
      }
    } else if (error.request) {
      toast.error("Không thể kết nối đến server");
    } else {
      toast.error("Có lỗi xảy ra");
    }

    return Promise.reject(error);
  }
);

export default api;
