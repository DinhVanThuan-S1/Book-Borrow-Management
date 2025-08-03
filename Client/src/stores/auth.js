import { defineStore } from "pinia";
import api from "@/services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("client_token"),
    isLoading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    userName: (state) => {
      if (state.user?.HoTenNV) {
        // For staff/admin (NhanVien)
        return state.user.HoTenNV;
      } else if (state.user?.HoLot && state.user?.Ten) {
        // For readers (DocGia) - combine HoLot and Ten
        return `${state.user.HoLot} ${state.user.Ten}`;
      }
      return "";
    },
    userEmail: (state) => state.user?.Email || "",
    userPhone: (state) => state.user?.DienThoai || "",
    userAddress: (state) => state.user?.DiaChi || "",
    userAvatar: (state) => state.user?.Avatar || "",
    userGender: (state) => state.user?.GioiTinh || "",
    userBirthDate: (state) => state.user?.NgaySinh || "",
    userInitials: (state) => {
      const fullName = state.user?.HoTenNV || 
                      (state.user?.HoLot && state.user?.Ten ? 
                       `${state.user.HoLot} ${state.user.Ten}` : "");
      if (!fullName) return "U";
      const names = fullName.split(" ");
      return names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0];
    },
  },

  actions: {
    async login(credentials) {
      this.isLoading = true;
      try {
        const response = await api.auth.login(credentials);

        // Check if response has the expected structure
        if (response.data && response.data.token) {
          this.token = response.data.token;
          // User data is in response.data (without the token)
          const { token, ...userData } = response.data;
          this.user = userData;

          // Save to localStorage safely
          localStorage.setItem("client_token", this.token);
          localStorage.setItem("client_user", JSON.stringify(this.user));
        } else {
          console.error("Unexpected response structure:", response);
          throw new Error("Invalid response format");
        }

        return response;
      } catch (error) {
        // Clear any partial data on error
        this.logout();
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async register(userData) {
      this.isLoading = true;
      try {
        const response = await api.auth.register(userData);

        // Check if response has the expected structure
        if (response.data && response.data.token) {
          this.token = response.data.token;
          // User data is in response.data (without the token)
          const { token, ...userInfo } = response.data;
          this.user = userInfo;

          // Save to localStorage safely
          localStorage.setItem("client_token", this.token);
          localStorage.setItem("client_user", JSON.stringify(this.user));
        } else {
          console.error("Unexpected response structure:", response);
          throw new Error("Invalid response format");
        }

        return response;
      } catch (error) {
        // Clear any partial data on error
        this.logout();
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUser() {
      try {
        const response = await api.auth.getProfile();
        if (response.data) {
          this.user = response.data;
          localStorage.setItem("client_user", JSON.stringify(this.user));
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
        this.logout();
      }
    },

    async updateProfile(userData) {
      try {
        const response = await api.auth.updateProfile(userData);
        if (response.data && this.user) {
          this.user = { ...this.user, ...response.data };
          localStorage.setItem("client_user", JSON.stringify(this.user));
        }
        return response;
      } catch (error) {
        throw error;
      }
    },

    async changePassword(passwords) {
      try {
        const response = await api.auth.changePassword(passwords);
        return response;
      } catch (error) {
        throw error;
      }
    },

    async uploadAvatar(formData) {
      try {
        const response = await api.auth.uploadAvatar(formData);
        this.user = { ...this.user, Avatar: response.data.Avatar };
        localStorage.setItem("client_user", JSON.stringify(this.user));
        return response;
      } catch (error) {
        throw error;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.clearStorage();
    },

    clearStorage() {
      localStorage.removeItem("client_token");
      localStorage.removeItem("client_user");
    },

    // Initialize store from localStorage
    initializeAuth() {
      if (this.initialized) return;
      
      const token = localStorage.getItem("client_token");
      const user = localStorage.getItem("client_user");

      if (token && user && user !== "undefined" && user !== "null") {
        this.token = token;
        try {
          this.user = JSON.parse(user);
        } catch (error) {
          console.error("Failed to parse user data:", error);
          // Clear invalid data
          this.clearStorage();
          this.logout();
        }
      } else {
        // Clear any invalid data
        if (token || user) {
          this.clearStorage();
        }
      }
      
      this.initialized = true;
    },
  },
});
