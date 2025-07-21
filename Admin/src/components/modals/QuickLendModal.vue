<template>
  <div
    class="modal fade"
    id="quickLendModal"
    tabindex="-1"
    aria-labelledby="quickLendModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="quickLendModalLabel">
            Tạo phiếu mượn nhanh
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
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="docGia" class="form-label">Độc giả *</label>
                  <select
                    class="form-select"
                    id="docGia"
                    v-model="form.MaDocGia"
                    required
                    :class="{ 'is-invalid': errors.MaDocGia }"
                  >
                    <option value="">Chọn độc giả</option>
                    <option
                      v-for="reader in readers"
                      :key="reader._id"
                      :value="reader._id"
                    >
                      {{ reader.HoLot }} {{ reader.Ten }} - {{ reader.Email }}
                    </option>
                  </select>
                  <div v-if="errors.MaDocGia" class="invalid-feedback">
                    {{ errors.MaDocGia }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="sach" class="form-label">Sách *</label>
                  <select
                    class="form-select"
                    id="sach"
                    v-model="form.MaSach"
                    required
                    :class="{ 'is-invalid': errors.MaSach }"
                  >
                    <option value="">Chọn sách</option>
                    <option
                      v-for="book in books"
                      :key="book._id"
                      :value="book._id"
                    >
                      {{ book.TenSach }} - {{ book.TacGia }} (Còn:
                      {{ book.SoQuyen }})
                    </option>
                  </select>
                  <div v-if="errors.MaSach" class="invalid-feedback">
                    {{ errors.MaSach }}
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="ngayMuon" class="form-label">Ngày mượn *</label>
                  <input
                    type="date"
                    class="form-control"
                    id="ngayMuon"
                    v-model="form.NgayMuon"
                    required
                    :class="{ 'is-invalid': errors.NgayMuon }"
                  />
                  <div v-if="errors.NgayMuon" class="invalid-feedback">
                    {{ errors.NgayMuon }}
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="ngayHenTra" class="form-label"
                    >Ngày hẹn trả *</label
                  >
                  <input
                    type="date"
                    class="form-control"
                    id="ngayHenTra"
                    v-model="form.NgayHenTra"
                    required
                    :class="{ 'is-invalid': errors.NgayHenTra }"
                  />
                  <div v-if="errors.NgayHenTra" class="invalid-feedback">
                    {{ errors.NgayHenTra }}
                  </div>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label for="ghiChu" class="form-label">Ghi chú</label>
              <textarea
                class="form-control"
                id="ghiChu"
                rows="3"
                v-model="form.GhiChu"
                placeholder="Ghi chú về phiếu mượn (tùy chọn)"
              ></textarea>
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
            Tạo phiếu mượn
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "QuickLendModal",
  props: {
    readers: {
      type: Array,
      default: () => [],
    },
    books: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: {
        MaDocGia: "",
        MaSach: "",
        NgayMuon: "",
        NgayHenTra: "",
        GhiChu: "",
      },
      errors: {},
      loading: false,
    };
  },
  mounted() {
    // Set default dates
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    this.form.NgayMuon = today.toISOString().split("T")[0];
    this.form.NgayHenTra = nextWeek.toISOString().split("T")[0];
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

      if (!this.form.MaDocGia) {
        errors.MaDocGia = "Vui lòng chọn độc giả";
      }

      if (!this.form.MaSach) {
        errors.MaSach = "Vui lòng chọn sách";
      }

      if (!this.form.NgayMuon) {
        errors.NgayMuon = "Vui lòng chọn ngày mượn";
      }

      if (!this.form.NgayHenTra) {
        errors.NgayHenTra = "Vui lòng chọn ngày hẹn trả";
      } else if (
        new Date(this.form.NgayHenTra) <= new Date(this.form.NgayMuon)
      ) {
        errors.NgayHenTra = "Ngày hẹn trả phải sau ngày mượn";
      }

      this.errors = errors;
      return Object.keys(errors).length === 0;
    },
    clearErrors() {
      this.errors = {};
    },
    resetForm() {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      this.form = {
        MaDocGia: "",
        MaSach: "",
        NgayMuon: today.toISOString().split("T")[0],
        NgayHenTra: nextWeek.toISOString().split("T")[0],
        GhiChu: "",
      };
      this.clearErrors();
    },
  },
};
</script>
