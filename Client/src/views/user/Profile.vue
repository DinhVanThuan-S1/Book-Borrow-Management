<template>
  <div class="user-profile">
    <div class="container py-4">
      <!-- Page Header -->
      <div class="page-header mb-4">
        <h1 class="page-title">
          <i class="bi bi-person-gear me-3"></i>
          Thông tin cá nhân
        </h1>
        <p class="page-subtitle">
          Quản lý thông tin tài khoản và cài đặt bảo mật
        </p>
      </div>

      <div class="row">
        <!-- Avatar & Basic Info -->
        <div class="col-lg-4 mb-4">
          <div class="profile-sidebar">
            <!-- Avatar Section -->
            <div class="avatar-section client-card mb-4">
              <div class="card-body text-center">
                <div class="profile-avatar mb-3">
                  <img
                    v-if="authStore.userAvatar"
                    :src="authStore.userAvatar"
                    :alt="authStore.userName"
                    class="avatar-img"
                  />
                  <div v-else class="avatar-placeholder">
                    {{ authStore.userInitials }}
                  </div>
                  <button
                    @click="$refs.avatarInput.click()"
                    class="avatar-upload-btn"
                    title="Thay đổi ảnh đại diện"
                    :disabled="uploadingAvatar"
                  >
                    <span
                      v-if="uploadingAvatar"
                      class="spinner-border spinner-border-sm"
                    ></span>
                    <i v-else class="bi bi-camera"></i>
                  </button>
                  <input
                    ref="avatarInput"
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleAvatarUpload"
                  />
                </div>

                <h5 class="mb-1">{{ authStore.userName }}</h5>
                <p class="text-muted mb-2">{{ user.Email }}</p>

                <div class="user-badges">
                  <span class="badge bg-primary">
                    <i class="bi bi-person me-1"></i>
                    Độc giả
                  </span>
                  <span v-if="user.MaDocGia" class="badge bg-info">
                    {{ user.MaDocGia }}
                  </span>
                </div>

                <div class="join-date mt-3">
                  <small class="text-muted">
                    <i class="bi bi-calendar me-1"></i>
                    Tham gia từ {{ formatDate(user.createdAt) }}
                  </small>
                </div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="stats-section client-card">
              <div class="card-body">
                <h6 class="card-title">
                  <i class="bi bi-graph-up me-2"></i>
                  Thống kê cá nhân
                </h6>

                <div class="stats-list">
                  <div class="stat-item">
                    <div class="stat-icon bg-primary">
                      <i class="bi bi-book"></i>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">
                        {{ userStats.borrowing || 0 }}
                      </div>
                      <div class="stat-label">Đang mượn</div>
                    </div>
                  </div>

                  <div class="stat-item">
                    <div class="stat-icon bg-success">
                      <i class="bi bi-check-circle"></i>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">
                        {{ userStats.returned || 0 }}
                      </div>
                      <div class="stat-label">Đã trả</div>
                    </div>
                  </div>

                  <div class="stat-item">
                    <div class="stat-icon bg-danger">
                      <i class="bi bi-heart-fill"></i>
                    </div>
                    <div class="stat-info">
                      <div class="stat-number">
                        {{ userStats.favorites || 0 }}
                      </div>
                      <div class="stat-label">Yêu thích</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Profile Form -->
          <div class="profile-form client-card mb-4">
            <div class="card-header-custom">
              <h5 class="mb-0">
                <i class="bi bi-pencil-square me-2"></i>
                Cập nhật thông tin
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="updateProfile" class="form-custom">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="hoLot" class="form-label">
                      Họ và tên đệm <span class="text-danger">*</span>
                    </label>
                    <input
                      id="hoLot"
                      v-model="profileForm.HoLot"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': profileErrors.HoLot }"
                      required
                    />
                    <div v-if="profileErrors.HoLot" class="invalid-feedback">
                      {{ profileErrors.HoLot }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="ten" class="form-label">
                      Tên <span class="text-danger">*</span>
                    </label>
                    <input
                      id="ten"
                      v-model="profileForm.Ten"
                      type="text"
                      class="form-control"
                      :class="{ 'is-invalid': profileErrors.Ten }"
                      required
                    />
                    <div v-if="profileErrors.Ten" class="invalid-feedback">
                      {{ profileErrors.Ten }}
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">
                      Email <span class="text-danger">*</span>
                    </label>
                    <input
                      id="email"
                      v-model="profileForm.Email"
                      type="email"
                      class="form-control"
                      :class="{ 'is-invalid': profileErrors.Email }"
                      required
                    />
                    <div v-if="profileErrors.Email" class="invalid-feedback">
                      {{ profileErrors.Email }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="dienThoai" class="form-label">
                      Số điện thoại <span class="text-danger">*</span>
                    </label>
                    <input
                      id="dienThoai"
                      v-model="profileForm.DienThoai"
                      type="tel"
                      class="form-control"
                      :class="{ 'is-invalid': profileErrors.DienThoai }"
                      required
                    />
                    <div
                      v-if="profileErrors.DienThoai"
                      class="invalid-feedback"
                    >
                      {{ profileErrors.DienThoai }}
                    </div>
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="ngaySinh" class="form-label">
                      Ngày sinh <span class="text-danger">*</span>
                    </label>
                    <input
                      id="ngaySinh"
                      v-model="profileForm.NgaySinh"
                      type="date"
                      class="form-control"
                      :class="{ 'is-invalid': profileErrors.NgaySinh }"
                      required
                    />
                    <div v-if="profileErrors.NgaySinh" class="invalid-feedback">
                      {{ profileErrors.NgaySinh }}
                    </div>
                  </div>

                  <div class="col-md-6 mb-3">
                    <label for="phai" class="form-label">
                      Giới tính <span class="text-danger">*</span>
                    </label>
                    <select
                      id="phai"
                      v-model="profileForm.Phai"
                      class="form-select"
                      :class="{ 'is-invalid': profileErrors.Phai }"
                      required
                    >
                      <option value="">Chọn giới tính</option>
                      <option value="Nam">Nam</option>
                      <option value="Nữ">Nữ</option>
                    </select>
                    <div v-if="profileErrors.Phai" class="invalid-feedback">
                      {{ profileErrors.Phai }}
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="diaChi" class="form-label">
                    Địa chỉ <span class="text-danger">*</span>
                  </label>
                  <textarea
                    id="diaChi"
                    v-model="profileForm.DiaChi"
                    class="form-control"
                    :class="{ 'is-invalid': profileErrors.DiaChi }"
                    rows="3"
                    required
                  ></textarea>
                  <div v-if="profileErrors.DiaChi" class="invalid-feedback">
                    {{ profileErrors.DiaChi }}
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button
                    type="submit"
                    class="btn btn-primary-gradient"
                    :disabled="updatingProfile"
                  >
                    <span
                      v-if="updatingProfile"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i v-else class="bi bi-check-circle me-2"></i>
                    {{
                      updatingProfile
                        ? "Đang cập nhật..."
                        : "Cập nhật thông tin"
                    }}
                  </button>

                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="resetProfileForm"
                  >
                    <i class="bi bi-arrow-clockwise me-2"></i>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Change Password -->
          <div class="password-form client-card">
            <div class="card-header-custom">
              <h5 class="mb-0">
                <i class="bi bi-shield-lock me-2"></i>
                Đổi mật khẩu
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="changePassword" class="form-custom">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <label for="currentPassword" class="form-label">
                      Mật khẩu hiện tại <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input
                        id="currentPassword"
                        v-model="passwordForm.currentPassword"
                        :type="showCurrentPassword ? 'text' : 'password'"
                        class="form-control"
                        :class="{
                          'is-invalid': passwordErrors.currentPassword,
                        }"
                        required
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="showCurrentPassword = !showCurrentPassword"
                      >
                        <i
                          :class="
                            showCurrentPassword
                              ? 'bi bi-eye-slash'
                              : 'bi bi-eye'
                          "
                        ></i>
                      </button>
                    </div>
                    <div
                      v-if="passwordErrors.currentPassword"
                      class="invalid-feedback"
                    >
                      {{ passwordErrors.currentPassword }}
                    </div>
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="newPassword" class="form-label">
                      Mật khẩu mới <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input
                        id="newPassword"
                        v-model="passwordForm.newPassword"
                        :type="showNewPassword ? 'text' : 'password'"
                        class="form-control"
                        :class="{ 'is-invalid': passwordErrors.newPassword }"
                        required
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="showNewPassword = !showNewPassword"
                      >
                        <i
                          :class="
                            showNewPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
                          "
                        ></i>
                      </button>
                    </div>
                    <div
                      v-if="passwordErrors.newPassword"
                      class="invalid-feedback"
                    >
                      {{ passwordErrors.newPassword }}
                    </div>
                  </div>

                  <div class="col-md-4 mb-3">
                    <label for="confirmPassword" class="form-label">
                      Xác nhận mật khẩu <span class="text-danger">*</span>
                    </label>
                    <div class="input-group">
                      <input
                        id="confirmPassword"
                        v-model="passwordForm.confirmPassword"
                        :type="showConfirmPassword ? 'text' : 'password'"
                        class="form-control"
                        :class="{
                          'is-invalid': passwordErrors.confirmPassword,
                        }"
                        required
                      />
                      <button
                        type="button"
                        class="btn btn-outline-secondary"
                        @click="showConfirmPassword = !showConfirmPassword"
                      >
                        <i
                          :class="
                            showConfirmPassword
                              ? 'bi bi-eye-slash'
                              : 'bi bi-eye'
                          "
                        ></i>
                      </button>
                    </div>
                    <div
                      v-if="passwordErrors.confirmPassword"
                      class="invalid-feedback"
                    >
                      {{ passwordErrors.confirmPassword }}
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2">
                  <button
                    type="submit"
                    class="btn btn-warning"
                    :disabled="changingPassword"
                  >
                    <span
                      v-if="changingPassword"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i v-else class="bi bi-key me-2"></i>
                    {{ changingPassword ? "Đang đổi..." : "Đổi mật khẩu" }}
                  </button>

                  <button
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="resetPasswordForm"
                  >
                    <i class="bi bi-arrow-clockwise me-2"></i>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "Profile",
  setup() {
    const authStore = useAuthStore();
    const toast = useToast();

    const user = computed(() => authStore.user || {});
    const userStats = ref({});

    const uploadingAvatar = ref(false);
    const updatingProfile = ref(false);
    const changingPassword = ref(false);

    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);

    const profileForm = reactive({
      HoLot: "",
      Ten: "",
      Email: "",
      DienThoai: "",
      NgaySinh: "",
      Phai: "",
      DiaChi: "",
    });

    const passwordForm = reactive({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    const profileErrors = reactive({});
    const passwordErrors = reactive({});

    // Methods
    const loadUserData = () => {
      if (user.value) {
        profileForm.HoLot = user.value.HoLot || "";
        profileForm.Ten = user.value.Ten || "";
        profileForm.Email = user.value.Email || "";
        profileForm.DienThoai = user.value.DienThoai || "";
        profileForm.NgaySinh = user.value.NgaySinh
          ? new Date(user.value.NgaySinh).toISOString().split("T")[0]
          : "";
        profileForm.Phai = user.value.Phai || "";
        profileForm.DiaChi = user.value.DiaChi || "";
      }
    };

    const fetchUserStats = async () => {
      try {
        const response = await api.stats.getUserStats();
        if (response.success) {
          userStats.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    };

    const validateProfileForm = () => {
      Object.keys(profileErrors).forEach((key) => delete profileErrors[key]);

      if (!profileForm.HoLot.trim()) {
        profileErrors.HoLot = "Họ và tên đệm là bắt buộc";
      }

      if (!profileForm.Ten.trim()) {
        profileErrors.Ten = "Tên là bắt buộc";
      }

      if (!profileForm.Email.trim()) {
        profileErrors.Email = "Email là bắt buộc";
      } else if (!/\S+@\S+\.\S+/.test(profileForm.Email)) {
        profileErrors.Email = "Email không hợp lệ";
      }

      if (!profileForm.DienThoai.trim()) {
        profileErrors.DienThoai = "Số điện thoại là bắt buộc";
      } else if (
        !/^[0-9]{10,11}$/.test(profileForm.DienThoai.replace(/\s/g, ""))
      ) {
        profileErrors.DienThoai = "Số điện thoại không hợp lệ";
      }

      if (!profileForm.NgaySinh) {
        profileErrors.NgaySinh = "Ngày sinh là bắt buộc";
      }

      if (!profileForm.Phai) {
        profileErrors.Phai = "Giới tính là bắt buộc";
      }

      if (!profileForm.DiaChi.trim()) {
        profileErrors.DiaChi = "Địa chỉ là bắt buộc";
      }

      return Object.keys(profileErrors).length === 0;
    };

    const validatePasswordForm = () => {
      Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);

      if (!passwordForm.currentPassword) {
        passwordErrors.currentPassword = "Mật khẩu hiện tại là bắt buộc";
      }

      if (!passwordForm.newPassword) {
        passwordErrors.newPassword = "Mật khẩu mới là bắt buộc";
      } else if (passwordForm.newPassword.length < 6) {
        passwordErrors.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
      }

      if (!passwordForm.confirmPassword) {
        passwordErrors.confirmPassword = "Xác nhận mật khẩu là bắt buộc";
      } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        passwordErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }

      return Object.keys(passwordErrors).length === 0;
    };

    const updateProfile = async () => {
      if (!validateProfileForm()) return;

      updatingProfile.value = true;

      try {
        await authStore.updateProfile(profileForm);
        toast.success("Cập nhật thông tin thành công");
      } catch (error) {
        console.error("Error updating profile:", error);
      } finally {
        updatingProfile.value = false;
      }
    };

    const changePassword = async () => {
      if (!validatePasswordForm()) return;

      changingPassword.value = true;

      try {
        await authStore.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });

        toast.success("Đổi mật khẩu thành công");
        resetPasswordForm();
      } catch (error) {
        console.error("Error changing password:", error);
      } finally {
        changingPassword.value = false;
      }
    };

    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        toast.error("File ảnh không được vượt quá 5MB");
        return;
      }

      uploadingAvatar.value = true;

      try {
        const formData = new FormData();
        formData.append("avatar", file);

        await authStore.uploadAvatar(formData);
        toast.success("Cập nhật ảnh đại diện thành công");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Có lỗi khi tải ảnh lên");
      } finally {
        uploadingAvatar.value = false;
      }
    };

    const resetProfileForm = () => {
      loadUserData();
      Object.keys(profileErrors).forEach((key) => delete profileErrors[key]);
    };

    const resetPasswordForm = () => {
      passwordForm.currentPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
      Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);
    };

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    // Lifecycle
    onMounted(() => {
      loadUserData();
      fetchUserStats();
    });

    return {
      authStore,
      user,
      userStats,
      uploadingAvatar,
      updatingProfile,
      changingPassword,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      profileForm,
      passwordForm,
      profileErrors,
      passwordErrors,
      updateProfile,
      changePassword,
      handleAvatarUpload,
      resetProfileForm,
      resetPasswordForm,
      formatDate,
    };
  },
};
</script>

<style scoped>
.profile-avatar {
  position: relative;
  display: inline-block;
}

.avatar-img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #e9ecef;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  border: 4px solid #e9ecef;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-upload-btn:hover:not(:disabled) {
  background: var(--secondary-color);
  transform: scale(1.1);
}

.user-badges {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}

.stat-number {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dark-color);
}

.stat-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.card-header-custom {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.invalid-feedback {
  display: block;
}

@media (max-width: 768px) {
  .avatar-img,
  .avatar-placeholder {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }

  .avatar-upload-btn {
    width: 35px;
    height: 35px;
  }

  .stats-list {
    gap: 0.75rem;
  }

  .stat-icon {
    width: 35px;
    height: 35px;
  }
}
</style>
