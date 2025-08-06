<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-person-circle me-2"></i>
          Chi tiết độc giả
        </h5>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="!user" class="text-center p-5 text-muted">
          <i class="bi bi-person-x display-4 d-block mb-3"></i>
          <h6>Không có thông tin độc giả</h6>
        </div>

        <div v-else>
          <div class="row">
            <!-- User Avatar and Basic Info -->
            <div class="col-md-4 text-center mb-4">
              <div class="user-avatar-large mb-3">
                <img
                  v-if="user.Avatar"
                  :src="getUserAvatar(user.Avatar)"
                  :alt="getFullName(user)"
                  class="user-avatar-img-large"
                />
                <div v-else class="user-avatar-placeholder-large">
                  {{ getUserInitials(user) }}
                </div>
              </div>
              <h5 class="mb-1">{{ getFullName(user) }}</h5>
              <p class="text-muted mb-2">{{ user.Email }}</p>
              <div class="d-flex justify-content-center gap-2 mb-3">
                <span
                  class="badge"
                  :class="user.Phai === 'Nam' ? 'bg-info' : 'bg-pink'"
                >
                  <i
                    :class="
                      user.Phai === 'Nam'
                        ? 'bi bi-gender-male'
                        : 'bi bi-gender-female'
                    "
                  ></i>
                  {{ user.Phai }}
                </span>
                <span class="badge bg-secondary">
                  {{ user.MaDocGia }}
                </span>
              </div>
            </div>

            <!-- User Details -->
            <div class="col-md-8">
              <div class="card">
                <div class="card-header">
                  <h6 class="mb-0">
                    <i class="bi bi-info-circle me-2"></i>
                    Thông tin cá nhân
                  </h6>
                </div>
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table table-borderless">
                      <tbody>
                        <tr>
                          <td><strong>Họ tên:</strong></td>
                          <td>{{ getFullName(user) }}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{{ user.Email }}</td>
                        </tr>
                        <tr>
                          <td><strong>Ngày sinh:</strong></td>
                          <td>{{ formatDate(user.NgaySinh) }}</td>
                        </tr>
                        <tr>
                          <td><strong>Giới tính:</strong></td>
                          <td>{{ user.Phai }}</td>
                        </tr>
                        <tr>
                          <td><strong>Điện thoại:</strong></td>
                          <td>{{ user.DienThoai || "Chưa cập nhật" }}</td>
                        </tr>
                        <tr>
                          <td><strong>Địa chỉ:</strong></td>
                          <td>{{ user.DiaChi || "Chưa cập nhật" }}</td>
                        </tr>
                        <tr>
                          <td><strong>Mã độc giả:</strong></td>
                          <td>
                            <code class="bg-light px-2 py-1 rounded">{{
                              user.MaDocGia
                            }}</code>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Đăng ký:</strong></td>
                          <td>{{ formatDate(user.createdAt) }}</td>
                        </tr>
                      </tbody>
                    </table>
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
import { useToast } from "vue-toastification";

export default {
  name: "UserDetailModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      default: null,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const toast = useToast();

    const closeModal = () => {
      emit("close");
    };

    const getFullName = (user) => {
      if (!user) return "";
      return `${user.HoLot || ""} ${user.Ten || ""}`.trim();
    };

    const getUserInitials = (user) => {
      const fullName = getFullName(user);
      if (!fullName) return "U";
      const names = fullName.split(" ");
      return names.length > 1
        ? names[0][0] + names[names.length - 1][0]
        : names[0][0];
    };

    const getUserAvatar = (avatarPath) => {
      if (!avatarPath) return "";
      if (avatarPath.startsWith("http")) return avatarPath;
      return `http://localhost:5000${avatarPath}`;
    };

    const formatDate = (date) => {
      if (!date) return "Chưa cập nhật";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return {
      closeModal,
      getFullName,
      getUserInitials,
      getUserAvatar,
      formatDate,
    };
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  animation: fadeIn 0.3s ease-out;
}

.modal-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.175);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease-in-out;
}

.btn-close:hover {
  color: #dc3545;
  background-color: #f8f9fa;
}

.modal-body {
  padding: 0 1.5rem 1rem;
}

.modal-footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
}

.user-avatar-large {
  width: 120px;
  height: 120px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar-img-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e9ecef;
}

.user-avatar-placeholder-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 2.5rem;
}

.bg-pink {
  background-color: #e91e63 !important;
}

.table th {
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
