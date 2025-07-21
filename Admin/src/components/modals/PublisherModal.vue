<template>
  <div
    class="modal fade"
    id="publisherModal"
    tabindex="-1"
    aria-labelledby="publisherModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="publisherModalLabel">
            {{ isEdit ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuất bản mới" }}
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
            <div class="mb-3">
              <label for="tenNXB" class="form-label">Tên nhà xuất bản *</label>
              <input
                type="text"
                class="form-control"
                id="tenNXB"
                v-model="form.TenNXB"
                required
                :class="{ 'is-invalid': errors.TenNXB }"
              />
              <div v-if="errors.TenNXB" class="invalid-feedback">
                {{ errors.TenNXB }}
              </div>
            </div>
            <div class="mb-3">
              <label for="diaChi" class="form-label">Địa chỉ *</label>
              <input
                type="text"
                class="form-control"
                id="diaChi"
                v-model="form.DiaChi"
                required
                :class="{ 'is-invalid': errors.DiaChi }"
              />
              <div v-if="errors.DiaChi" class="invalid-feedback">
                {{ errors.DiaChi }}
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
  name: "PublisherModal",
  props: {
    publisher: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      form: {
        TenNXB: "",
        DiaChi: "",
      },
      errors: {},
      loading: false,
    };
  },
  computed: {
    isEdit() {
      return this.publisher && this.publisher._id;
    },
  },
  watch: {
    publisher: {
      handler(newVal) {
        if (newVal) {
          this.form = { ...newVal };
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
        this.$emit("submit", { ...this.form });
      } finally {
        this.loading = false;
      }
    },
    validateForm() {
      const errors = {};

      if (!this.form.TenNXB?.trim()) {
        errors.TenNXB = "Tên nhà xuất bản là bắt buộc";
      }

      if (!this.form.DiaChi?.trim()) {
        errors.DiaChi = "Địa chỉ là bắt buộc";
      }

      this.errors = errors;
      return Object.keys(errors).length === 0;
    },
    clearErrors() {
      this.errors = {};
    },
    resetForm() {
      this.form = {
        TenNXB: "",
        DiaChi: "",
      };
      this.clearErrors();
    },
  },
};
</script>
