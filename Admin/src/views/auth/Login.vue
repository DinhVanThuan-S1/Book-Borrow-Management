<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <i class="bi bi-book text-primary" style="font-size: 3rem"></i>
        </div>
        <h3 class="login-title">Đăng nhập Admin</h3>
        <p class="login-subtitle">Hệ thống quản lý mượn sách</p>
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

        <div class="mb-3 form-check">
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

        <button
          type="submit"
          class="btn btn-primary w-100 login-btn"
          :disabled="isLoading"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          {{ isLoading ? "Đang đăng nhập..." : "Đăng nhập" }}
        </button>
      </form>

      <div class="login-footer">
        <div class="demo-accounts">
          <h6>Tài khoản demo:</h6>
          <div class="demo-account" @click="fillDemoAccount('admin')">
            <strong>Admin:</strong> admin@library.com / admin123
          </div>
          <div class="demo-account" @click="fillDemoAccount('staff')">
            <strong>Nhân viên:</strong> nhanvien@library.com / nhanvien123
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

export default {
  name: "Login",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const toast = useToast();

    const form = reactive({
      email: "",
      password: "",
      remember: false,
    });

    const errors = reactive({
      email: "",
      password: "",
    });

    const showPassword = ref(false);
    const isLoading = ref(false);

    const validateForm = () => {
      errors.email = "";
      errors.password = "";

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

      isLoading.value = true;

      try {
        await authStore.login({
          Email: form.email,
          Password: form.password,
        });

        router.push("/");
        toast.success("Đăng nhập thành công!");
      } catch (error) {
        console.error("Login error:", error);
      } finally {
        isLoading.value = false;
      }
    };

    const fillDemoAccount = (type) => {
      if (type === "admin") {
        form.email = "admin@library.com";
        form.password = "admin123";
      } else if (type === "staff") {
        form.email = "nhanvien@library.com";
        form.password = "nhanvien123";
      }
    };

    return {
      form,
      errors,
      showPassword,
      isLoading,
      handleLogin,
      fillDemoAccount,
    };
  },
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 420px;
  animation: fadeInUp 0.6s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  margin-bottom: 1rem;
}

.login-title {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #6c757d;
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
  border-color: #86b7fe;
  box-shadow: none;
}

.login-btn {
  padding: 0.75rem;
  font-weight: 500;
  border-radius: 0.5rem;
  background: linear-gradient(45deg, #007bff, #0056b3);
  border: none;
  transition: all 0.3s ease;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(45deg, #0056b3, #004085);
  transform: translateY(-1px);
}

.login-footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.demo-accounts h6 {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.demo-account {
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.demo-account:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
