<template>
  <div
    class="modal fade"
    id="userModal"
    tabindex="-1"
    aria-labelledby="userModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="userModalLabel">
            {{ isEdit ? "Chỉnh sửa độc giả" : "Thêm độc giả mới" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col-md-8">
                <div class="mb-3">
                  <label for="hoLot" class="form-label">Họ lót *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="hoLot"
                    v-model="form.HoLot"
                    required
                    :class="{ 'is-invalid': errors.HoLot }"
                  />
                  <div v-if="errors.HoLot" class="invalid-feedback">
                    {{ errors.HoLot }}
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="mb-3">
                  <label for="ten" class="form-label">Tên *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="ten"
                    v-model="form.Ten"
                    required
                    :class="{ 'is-invalid': errors.Ten }"
                  />
                  <div v-if="errors.Ten" class="invalid-feedback">
                    {{ errors.Ten }}
                  </div>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label for="email" class="form-label">Email *</label>
              <input
                type="email"
                class="form-control"
                id="email"
                v-model="form.Email"
                required
                :class="{ 'is-invalid': errors.Email }"
              />
              <div v-if="errors.Email" class="invalid-feedback">
                {{ errors.Email }}
              </div>
            </div>
            <div class="mb-3" v-if="!isEdit">
              <label for="password" class="form-label">Mật khẩu *</label>
              <input
                type="password"
                class="form-control"
                id="password"
                v-model="form.Password"
                required
                :class="{ 'is-invalid': errors.Password }"
              />
              <div v-if="errors.Password" class="invalid-feedback">
                {{ errors.Password }}
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="ngaySinh" class="form-label">Ngày sinh</label>
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
                  <label for="phai" class="form-label">Giới tính</label>
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
            <div class="mb-3">
              <label for="diaChi" class="form-label">Địa chỉ</label>
              <input
                type="text"
                class="form-control"
                id="diaChi"
                v-model="form.DiaChi"
                :class="{ 'is-invalid': errors.DiaChi }"
              />
              <div v-if="errors.DiaChi" class="invalid-feedback">
                {{ errors.DiaChi }}
              </div>
            </div>
            <div class="mb-3">
              <label for="dienThoai" class="form-label">Điện thoại</label>
              <input
                type="tel"
                class="form-control"
                id="dienThoai"
                v-model="form.DienThoai"
                :class="{ 'is-invalid': errors.DienThoai }"
              />
              <div v-if="errors.DienThoai" class="invalid-feedback">
                {{ errors.DienThoai }}
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Hủy
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="handleSubmit"
            :disabled="loading"
          >
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-2"
              role="status"
            ></span>
            {{ isEdit ? "Cập nhật" : "Thêm mới" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserModal",
  props: {
    user: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        HoLot: "",
        Ten: "",
        Email: "",
        Password: "",
        NgaySinh: "",
        Phai: "",
        DiaChi: "",
        DienThoai: "",
      },
      errors: {},
      loading: false,
    };
  },
  computed: {
    isEdit() {
      return this.user && this.user._id;
    },
  },
  watch: {
    user: {
      handler(newVal) {
        if (newVal) {
          this.form = {
            ...newVal,
            NgaySinh: newVal.NgaySinh
              ? new Date(newVal.NgaySinh).toISOString().split("T")[0]
              : "",
            Password: "", // Don't populate password for edit
          };
        } else {
          this.resetForm();
        }
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    async handleSubmit() {
      this.clearErrors();

      if (!this.validateForm()) {
        return;
      }

      this.loading = true;
      try {
        const formData = { ...this.form };
        if (this.isEdit) {
          delete formData.Password; // Remove password from edit form
        }
        this.$emit("submit", formData);
      } finally {
        this.loading = false;
      }
    },
    validateForm() {
      const errors = {};

      if (!this.form.HoLot?.trim()) {
        errors.HoLot = "Họ lót là bắt buộc";
      }

      if (!this.form.Ten?.trim()) {
        errors.Ten = "Tên là bắt buộc";
      }

      if (!this.form.Email?.trim()) {
        errors.Email = "Email là bắt buộc";
      } else if (!/\S+@\S+\.\S+/.test(this.form.Email)) {
        errors.Email = "Email không hợp lệ";
      }

      if (!this.isEdit && !this.form.Password?.trim()) {
        errors.Password = "Mật khẩu là bắt buộc";
      }

      this.errors = errors;
      return Object.keys(errors).length === 0;
    },
    clearErrors() {
      this.errors = {};
    },
    resetForm() {
      this.form = {
        HoLot: "",
        Ten: "",
        Email: "",
        Password: "",
        NgaySinh: "",
        Phai: "",
        DiaChi: "",
        DienThoai: "",
      };
      this.clearErrors();
    },
  },
};
</script>
