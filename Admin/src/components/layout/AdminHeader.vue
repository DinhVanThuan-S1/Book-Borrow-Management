<template>
  <header class="admin-header">
    <div class="header-left">
      <!-- Sidebar Toggle -->
      <button
        class="sidebar-toggle d-none d-md-block"
        @click="$emit('toggle-sidebar')"
      >
        <i class="bi bi-list"></i>
      </button>

      <button class="sidebar-toggle d-md-none" @click="$emit('show-sidebar')">
        <i class="bi bi-list"></i>
      </button>

      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none">
              <i class="bi bi-house-door me-1"></i>
              Trang chủ
            </router-link>
          </li>
          <li v-if="currentPageTitle" class="breadcrumb-item active">
            {{ currentPageTitle }}
          </li>
        </ol>
      </nav>
    </div>

    <div class="header-right">
      <!-- Symbolic Icons -->
      <div class="d-flex align-items-center">
        <!-- Bell Icon (symbolic) -->
        <button class="btn btn-link text-secondary">
          <i class="bi bi-bell" style="font-size: 1.1rem"></i>
        </button>
      </div>

      <!-- User Menu -->
      <div class="dropdown user-dropdown">
        <button class="dropdown-toggle" data-bs-toggle="dropdown">
          <div class="user-avatar">
            {{ authStore.userInitials }}
          </div>
          <span class="d-none d-md-inline">{{ authStore.userName }}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li>
            <router-link to="/profile" class="dropdown-item">
              <i class="bi bi-person me-2"></i>
              Thông tin cá nhân
            </router-link>
          </li>
          <!-- <li>
            <a class="dropdown-item" href="#" @click="changePassword">
              <i class="bi bi-key me-2"></i>
              Đổi mật khẩu
            </a>
          </li> -->
          <li><hr class="dropdown-divider" /></li>
          <li>
            <a class="dropdown-item text-danger" href="#" @click="logout">
              <i class="bi bi-box-arrow-right me-2"></i>
              Đăng xuất
            </a>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";

export default {
  name: "AdminHeader",
  emits: ["toggle-sidebar", "show-sidebar"],
  setup() {
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();
    const toast = useToast();

    const currentPageTitle = computed(() => {
      return route.meta.title || "";
    });

    const logout = async () => {
      const result = await Swal.fire({
        title: "Xác nhận đăng xuất",
        text: "Bạn có chắc chắn muốn đăng xuất?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Đăng xuất",
        cancelButtonText: "Hủy",
        allowOutsideClick: false,
        allowEscapeKey: true,
        focusConfirm: false,
        customClass: {
          container: "swal-container-logout",
        },
        didOpen: () => {
          // Đảm bảo modal không bị aria-hidden
          const swalContainer = document.querySelector(
            ".swal-container-logout"
          );
          if (swalContainer) {
            swalContainer.removeAttribute("aria-hidden");
          }
        },
      });

      if (result.isConfirmed) {
        try {
          await authStore.logout();
          router.push("/login");
          toast.success("Đăng xuất thành công");
        } catch (error) {
          console.error("Logout error:", error);
          router.push("/login");
        }
      }
    };

    const changePassword = async () => {
      const { value: formValues } = await Swal.fire({
        title: "Đổi mật khẩu",
        html: `
          <input id="currentPassword" type="password" class="swal2-input" placeholder="Mật khẩu hiện tại">
          <input id="newPassword" type="password" class="swal2-input" placeholder="Mật khẩu mới">
          <input id="confirmPassword" type="password" class="swal2-input" placeholder="Xác nhận mật khẩu mới">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "Đổi mật khẩu",
        cancelButtonText: "Hủy",
        allowOutsideClick: false,
        allowEscapeKey: true,
        customClass: {
          container: "swal-container-password",
        },
        didOpen: () => {
          // Đảm bảo modal không bị aria-hidden
          const swalContainer = document.querySelector(
            ".swal-container-password"
          );
          if (swalContainer) {
            swalContainer.removeAttribute("aria-hidden");
          }
          // Focus vào input đầu tiên
          const firstInput = document.getElementById("currentPassword");
          if (firstInput) {
            firstInput.focus();
          }
        },
        preConfirm: () => {
          const currentPassword =
            document.getElementById("currentPassword").value;
          const newPassword = document.getElementById("newPassword").value;
          const confirmPassword =
            document.getElementById("confirmPassword").value;

          if (!currentPassword || !newPassword || !confirmPassword) {
            Swal.showValidationMessage("Vui lòng điền đầy đủ thông tin");
            return false;
          }

          if (newPassword.length < 6) {
            Swal.showValidationMessage("Mật khẩu mới phải có ít nhất 6 ký tự");
            return false;
          }

          if (newPassword !== confirmPassword) {
            Swal.showValidationMessage("Mật khẩu xác nhận không khớp");
            return false;
          }

          return { currentPassword, newPassword };
        },
      });

      if (formValues) {
        try {
          await authStore.changePassword(formValues);
          toast.success("Đổi mật khẩu thành công");
        } catch (error) {
          console.error("Change password error:", error);
        }
      }
    };

    return {
      authStore,
      currentPageTitle,
      logout,
      changePassword,
    };
  },
};
</script>
