<!-- Chi tiết nhân viên -->
<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="bi bi-person-circle me-2"></i>
          Chi tiết nhân viên
        </h5>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <div v-if="staff">
          <div class="row">
            <!-- Staff Avatar and Basic Info -->
            <div class="col-md-4 text-center mb-4">
              <div class="staff-avatar-large mb-3">
                {{ getInitials(staff.HoTenNV) }}
              </div>
              <h5 class="mb-1">{{ staff.HoTenNV }}</h5>
              <p class="text-muted mb-2">{{ staff.Email }}</p>
              <div class="d-flex justify-content-center gap-2 mb-3">
                <span :class="getRoleBadgeClass(staff.ChucVu)">
                  <i :class="getRoleIcon(staff.ChucVu)" class="me-1"></i>
                  {{ getRoleText(staff.ChucVu) }}
                </span>
                <span class="badge bg-secondary">
                  {{ staff.MSNV || "N/A" }}
                </span>
              </div>
            </div>

            <!-- Staff Details -->
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
                          <td>{{ staff.HoTenNV }}</td>
                        </tr>
                        <tr>
                          <td><strong>Email:</strong></td>
                          <td>{{ staff.Email }}</td>
                        </tr>
                        <tr>
                          <td><strong>Chức vụ:</strong></td>
                          <td>
                            <span :class="getRoleBadgeClass(staff.ChucVu)">
                              <i
                                :class="getRoleIcon(staff.ChucVu)"
                                class="me-1"
                              ></i>
                              {{ getRoleText(staff.ChucVu) }}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Điện thoại:</strong></td>
                          <td>{{ staff.SoDienThoai || "Chưa cập nhật" }}</td>
                        </tr>
                        <tr>
                          <td><strong>Địa chỉ:</strong></td>
                          <td>{{ staff.DiaChi || "Chưa cập nhật" }}</td>
                        </tr>
                        <tr>
                          <td><strong>Mã nhân viên:</strong></td>
                          <td>
                            <code class="bg-light px-2 py-1 rounded">{{
                              staff.MSNV || "N/A"
                            }}</code>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Ngày tạo:</strong></td>
                          <td>{{ formatDate(staff.createdAt) }}</td>
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
import { computed } from "vue";

export default {
  name: "StaffDetailModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    staff: {
      type: Object,
      default: null,
    },
  },
  emits: ["close", "edit"],
  setup(props, { emit }) {
    // Methods
    const closeModal = () => {
      emit("close");
    };

    const editStaff = () => {
      emit("edit", props.staff);
    };

    // Helper functions
    const getInitials = (name) => {
      if (!name) return "NV";
      const words = name.split(" ");
      if (words.length === 1) return words[0].charAt(0).toUpperCase();
      return (
        words[0].charAt(0) + words[words.length - 1].charAt(0)
      ).toUpperCase();
    };

    const getRoleBadgeClass = (role) => {
      const classes = {
        Admin: "badge bg-danger",
        NhanVien: "badge bg-primary",
      };
      return classes[role] || "badge bg-secondary";
    };

    const getRoleIcon = (role) => {
      const icons = {
        Admin: "bi bi-star-fill",
        NhanVien: "bi bi-person-badge",
      };
      return icons[role] || "bi bi-person";
    };

    const getRoleText = (role) => {
      const texts = {
        Admin: "Quản trị viên",
        NhanVien: "Nhân viên",
      };
      return texts[role] || role;
    };

    const formatDate = (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    return {
      closeModal,
      editStaff,
      getInitials,
      getRoleBadgeClass,
      getRoleIcon,
      getRoleText,
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
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 0.5rem;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.btn-close:hover {
  color: #000;
  background-color: #f8f9fa;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
}

.staff-avatar-large {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #6f42c1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 2.5rem;
  border: 4px solid #f8f9fa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
}

.bg-pink {
  background-color: #e91e63 !important;
}

code {
  background-color: #e9ecef;
  color: #495057;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}
</style>
