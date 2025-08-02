<template>
  <div class="register-view">
    <div class="register-header">
      <h2 class="register-title">Đăng ký tài khoản</h2>
      <p class="register-subtitle">
        Tạo tài khoản để trải nghiệm đầy đủ dịch vụ
      </p>
    </div>

    <form @submit.prevent="handleRegister" class="register-form">
      <!-- Personal Information -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="bi bi-person me-2"></i>
          Thông tin cá nhân
        </h6>

        <div class="row">
          <div class="col-md-7 mb-3">
            <label for="hoLot" class="form-label">Họ và tên đệm</label>
            <input
              id="hoLot"
              v-model="form.HoLot"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.HoLot }"
              placeholder="Nguyễn Văn"
              required
            />
            <div v-if="errors.HoLot" class="invalid-feedback">
              {{ errors.HoLot }}
            </div>
          </div>

          <div class="col-md-5 mb-3">
            <label for="ten" class="form-label">Tên</label>
            <input
              id="ten"
              v-model="form.Ten"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': errors.Ten }"
              placeholder="An"
              required
            />
            <div v-if="errors.Ten" class="invalid-feedback">
              {{ errors.Ten }}
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-7 mb-3">
            <label for="ngaySinh" class="form-label">Ngày sinh</label>
            <input
              id="ngaySinh"
              v-model="form.NgaySinh"
              type="date"
              class="form-control"
              :class="{ 'is-invalid': errors.NgaySinh }"
              :max="maxDate"
              required
            />
            <div v-if="errors.NgaySinh" class="invalid-feedback">
              {{ errors.NgaySinh }}
            </div>
          </div>

          <div class="col-md-5 mb-3">
            <label for="phai" class="form-label">Giới tính</label>
            <select
              id="phai"
              v-model="form.Phai"
              class="form-select"
              :class="{ 'is-invalid': errors.Phai }"
              required
            >
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
            <div v-if="errors.Phai" class="invalid-feedback">
              {{ errors.Phai }}
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Information -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="bi bi-telephone me-2"></i>
          Thông tin liên hệ
        </h6>

        <div class="mb-3">
          <label for="email" class="form-label">Email</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-envelope"></i>
            </span>
            <input
              id="email"
              v-model="form.Email"
              type="email"
              class="form-control"
              :class="{ 'is-invalid': errors.Email }"
              placeholder="example@email.com"
              required
              autocomplete="email"
            />
          </div>
          <div v-if="errors.Email" class="invalid-feedback">
            {{ errors.Email }}
          </div>
        </div>

        <div class="mb-3">
          <label for="dienThoai" class="form-label">Số điện thoại</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-phone"></i>
            </span>
            <input
              id="dienThoai"
              v-model="form.DienThoai"
              type="tel"
              class="form-control"
              :class="{ 'is-invalid': errors.DienThoai }"
              placeholder="0123456789"
              required
            />
          </div>
          <div v-if="errors.DienThoai" class="invalid-feedback">
            {{ errors.DienThoai }}
          </div>
        </div>

        <div class="mb-2">
          <label for="diaChi" class="form-label">Địa chỉ</label>
          <textarea
            id="diaChi"
            v-model="form.DiaChi"
            class="form-control"
            :class="{ 'is-invalid': errors.DiaChi }"
            rows="3"
            placeholder="Số nhà, đường, phường, quận, thành phố..."
            required
          ></textarea>
          <div v-if="errors.DiaChi" class="invalid-feedback">
            {{ errors.DiaChi }}
          </div>
        </div>
      </div>

      <!-- Account Security -->
      <div class="form-section">
        <h6 class="section-title">
          <i class="bi bi-shield-lock me-2"></i>
          Bảo mật tài khoản
        </h6>

        <div class="mb-3">
          <label for="password" class="form-label">Mật khẩu</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-lock"></i>
            </span>
            <input
              id="password"
              v-model="form.Password"
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': errors.Password }"
              placeholder="Nhập mật khẩu"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
          <div v-if="errors.Password" class="invalid-feedback">
            {{ errors.Password }}
          </div>
        </div>

        <div class="mb-3">
          <label for="confirmPassword" class="form-label"
            >Xác nhận mật khẩu</label
          >
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-lock-fill"></i>
            </span>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-control"
              :class="{ 'is-invalid': errors.confirmPassword }"
              placeholder="Nhập lại mật khẩu"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i
                :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"
              ></i>
            </button>
          </div>
          <div v-if="errors.confirmPassword" class="invalid-feedback">
            {{ errors.confirmPassword }}
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="mb-3">
        <div class="form-check">
          <input
            id="agreeTerms"
            v-model="form.agreeTerms"
            type="checkbox"
            class="form-check-input"
            :class="{ 'is-invalid': errors.agreeTerms }"
            required
          />
          <label for="agreeTerms" class="form-check-label">
            Tôi đồng ý với điều khoản sử dụng
          </label>
        </div>
        <div v-if="errors.agreeTerms" class="invalid-feedback">
          {{ errors.agreeTerms }}
        </div>
      </div>

      <button
        type="submit"
        class="btn btn-primary-gradient w-100 register-btn"
        :disabled="isLoading"
      >
        <span
          v-if="isLoading"
          class="spinner-border spinner-border-sm me-2"
        ></span>
        <i v-else class="bi bi-person-plus me-2"></i>
        {{ isLoading ? "Đang đăng ký..." : "Đăng ký tài khoản" }}
      </button>
    </form>
    <div class="auth-links">
      <p class="text-center">
        Đã có tài khoản?
        <router-link to="/auth/dang-nhap" class="login-link">
          Đăng nhập ngay
        </router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";

export default {
  name: "Register",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const toast = useToast();

    const form = reactive({
      HoLot: "",
      Ten: "",
      NgaySinh: "",
      Phai: "",
      Email: "",
      DienThoai: "",
      DiaChi: "",
      Password: "",
      confirmPassword: "",
      agreeTerms: false,
    });

    const errors = reactive({});
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);
    const isLoading = ref(false);

    // Computed
    const maxDate = computed(() => {
      const today = new Date();
      const minAge = new Date(
        today.getFullYear() - 16,
        today.getMonth(),
        today.getDate()
      );
      return minAge.toISOString().split("T")[0];
    });

    // Methods
    const validateForm = () => {
      Object.keys(errors).forEach((key) => delete errors[key]);

      // Personal info validation
      if (!form.HoLot.trim()) {
        errors.HoLot = "Họ và tên đệm là bắt buộc";
      }

      if (!form.Ten.trim()) {
        errors.Ten = "Tên là bắt buộc";
      }

      if (!form.NgaySinh) {
        errors.NgaySinh = "Ngày sinh là bắt buộc";
      } else {
        const birthDate = new Date(form.NgaySinh);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 16) {
          errors.NgaySinh = "Bạn phải từ 16 tuổi trở lên";
        }
      }

      if (!form.Phai) {
        errors.Phai = "Vui lòng chọn giới tính";
      }

      // Contact info validation
      if (!form.Email.trim()) {
        errors.Email = "Email là bắt buộc";
      } else if (!/\S+@\S+\.\S+/.test(form.Email)) {
        errors.Email = "Email không hợp lệ";
      }

      if (!form.DienThoai.trim()) {
        errors.DienThoai = "Số điện thoại là bắt buộc";
      } else if (!/^[0-9]{10,11}$/.test(form.DienThoai.replace(/\s/g, ""))) {
        errors.DienThoai = "Số điện thoại phải có 10-11 chữ số";
      }

      if (!form.DiaChi.trim()) {
        errors.DiaChi = "Địa chỉ là bắt buộc";
      } else if (form.DiaChi.trim().length < 10) {
        errors.DiaChi = "Địa chỉ phải có ít nhất 10 ký tự";
      }

      // Password validation
      if (!form.Password) {
        errors.Password = "Mật khẩu là bắt buộc";
      } else if (form.Password.length < 6) {
        errors.Password = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      if (!form.confirmPassword) {
        errors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
      } else if (form.Password !== form.confirmPassword) {
        errors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }

      // Terms validation
      if (!form.agreeTerms) {
        errors.agreeTerms = "Bạn phải đồng ý với điều khoản sử dụng";
      }

      return Object.keys(errors).length === 0;
    };

    const handleRegister = async () => {
      if (!validateForm()) return;

      isLoading.value = true;

      try {
        // Prepare registration data
        const registrationData = {
          HoLot: form.HoLot.trim(),
          Ten: form.Ten.trim(),
          NgaySinh: form.NgaySinh,
          Phai: form.Phai,
          Email: form.Email.trim(),
          DienThoai: form.DienThoai.trim(),
          DiaChi: form.DiaChi.trim(),
          Password: form.Password,
        };

        await authStore.register(registrationData);

        // Note: Success message is automatically shown by API interceptor
        // toast.success(
        //   "Đăng ký tài khoản thành công! Chào mừng bạn đến với thư viện!"
        // );

        // Redirect to login page after successful registration
        router.push("/auth/dang-nhap");
      } catch (error) {
        console.error("Registration error:", error);
      } finally {
        isLoading.value = false;
      }
    };

    return {
      form,
      errors,
      showPassword,
      showConfirmPassword,
      isLoading,
      maxDate,
      handleRegister,
    };
  },
};
</script>

<style scoped>
.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--dark-color);
  margin-bottom: 0.5rem;
}

.register-subtitle {
  color: #6b7280;
  margin-bottom: 0;
}

.form-section {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid var(--primary-color);
}

.section-title {
  color: var(--dark-color);
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.register-form .input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.register-form .form-control {
  transition: all 0.3s ease;
}

.register-form .form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(99, 102, 241, 0.25);
}

.register-btn {
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

.login-link {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

.invalid-feedback {
  display: block;
}

@media (max-width: 576px) {
  .register-header {
    margin-bottom: 1.5rem;
  }

  .register-title {
    font-size: 1.5rem;
  }

  .form-section {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .section-title {
    font-size: 0.9rem;
  }
}
</style>
