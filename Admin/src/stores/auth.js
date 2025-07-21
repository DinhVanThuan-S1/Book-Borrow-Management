import { defineStore } from "pinia";
import api from "@/services/api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("admin_token"),
    isLoading: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isAdmin: (state) => state.user?.ChucVu === "Admin",
    userName: (state) => state.user?.HoTenNV || "",
    userInitials: (state) => {
      if (!state.user?.HoTenNV) return "A";
      const names = state.user.HoTenNV.split(" ");
      return names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0];
    },
  },

  actions: {
    async login(credentials) {
      this.isLoading = true;
      try {
        const response = await api.post("/auth/login/nhanvien", credentials);

        this.token = response.data.token;
        this.user = response.data;

        // Save to localStorage
        localStorage.setItem("admin_token", this.token);
        localStorage.setItem("admin_user", JSON.stringify(this.user));

        return response;
      } catch (error) {
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUser() {
      try {
        const response = await api.get("/auth/me");
        this.user = response.data;
        localStorage.setItem("admin_user", JSON.stringify(this.user));
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async logout() {
      try {
        await api.post("/auth/logout");
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        this.user = null;
        this.token = null;
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
      }
    },

    async changePassword(passwordData) {
      try {
        const response = await api.put("/auth/change-password", passwordData);
        return response;
      } catch (error) {
        throw error;
      }
    },

    initializeAuth() {
      const token = localStorage.getItem("admin_token");
      const user = localStorage.getItem("admin_user");

      if (token && user) {
        this.token = token;
        this.user = JSON.parse(user);
      }
    },
  },
});
