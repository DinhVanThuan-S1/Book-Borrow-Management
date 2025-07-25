<template>
  <div class="login-view">
    <div class="login-header">
      <h2 class="login-title">Đăng nhập</h2>
      <p class="login-subtitle">Chào mừng bạn quay trở lại!</p>
    </div>

    <form @submit.prevent="handleLogin" class="login-form">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-envelope"></i>
          </span>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': errors.email }"
            placeholder="Nhập email của bạn"
            required
            autocomplete="email"
          />
        </div>
        <div v-if="errors.email" class="invalid-feedback">
          {{ errors.email }}
        </div>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Mật khẩu</label>
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-lock"></i>
          </span>
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            :class="{ 'is-invalid': errors.password }"
            placeholder="Nhập mật khẩu"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
          </button>
        </div>
        <div v-if="errors.password" class="invalid-feedback">
          {{ errors.password }}
        </div>
      </div>

      <div class="mb-3 d-flex justify-content-between align-items-center">
        <div class="form-check">
          <input
            id="remember"
            v-model="form.remember"
            type="checkbox"
            class="form-check-input"
          />
          <label for="remember" class="form-check-label">
            Ghi nhớ đăng nhập
          </label>
        </div>
      </div>

      <button
        type="submit"
        class="btn btn-primary-gradient w-100 login-btn"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm me-2"
        ></span>
        <i v-else class="bi bi-box-arrow-in-right me-2"></i>
        {{ isLoading ? "Đang đăng nhập..." : "Đăng nhập" }}
      </button>
    </form>

    <!-- Auth links -->
    <div class="auth-links">
      <p class="text-center">
        Chưa có tài khoản?
        <router-link to="/auth/dang-ky" class="signup-link">
          Đăng ký ngay
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

export default {
  name: "Login",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const toast = useToast();

    const form = reactive({
      email: "",
      password: "",
      remember: false,
    });

    const errors = reactive({});
    const showPassword = ref(false);
    const isLoading = ref(false);

    const validateForm = () => {
      Object.keys(errors).forEach((key) => delete errors[key]);

      if (!form.email) {
        errors.email = "Email là bắt buộc";
        return false;
      }

      if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = "Email không hợp lệ";
        return false;
      }

      if (!form.password) {
        errors.password = "Mật khẩu là bắt buộc";
        return false;
      }

      if (form.password.length < 6) {
        errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
        return false;
      }

      return true;
    };

    const handleLogin = async () => {
      if (!validateForm()) return;
      
      // Prevent multiple simultaneous login attempts
      if (isLoading.value) return;

      isLoading.value = true;

      try {
        await authStore.login({
          Email: form.email,
          Password: form.password,
        });

        // Note: Success message is automatically shown by API interceptor
        // toast.success("Đăng nhập thành công!");

        // Redirect to intended page or home
        const redirectTo = route.query.redirect || "/";
        router.push(redirectTo);
      } catch (error) {
        console.error("Login error:", error);

        // Display error message to user
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          toast.error(error.response.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          toast.error("Đăng nhập thất bại. Vui lòng thử lại!");
        }
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      errors,
      showPassword,
      isLoading,
      handleLogin,
    };
  },
};
</script>

<style scoped>
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #6b7280;
  margin-bottom: 0;
}

.login-form .input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.login-form .form-control {
  border-left: none;
}

.login-form .form-control:focus {
  border-color: var(--primary-color);
  box-shadow: none;
}

.login-btn {
  padding: 0.75rem;
  font-weight: 600;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.auth-divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
}

.auth-divider::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
}

.auth-divider span {
  background: white;
  padding: 0 1rem;
  color: #9ca3af;
  font-size: 0.9rem;
}

.auth-links {
  margin-bottom: 0.5rem;
}

.signup-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.signup-link:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

.invalid-feedback {
  display: block;
}

@media (max-width: 576px) {
  .login-header {
    margin-bottom: 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }
}
</style>
