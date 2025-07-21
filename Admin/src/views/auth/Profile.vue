<template>
  <div class="profile fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Thông tin cá nhân</h1>
          <p class="page-subtitle">Quản lý thông tin tài khoản và cài đặt</p>
        </div>
        <div class="d-flex gap-2">
          <button @click="refreshData" class="btn btn-outline-primary">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Làm mới
          </button>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Profile Info Card -->
      <div class="col-lg-4 mb-4">
        <!-- Avatar & Basic Info -->
        <div class="admin-card mb-4">
          <div class="card-body text-center">
            <div class="profile-avatar mb-3">
              <img
                v-if="user.Avatar"
                :src="getAvatarUrl(user.Avatar)"
                :alt="user.HoTenNV"
                class="avatar-img"
              />
              <div v-else class="avatar-placeholder">
                {{ getUserInitials() }}
              </div>
              <button
                @click="$refs.avatarInput.click()"
                class="avatar-upload-btn"
                title="Thay đổi ảnh đại diện"
                :disabled="isUploadingAvatar"
              >
                <span
                  v-if="isUploadingAvatar"
                  class="spinner-border spinner-border-sm"
                ></span>
                <i v-else class="bi bi-camera"></i>
              </button>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleAvatarChange"
              />
            </div>

            <h5 class="mb-1">{{ user.HoTenNV || "Chưa cập nhật" }}</h5>
            <p class="text-muted mb-2">{{ user.Email || "Chưa có email" }}</p>
            <span class="badge" :class="getRoleBadgeClass(user.ChucVu)">
              <i :class="getRoleIcon(user.ChucVu)" class="me-1"></i>
              {{ user.ChucVu || "Chưa xác định" }}
            </span>

            <div class="mt-3 pt-3 border-top">
              <div class="row text-center">
                <div class="col-6">
                  <div class="fw-bold text-primary">
                    {{ user.MSNV || "N/A" }}
                  </div>
                  <small class="text-muted">Mã nhân viên</small>
                </div>
                <div class="col-6">
                  <div class="fw-bold text-success">
                    {{ formatDate(user.createdAt) }}
                  </div>
                  <small class="text-muted">Ngày tham gia</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="admin-card mb-4">
          <div class="card-header-custom">
            <h6 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>
              Thống kê hoạt động
            </h6>
          </div>
          <div class="card-body">
            <div v-if="isLoadingStats" class="text-center p-3">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <div class="mt-2 small">Đang tải...</div>
            </div>
            <div v-else>
              <div class="stats-item mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span>
                    <i class="bi bi-book me-2 text-primary"></i>
                    Sách đã tạo
                  </span>
                  <span class="badge bg-primary">{{
                    stats.booksCreated || 0
                  }}</span>
                </div>
              </div>

              <div class="stats-item mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span>
                    <i class="bi bi-grid-3x3-gap me-2 text-success"></i>
                    Danh mục đã tạo
                  </span>
                  <span class="badge bg-success">{{
                    stats.categoriesCreated || 0
                  }}</span>
                </div>
              </div>

              <div class="stats-item mb-3">
                <div class="d-flex justify-content-between align-items-center">
                  <span>
                    <i class="bi bi-arrow-left-right me-2 text-warning"></i>
                    Phiếu mượn đã xử lý
                  </span>
                  <span class="badge bg-warning">{{
                    stats.borrowsProcessed || 0
                  }}</span>
                </div>
              </div>

              <div class="stats-item">
                <div class="d-flex justify-content-between align-items-center">
                  <span>
                    <i class="bi bi-calendar-check me-2 text-info"></i>
                    Ngày hoạt động gần nhất
                  </span>
                  <small class="text-muted">{{
                    formatDate(stats.lastActivity) || "Chưa có"
                  }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Timeline -->
        <div class="admin-card">
          <div class="card-header-custom">
            <h6 class="mb-0">
              <i class="bi bi-clock-history me-2"></i>
              Hoạt động gần đây
            </h6>
          </div>
          <div class="card-body">
            <div
              v-if="recentActivities.length === 0"
              class="text-center text-muted"
            >
              <i class="bi bi-inbox display-6 d-block mb-2"></i>
              <small>Chưa có hoạt động nào</small>
            </div>
            <div v-else class="timeline">
              <div
                v-for="activity in recentActivities"
                :key="activity._id"
                class="timeline-item"
              >
                <div
                  class="timeline-marker"
                  :class="getActivityMarkerClass(activity.type)"
                >
                  <i :class="getActivityIcon(activity.type)"></i>
                </div>
                <div class="timeline-content">
                  <div class="timeline-title">{{ activity.title }}</div>
                  <div class="timeline-description">
                    {{ activity.description }}
                  </div>
                  <div class="timeline-time">
                    {{ formatRelativeTime(activity.createdAt) }}
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
        <div class="admin-card mb-4">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-person-gear me-2"></i>
              Cập nhật thông tin cá nhân
            </h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile" class="form-custom">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="hoTenNV" class="form-label">
                    Họ và tên <span class="text-danger">*</span>
                  </label>
                  <input
                    id="hoTenNV"
                    v-model="form.HoTenNV"
                    type="text"
                    class="form-control"
                    :class="{ 'is-invalid': errors.HoTenNV }"
                    placeholder="Nhập họ và tên"
                    required
                  />
                  <div v-if="errors.HoTenNV" class="invalid-feedback">
                    {{ errors.HoTenNV }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label">
                    Email <span class="text-danger">*</span>
                  </label>
                  <input
                    id="email"
                    v-model="form.Email"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.Email }"
                    placeholder="email@example.com"
                    required
                  />
                  <div v-if="errors.Email" class="invalid-feedback">
                    {{ errors.Email }}
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="soDienThoai" class="form-label">
                    Số điện thoại <span class="text-danger">*</span>
                  </label>
                  <input
                    id="soDienThoai"
                    v-model="form.SoDienThoai"
                    type="tel"
                    class="form-control"
                    :class="{ 'is-invalid': errors.SoDienThoai }"
                    placeholder="0123456789"
                    required
                  />
                  <div v-if="errors.SoDienThoai" class="invalid-feedback">
                    {{ errors.SoDienThoai }}
                  </div>
                </div>

                <div class="col-md-6 mb-3">
                  <label for="chucVu" class="form-label">Chức vụ</label>
                  <input
                    id="chucVu"
                    v-model="user.ChucVu"
                    type="text"
                    class="form-control"
                    readonly
                    disabled
                  />
                  <div class="form-text">
                    <i class="bi bi-info-circle me-1"></i>
                    Chức vụ chỉ có thể thay đổi bởi Admin
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="diaChi" class="form-label">
                  Địa chỉ <span class="text-danger">*</span>
                </label>
                <textarea
                  id="diaChi"
                  v-model="form.DiaChi"
                  class="form-control"
                  :class="{ 'is-invalid': errors.DiaChi }"
                  rows="3"
                  placeholder="Nhập địa chỉ của bạn"
                  required
                ></textarea>
                <div v-if="errors.DiaChi" class="invalid-feedback">
                  {{ errors.DiaChi }}
                </div>
              </div>

              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isUpdating"
                >
                  <span
                    v-if="isUpdating"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  <i v-else class="bi bi-check-circle me-2"></i>
                  {{ isUpdating ? "Đang cập nhật..." : "Cập nhật thông tin" }}
                </button>

                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="resetForm"
                >
                  <i class="bi bi-arrow-clockwise me-2"></i>
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Change Password -->
        <div class="admin-card mb-4">
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
                      :class="{ 'is-invalid': passwordErrors.currentPassword }"
                      placeholder="Nhập mật khẩu hiện tại"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showCurrentPassword = !showCurrentPassword"
                    >
                      <i
                        :class="
                          showCurrentPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
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
                      placeholder="Nhập mật khẩu mới"
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
                  <div class="form-text">
                    <i class="bi bi-info-circle me-1"></i>
                    Mật khẩu phải có ít nhất 6 ký tự
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
                      :class="{ 'is-invalid': passwordErrors.confirmPassword }"
                      placeholder="Nhập lại mật khẩu mới"
                      required
                    />
                    <button
                      type="button"
                      class="btn btn-outline-secondary"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <i
                        :class="
                          showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'
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

              <!-- Password Strength Indicator -->
              <div v-if="passwordForm.newPassword" class="mb-3">
                <label class="form-label small">Độ mạnh mật khẩu:</label>
                <div class="progress" style="height: 8px">
                  <div
                    class="progress-bar"
                    :class="getPasswordStrengthClass()"
                    :style="{ width: getPasswordStrengthWidth() + '%' }"
                  ></div>
                </div>
                <small class="text-muted">{{
                  getPasswordStrengthText()
                }}</small>
              </div>

              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-warning"
                  :disabled="isChangingPassword"
                >
                  <span
                    v-if="isChangingPassword"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  <i v-else class="bi bi-key me-2"></i>
                  {{ isChangingPassword ? "Đang đổi..." : "Đổi mật khẩu" }}
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

        <!-- Security Settings -->
        <div class="admin-card">
          <div class="card-header-custom">
            <h5 class="mb-0">
              <i class="bi bi-shield-check me-2"></i>
              Cài đặt bảo mật
            </h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="security-item mb-3">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 class="mb-1">Đăng nhập gần đây</h6>
                      <small class="text-muted">{{
                        formatDateTime(user.lastLogin) || "Chưa có thông tin"
                      }}</small>
                    </div>
                    <i class="bi bi-clock-history text-info"></i>
                  </div>
                </div>

                <div class="security-item mb-3">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 class="mb-1">Đổi mật khẩu lần cuối</h6>
                      <small class="text-muted">{{
                        formatDateTime(user.lastPasswordChange) ||
                        "Chưa từng đổi"
                      }}</small>
                    </div>
                    <i class="bi bi-key text-warning"></i>
                  </div>
                </div>
              </div>

              <div class="col-md-6">
                <div class="security-item mb-3">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 class="mb-1">Trạng thái tài khoản</h6>
                      <small class="text-success">
                        <i class="bi bi-check-circle me-1"></i>
                        Hoạt động
                      </small>
                    </div>
                    <i class="bi bi-person-check text-success"></i>
                  </div>
                </div>

                <div class="security-item">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 class="mb-1">Phiên đăng nhập</h6>
                      <small class="text-muted"
                        >1 thiết bị đang hoạt động</small
                      >
                    </div>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="logoutAllSessions"
                    >
                      <i class="bi bi-power me-1"></i>
                      Đăng xuất tất cả
                    </button>
                  </div>
                </div>
              </div>
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
import Swal from "sweetalert2";
import api from "@/services/api";

export default {
  name: "Profile",
  setup() {
    const authStore = useAuthStore();
    const toast = useToast();

    const user = computed(() => authStore.user || {});
    const stats = ref({});
    const recentActivities = ref([]);
    const isUpdating = ref(false);
    const isChangingPassword = ref(false);
    const isUploadingAvatar = ref(false);
    const isLoadingStats = ref(false);

    const form = reactive({
      HoTenNV: "",
      Email: "",
      SoDienThoai: "",
      DiaChi: "",
    });

    const passwordForm = reactive({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    const errors = reactive({});
    const passwordErrors = reactive({});

    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);

    // Methods
    const loadUserData = () => {
      if (user.value) {
        form.HoTenNV = user.value.HoTenNV || "";
        form.Email = user.value.Email || "";
        form.SoDienThoai = user.value.SoDienThoai || "";
        form.DiaChi = user.value.DiaChi || "";
      }
    };

    const fetchStats = async () => {
      try {
        isLoadingStats.value = true;
        const response = await api.get("/nhanvien/my-stats");
        if (response.success) {
          stats.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        isLoadingStats.value = false;
      }
    };

    const fetchRecentActivities = async () => {
      try {
        const response = await api.get("/nhanvien/recent-activities");
        if (response.success) {
          recentActivities.value = response.data.slice(0, 5);
        }
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      }
    };

    const validateProfileForm = () => {
      Object.keys(errors).forEach((key) => delete errors[key]);

      if (!form.HoTenNV.trim()) {
        errors.HoTenNV = "Họ tên là bắt buộc";
      } else if (form.HoTenNV.trim().length < 2) {
        errors.HoTenNV = "Họ tên phải có ít nhất 2 ký tự";
      }

      if (!form.Email.trim()) {
        errors.Email = "Email là bắt buộc";
      } else if (!/\S+@\S+\.\S+/.test(form.Email)) {
        errors.Email = "Email không hợp lệ";
      }

      if (!form.SoDienThoai.trim()) {
        errors.SoDienThoai = "Số điện thoại là bắt buộc";
      } else if (!/^[0-9]{10,11}$/.test(form.SoDienThoai.replace(/\s/g, ""))) {
        errors.SoDienThoai = "Số điện thoai phải có 10-11 số";
      }

      if (!form.DiaChi.trim()) {
        errors.DiaChi = "Địa chỉ là bắt buộc";
      } else if (form.DiaChi.trim().length < 10) {
        errors.DiaChi = "Địa chỉ phải có ít nhất 10 ký tự";
      }

      return Object.keys(errors).length === 0;
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

      isUpdating.value = true;

      try {
        const response = await api.put("/nhanvien/profile", form);

        if (response.success) {
          // Update user in store
          await authStore.fetchUser();
          toast.success("Cập nhật thông tin thành công");
          loadUserData();
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
      } finally {
        isUpdating.value = false;
      }
    };

    const changePassword = async () => {
      if (!validatePasswordForm()) return;

      isChangingPassword.value = true;

      try {
        await authStore.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });

        toast.success("Đổi mật khẩu thành công");
        resetPasswordForm();
      } catch (error) {
        console.error("Error changing password:", error);
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        }
      } finally {
        isChangingPassword.value = false;
      }
    };

    const handleAvatarChange = async (event) => {
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

      isUploadingAvatar.value = true;

      try {
        const formData = new FormData();
        formData.append("avatar", file);

        const response = await api.post("/nhanvien/upload-avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.success) {
          await authStore.fetchUser();
          toast.success("Cập nhật ảnh đại diện thành công");
        }
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Có lỗi khi tải ảnh lên");
      } finally {
        isUploadingAvatar.value = false;
      }
    };

    const logoutAllSessions = async () => {
      const result = await Swal.fire({
        title: "Đăng xuất tất cả phiên",
        text: "Bạn sẽ bị đăng xuất khỏi tất cả thiết bị. Tiếp tục?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Đăng xuất tất cả",
        cancelButtonText: "Hủy",
      });

      if (result.isConfirmed) {
        try {
          await api.post("/auth/logout-all-sessions");
          toast.success("Đã đăng xuất tất cả phiên thành công");
        } catch (error) {
          console.error("Error logging out all sessions:", error);
        }
      }
    };

    const refreshData = () => {
      loadUserData();
      fetchStats();
      fetchRecentActivities();
      toast.info("Đã làm mới dữ liệu");
    };

    const resetForm = () => {
      loadUserData();
      Object.keys(errors).forEach((key) => delete errors[key]);
    };

    const resetPasswordForm = () => {
      passwordForm.currentPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
      Object.keys(passwordErrors).forEach((key) => delete passwordErrors[key]);
    };

    // Helper functions
    const getUserInitials = () => {
      if (!user.value?.HoTenNV) return "A";
      const names = user.value.HoTenNV.split(" ");
      return names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0];
    };

    const getAvatarUrl = (avatarPath) => {
      if (!avatarPath) return "";
      if (avatarPath.startsWith("http")) return avatarPath;
      return `http://localhost:5000${avatarPath}`;
    };

    const getRoleBadgeClass = (role) => {
      const classes = {
        Admin: "bg-danger",
        NhanVien: "bg-primary",
        ThuThu: "bg-info",
      };
      return classes[role] || "bg-secondary";
    };

    const getRoleIcon = (role) => {
      const icons = {
        Admin: "bi bi-star-fill",
        NhanVien: "bi bi-person-badge",
        ThuThu: "bi bi-book",
      };
      return icons[role] || "bi bi-person";
    };

    const getPasswordStrength = () => {
      const password = passwordForm.newPassword;
      if (!password) return 0;

      let score = 0;
      if (password.length >= 6) score += 20;
      if (password.length >= 8) score += 20;
      if (/[a-z]/.test(password)) score += 20;
      if (/[A-Z]/.test(password)) score += 20;
      if (/[0-9]/.test(password)) score += 10;
      if (/[^A-Za-z0-9]/.test(password)) score += 10;

      return score;
    };

    const getPasswordStrengthWidth = () => {
      return getPasswordStrength();
    };

    const getPasswordStrengthClass = () => {
      const score = getPasswordStrength();
      if (score < 40) return "bg-danger";
      if (score < 60) return "bg-warning";
      if (score < 80) return "bg-info";
      return "bg-success";
    };

    const getPasswordStrengthText = () => {
      const score = getPasswordStrength();
      if (score < 40) return "Yếu";
      if (score < 60) return "Trung bình";
      if (score < 80) return "Mạnh";
      return "Rất mạnh";
    };

    const getActivityMarkerClass = (type) => {
      const classes = {
        book: "bg-primary",
        category: "bg-success",
        borrow: "bg-warning",
        user: "bg-info",
      };
      return classes[type] || "bg-secondary";
    };

    const getActivityIcon = (type) => {
      const icons = {
        book: "bi bi-book",
        category: "bi bi-grid-3x3-gap",
        borrow: "bi bi-arrow-left-right",
        user: "bi bi-person",
      };
      return icons[type] || "bi bi-circle";
    };

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const formatDateTime = (date) => {
      if (!date) return "";
      return new Date(date).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatRelativeTime = (date) => {
      if (!date) return "";
      const now = new Date();
      const diffMs = now - new Date(date);
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Vừa xong";
      if (diffMins < 60) return `${diffMins} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return formatDate(date);
    };

    // Lifecycle
    onMounted(() => {
      loadUserData();
      fetchStats();
      fetchRecentActivities();
    });

    return {
      user,
      stats,
      recentActivities,
      form,
      passwordForm,
      errors,
      passwordErrors,
      isUpdating,
      isChangingPassword,
      isUploadingAvatar,
      isLoadingStats,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      updateProfile,
      changePassword,
      handleAvatarChange,
      logoutAllSessions,
      refreshData,
      resetForm,
      resetPasswordForm,
      getUserInitials,
      getAvatarUrl,
      getRoleBadgeClass,
      getRoleIcon,
      getPasswordStrengthWidth,
      getPasswordStrengthClass,
      getPasswordStrengthText,
      getActivityMarkerClass,
      getActivityIcon,
      formatDate,
      formatDateTime,
      formatRelativeTime,
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
  transition: all 0.3s ease;
}

.avatar-img:hover {
  border-color: #007bff;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  border: 4px solid #e9ecef;
  transition: all 0.3s ease;
}

.avatar-placeholder:hover {
  border-color: #007bff;
  transform: scale(1.02);
}

.avatar-upload-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar-upload-btn:hover:not(:disabled) {
  background: #0056b3;
  transform: scale(1.1);
}

.avatar-upload-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.stats-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
  transition: all 0.3s ease;
}

.stats-item:last-child {
  border-bottom: none;
}

.stats-item:hover {
  background-color: #f8f9fa;
  border-radius: 0.375rem;
  margin: 0 -0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.security-item {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.security-item:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.timeline {
  position: relative;
}

.timeline::before {
  content: "";
  position: absolute;
  left: 12px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e9ecef;
}

.timeline-item {
  position: relative;
  padding-left: 40px;
  margin-bottom: 1.5rem;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: 0;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.timeline-content {
  background: white;
  padding: 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-title {
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.timeline-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.5rem;
}

.timeline-time {
  font-size: 0.75rem;
  color: #adb5bd;
}

.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.invalid-feedback {
  display: block;
}

.progress {
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.6s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
    font-size: 0.8rem;
  }

  .timeline-item {
    padding-left: 30px;
  }

  .timeline::before {
    left: 9px;
  }

  .timeline-marker {
    width: 18px;
    height: 18px;
    font-size: 0.6rem;
  }
}
</style>
