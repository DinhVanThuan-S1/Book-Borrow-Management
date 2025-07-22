<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">
          {{ isEdit ? "Chỉnh sửa độc giả" : "Thêm độc giả mới" }}
        </h5>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-8">
              <div class="mb-3">
                <label for="hoLot" class="form-label">
                  Họ lót <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="hoLot"
                  v-model="form.HoLot"
                  :class="{ 'is-invalid': errors.HoLot }"
                  placeholder="Nhập họ lót"
                />
                <div v-if="errors.HoLot" class="invalid-feedback">
                  {{ errors.HoLot }}
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <div class="mb-3">
                <label for="ten" class="form-label">
                  Tên <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="ten"
                  v-model="form.Ten"
                  :class="{ 'is-invalid': errors.Ten }"
                  placeholder="Nhập tên"
                />
                <div v-if="errors.Ten" class="invalid-feedback">
                  {{ errors.Ten }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="email" class="form-label">
                  Email <span class="text-danger">*</span>
                </label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="form.Email"
                  :class="{ 'is-invalid': errors.Email }"
                  placeholder="example@email.com"
                />
                <div v-if="errors.Email" class="invalid-feedback">
                  {{ errors.Email }}
                </div>
              </div>
            </div>
            <div class="col-md-6" v-if="!isEdit">
              <div class="mb-3">
                <label for="password" class="form-label">
                  Mật khẩu <span class="text-danger">*</span>
                </label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="form.Password"
                  :class="{ 'is-invalid': errors.Password }"
                  placeholder="Nhập mật khẩu"
                />
                <div v-if="errors.Password" class="invalid-feedback">
                  {{ errors.Password }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="ngaySinh" class="form-label">
                  Ngày sinh <span class="text-danger">*</span>
                </label>
                <input
                  type="date"
                  class="form-control"
                  id="ngaySinh"
                  v-model="form.NgaySinh"
                  :class="{ 'is-invalid': errors.NgaySinh }"
                />
                <div v-if="errors.NgaySinh" class="invalid-feedback">
                  {{ errors.NgaySinh }}
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label for="phai" class="form-label">
                  Giới tính <span class="text-danger">*</span>
                </label>
                <select
                  class="form-select"
                  id="phai"
                  v-model="form.Phai"
                  :class="{ 'is-invalid': errors.Phai }"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
                <div v-if="errors.Phai" class="invalid-feedback">
                  {{ errors.Phai }}
                </div>
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
              <div class="mb-3">
                <label for="dienThoai" class="form-label">
                  Điện thoại <span class="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  class="form-control"
                  id="dienThoai"
                  v-model="form.DienThoai"
                  :class="{ 'is-invalid': errors.DienThoai }"
                  placeholder="0912345678"
                  maxlength="10"
                />
                <div v-if="errors.DienThoai" class="invalid-feedback">
                  {{ errors.DienThoai }}
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label for="diaChi" class="form-label">
                  Địa chỉ <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="diaChi"
                  v-model="form.DiaChi"
                  :class="{ 'is-invalid': errors.DiaChi }"
                  placeholder="Nhập địa chỉ"
                />
                <div v-if="errors.DiaChi" class="invalid-feedback">
                  {{ errors.DiaChi }}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">
          Hủy
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="handleSubmit"
          :disabled="isLoading"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm me-2"
            role="status"
          ></span>
          {{ isEdit ? "Cập nhật" : "Thêm mới" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, watch, computed } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "UserModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Object,
      default: null,
    },
    isEdit: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close", "saved"],
  setup(props, { emit }) {
    const toast = useToast();
    const isLoading = ref(false);

    const form = reactive({
      HoLot: "",
      Ten: "",
      Email: "",
      Password: "",
      NgaySinh: "",
      Phai: "",
      DiaChi: "",
      DienThoai: "",
    });

    const errors = reactive({});

    const resetForm = () => {
      Object.keys(form).forEach((key) => {
        form[key] = "";
      });
      Object.keys(errors).forEach((key) => {
        delete errors[key];
      });
    };

    const populateForm = (userData) => {
      if (userData) {
        form.HoLot = userData.HoLot || "";
        form.Ten = userData.Ten || "";
        form.Email = userData.Email || "";
        form.Password = "";
        form.NgaySinh = userData.NgaySinh
          ? new Date(userData.NgaySinh).toISOString().split("T")[0]
          : "";
        form.Phai = userData.Phai || "";
        form.DiaChi = userData.DiaChi || "";
        form.DienThoai = userData.DienThoai || "";
      }
    };

    const validateForm = () => {
      // Clear previous errors
      Object.keys(errors).forEach((key) => {
        delete errors[key];
      });

      if (!form.HoLot?.trim()) {
        errors.HoLot = "Họ lót là bắt buộc";
      }

      if (!form.Ten?.trim()) {
        errors.Ten = "Tên là bắt buộc";
      }

      if (!form.Email?.trim()) {
        errors.Email = "Email là bắt buộc";
      } else if (!/\S+@\S+\.\S+/.test(form.Email)) {
        errors.Email = "Email không hợp lệ";
      }

      if (!props.isEdit && !form.Password?.trim()) {
        errors.Password = "Mật khẩu là bắt buộc";
      } else if (!props.isEdit && form.Password.length < 6) {
        errors.Password = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      if (!form.NgaySinh) {
        errors.NgaySinh = "Ngày sinh là bắt buộc";
      }

      if (!form.Phai) {
        errors.Phai = "Giới tính là bắt buộc";
      }

      if (!form.DiaChi?.trim()) {
        errors.DiaChi = "Địa chỉ là bắt buộc";
      }

      if (!form.DienThoai?.trim()) {
        errors.DienThoai = "Số điện thoại là bắt buộc";
      } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(form.DienThoai.trim())) {
        errors.DienThoai = "Số điện thoại không hợp lệ (VD: 0912345678)";
      }

      return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        toast.error("Vui lòng kiểm tra lại thông tin");
        return;
      }

      isLoading.value = true;
      try {
        const submitData = {
          HoLot: form.HoLot.trim(),
          Ten: form.Ten.trim(),
          Email: form.Email.trim(),
          NgaySinh: form.NgaySinh,
          Phai: form.Phai,
          DiaChi: form.DiaChi.trim(),
          DienThoai: form.DienThoai.trim(),
        };

        // Add password for new users only
        if (!props.isEdit) {
          submitData.Password = form.Password.trim();
        }

        let response;
        if (props.isEdit) {
          response = await api.put(`/docgia/${props.user._id}`, submitData);
        } else {
          response = await api.post("/docgia", submitData);
        }

        if (response.success) {
          toast.success(
            props.isEdit
              ? "Cập nhật độc giả thành công!"
              : "Thêm độc giả mới thành công!"
          );
          emit("saved");
          closeModal();
        }
      } catch (error) {
        console.error("Error saving user:", error);

        if (error.response?.data?.errors) {
          // Handle validation errors from server
          Object.keys(error.response.data.errors).forEach((field) => {
            errors[field] = error.response.data.errors[field];
          });
        } else if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(
            props.isEdit
              ? "Có lỗi khi cập nhật độc giả"
              : "Có lỗi khi thêm độc giả"
          );
        }
      } finally {
        isLoading.value = false;
      }
    };

    const closeModal = () => {
      resetForm();
      emit("close");
    };

    // Watch for user changes
    watch(
      () => props.user,
      (newUser) => {
        if (newUser && props.isEdit) {
          populateForm(newUser);
        } else if (!props.isEdit) {
          resetForm();
        }
      },
      { immediate: true, deep: true }
    );

    // Watch for show changes
    watch(
      () => props.show,
      (show) => {
        if (show && !props.isEdit) {
          resetForm();
        }
      }
    );

    return {
      form,
      errors,
      isLoading,
      handleSubmit,
      closeModal,
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
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  flex: 1;
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
  justify-content: flex-end;
  gap: 0.5rem;
}

.form-label {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.5rem;
}

.text-danger {
  color: #dc3545 !important;
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

@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>
