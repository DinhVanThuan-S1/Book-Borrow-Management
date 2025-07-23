<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h5 class="modal-title">
          {{ isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới" }}
        </h5>
        <button type="button" class="btn-close" @click="closeModal">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="row">
            <div class="col-md-12">
              <div class="mb-3">
                <label for="hoTenNV" class="form-label">
                  Họ và tên <span class="text-danger">*</span>
                </label>
                <input
                  type="text"
                  class="form-control"
                  id="hoTenNV"
                  v-model="form.HoTenNV"
                  :class="{ 'is-invalid': errors.HoTenNV }"
                  placeholder="Nhập họ và tên đầy đủ"
                />
                <div v-if="errors.HoTenNV" class="invalid-feedback">
                  {{ errors.HoTenNV }}
                </div>
              </div>
            </div>
            <!-- <div class="col-md-4">
              <div class="mb-3">
                <label for="maNV" class="form-label">Mã nhân viên</label>
                <input
                  type="text"
                  class="form-control"
                  id="maNV"
                  v-model="form.MaNV"
                  :class="{ 'is-invalid': errors.MaNV }"
                  placeholder="Tự động tạo nếu để trống"
                />
                <div v-if="errors.MaNV" class="invalid-feedback">
                  {{ errors.MaNV }}
                </div>
              </div>
            </div> -->
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
                <label for="chucVu" class="form-label">
                  Chức vụ <span class="text-danger">*</span>
                </label>
                <select
                  class="form-select"
                  id="chucVu"
                  v-model="form.ChucVu"
                  :class="{ 'is-invalid': errors.ChucVu }"
                >
                  <option value="">Chọn chức vụ</option>
                  <option value="Admin">Quản trị viên</option>
                  <option value="NhanVien">Nhân viên</option>
                </select>
                <div v-if="errors.ChucVu" class="invalid-feedback">
                  {{ errors.ChucVu }}
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="mb-3">
                <label for="soDienThoai" class="form-label">
                  Số điện thoại <span class="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  class="form-control"
                  id="soDienThoai"
                  v-model="form.SoDienThoai"
                  :class="{ 'is-invalid': errors.SoDienThoai }"
                  placeholder="0912345678"
                />
                <div v-if="errors.SoDienThoai" class="invalid-feedback">
                  {{ errors.SoDienThoai }}
                </div>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label for="diaChi" class="form-label">
              Địa chỉ <span class="text-danger">*</span>
            </label>
            <textarea
              class="form-control"
              id="diaChi"
              v-model="form.DiaChi"
              :class="{ 'is-invalid': errors.DiaChi }"
              rows="3"
              placeholder="Nhập địa chỉ đầy đủ"
            ></textarea>
            <div v-if="errors.DiaChi" class="invalid-feedback">
              {{ errors.DiaChi }}
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
          :disabled="isSubmitting"
        >
          <span
            v-if="isSubmitting"
            class="spinner-border spinner-border-sm me-2"
          ></span>
          {{ isEdit ? "Cập nhật" : "Thêm mới" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, nextTick } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "StaffModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    staff: {
      type: Object,
      default: null,
    },
    mode: {
      type: String,
      default: "create", // create or edit
    },
  },
  emits: ["close", "success"],
  setup(props, { emit }) {
    const toast = useToast();

    // Reactive data
    const isSubmitting = ref(false);

    const form = reactive({
      HoTenNV: "",
      MaNV: "",
      Email: "",
      Password: "",
      ChucVu: "",
      SoDienThoai: "",
      DiaChi: "",
    });

    const errors = reactive({});

    // Computed
    const isEdit = computed(() => props.mode === "edit");

    // Watch for staff changes
    watch(
      () => props.staff,
      (newStaff) => {
        if (newStaff && isEdit.value) {
          Object.assign(form, {
            HoTenNV: newStaff.HoTenNV || "",
            MaNV: newStaff.MaNV || "",
            Email: newStaff.Email || "",
            Password: "",
            ChucVu: newStaff.ChucVu || "",
            SoDienThoai: newStaff.SoDienThoai || "",
            DiaChi: newStaff.DiaChi || "",
          });
        }
      },
      { immediate: true }
    );

    // Watch show prop to reset form
    watch(
      () => props.show,
      (newShow) => {
        if (newShow && !isEdit.value) {
          resetForm();
        }
        if (newShow) {
          clearErrors();
        }
      }
    );

    // Methods
    const resetForm = () => {
      Object.assign(form, {
        HoTenNV: "",
        MaNV: "",
        Email: "",
        Password: "",
        ChucVu: "",
        SoDienThoai: "",
        DiaChi: "",
      });
    };

    const clearErrors = () => {
      Object.keys(errors).forEach((key) => {
        delete errors[key];
      });
    };

    const validateForm = () => {
      clearErrors();
      let isValid = true;

      // Validate HoTenNV
      if (!form.HoTenNV.trim()) {
        errors.HoTenNV = "Họ tên là bắt buộc";
        isValid = false;
      } else if (form.HoTenNV.trim().length < 2) {
        errors.HoTenNV = "Họ tên phải có ít nhất 2 ký tự";
        isValid = false;
      }

      // Validate Email
      if (!form.Email.trim()) {
        errors.Email = "Email là bắt buộc";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(form.Email)) {
        errors.Email = "Email không hợp lệ";
        isValid = false;
      }

      // Validate Password (only for create mode)
      if (!isEdit.value) {
        if (!form.Password) {
          errors.Password = "Mật khẩu là bắt buộc";
          isValid = false;
        } else if (form.Password.length < 6) {
          errors.Password = "Mật khẩu phải có ít nhất 6 ký tự";
          isValid = false;
        }
      }

      // Validate ChucVu
      if (!form.ChucVu) {
        errors.ChucVu = "Chức vụ là bắt buộc";
        isValid = false;
      }

      // Validate SoDienThoai
      if (!form.SoDienThoai.trim()) {
        errors.SoDienThoai = "Số điện thoại là bắt buộc";
        isValid = false;
      } else if (
        !/^(0[3|5|7|8|9])+([0-9]{8})$/.test(form.SoDienThoai.replace(/\s/g, ""))
      ) {
        errors.SoDienThoai = "Số điện thoại không đúng định dạng Việt Nam";
        isValid = false;
      }

      // Validate DiaChi
      if (!form.DiaChi.trim()) {
        errors.DiaChi = "Địa chỉ là bắt buộc";
        isValid = false;
      } else if (form.DiaChi.trim().length < 10) {
        errors.DiaChi = "Địa chỉ phải có ít nhất 10 ký tự";
        isValid = false;
      }

      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        return;
      }

      isSubmitting.value = true;

      try {
        const formData = { ...form };

        // Remove password field if editing
        if (isEdit.value) {
          delete formData.Password;
        }

        // Remove empty MaNV if not provided
        if (!formData.MaNV.trim()) {
          delete formData.MaNV;
        }

        let response;
        if (isEdit.value) {
          response = await api.put(`/nhanvien/${props.staff._id}`, formData);
        } else {
          response = await api.post("/nhanvien", formData);
        }

        if (response.success) {
          toast.success(
            isEdit.value
              ? "Cập nhật nhân viên thành công"
              : "Thêm nhân viên thành công"
          );
          emit("success");
        }
      } catch (error) {
        console.error("Error submitting staff:", error);

        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.response?.data?.errors) {
          // Handle validation errors from server
          const serverErrors = error.response.data.errors;
          Object.keys(serverErrors).forEach((key) => {
            errors[key] = serverErrors[key];
          });
        } else {
          toast.error(
            isEdit.value
              ? "Có lỗi xảy ra khi cập nhật nhân viên"
              : "Có lỗi xảy ra khi thêm nhân viên"
          );
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    const closeModal = () => {
      emit("close");
    };

    return {
      form,
      errors,
      isEdit,
      isSubmitting,
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
  max-width: 700px;
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

.form-control:focus,
.form-select:focus {
  border-color: #86b7fe;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.invalid-feedback {
  display: block;
}

.btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-container {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    padding: 1rem;
  }
}
</style>
