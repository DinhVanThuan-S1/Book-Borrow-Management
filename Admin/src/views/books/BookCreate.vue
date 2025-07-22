<template>
  <div class="book-create fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Thêm sách mới</h1>
          <!-- <p class="page-subtitle">Thêm thông tin sách vào thư viện</p> -->
        </div>
        <router-link to="/books" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>
          Quay lại
        </router-link>
      </div>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleSubmit">
      <div class="row">
        <!-- Left Column -->
        <div class="col-lg-8">
          <div class="admin-card mb-4">
            <div class="card-header-custom">
              <h5 class="mb-0">
                <i class="bi bi-info-circle me-2"></i>
                Thông tin cơ bản
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-12">
                  <label for="tenSach" class="form-label">
                    Tên sách <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="tenSach"
                    v-model="form.TenSach"
                    :class="{ 'is-invalid': errors.TenSach }"
                    placeholder="Nhập tên sách..."
                  />
                  <div v-if="errors.TenSach" class="invalid-feedback">
                    {{ errors.TenSach }}
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="tacGia" class="form-label">
                    Tác giả <span class="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="tacGia"
                    v-model="form.TacGia"
                    :class="{ 'is-invalid': errors.TacGia }"
                    placeholder="Nhập tên tác giả..."
                  />
                  <div v-if="errors.TacGia" class="invalid-feedback">
                    {{ errors.TacGia }}
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="namXuatBan" class="form-label">
                    Năm xuất bản <span class="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    id="namXuatBan"
                    v-model.number="form.NamXuatBan"
                    :class="{ 'is-invalid': errors.NamXuatBan }"
                    placeholder="YYYY"
                    min="1900"
                    :max="new Date().getFullYear()"
                  />
                  <div v-if="errors.NamXuatBan" class="invalid-feedback">
                    {{ errors.NamXuatBan }}
                  </div>
                </div>

                <div class="col-md-12">
                  <label for="moTa" class="form-label">Mô tả</label>
                  <textarea
                    class="form-control"
                    id="moTa"
                    rows="4"
                    v-model="form.MoTa"
                    :class="{ 'is-invalid': errors.MoTa }"
                    placeholder="Mô tả về nội dung sách..."
                  ></textarea>
                  <div v-if="errors.MoTa" class="invalid-feedback">
                    {{ errors.MoTa }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Category & Publisher -->
          <div class="admin-card mb-4">
            <div class="card-header-custom">
              <h5 class="mb-0">
                <i class="bi bi-tags me-2"></i>
                Phân loại
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="danhMuc" class="form-label">
                    Danh mục <span class="text-danger">*</span>
                  </label>
                  <select
                    class="form-select"
                    id="danhMuc"
                    v-model="form.MaDM"
                    :class="{ 'is-invalid': errors.MaDM }"
                  >
                    <option value="">Chọn danh mục</option>
                    <option
                      v-for="category in categories"
                      :key="category._id"
                      :value="category._id"
                    >
                      {{ category.TenDM }}
                    </option>
                  </select>
                  <div v-if="errors.MaDM" class="invalid-feedback">
                    {{ errors.MaDM }}
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="nhaXuatBan" class="form-label">
                    Nhà xuất bản <span class="text-danger">*</span>
                  </label>
                  <select
                    class="form-select"
                    id="nhaXuatBan"
                    v-model="form.MaNXB"
                    :class="{ 'is-invalid': errors.MaNXB }"
                  >
                    <option value="">Chọn nhà xuất bản</option>
                    <option
                      v-for="publisher in publishers"
                      :key="publisher._id"
                      :value="publisher._id"
                    >
                      {{ publisher.TenNXB }}
                    </option>
                  </select>
                  <div v-if="errors.MaNXB" class="invalid-feedback">
                    {{ errors.MaNXB }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Pricing & Stock -->
          <div class="admin-card mb-4">
            <div class="card-header-custom">
              <h5 class="mb-0">
                <i class="bi bi-currency-dollar me-2"></i>
                Giá và số lượng
              </h5>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label for="donGia" class="form-label">
                    Đơn giá <span class="text-danger">*</span>
                  </label>
                  <div class="input-group">
                    <input
                      type="number"
                      class="form-control"
                      id="donGia"
                      v-model.number="form.DonGia"
                      :class="{ 'is-invalid': errors.DonGia }"
                      placeholder="0"
                      min="0"
                      step="1000"
                    />
                    <span class="input-group-text">VND</span>
                    <div v-if="errors.DonGia" class="invalid-feedback">
                      {{ errors.DonGia }}
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="soQuyen" class="form-label">
                    Số lượng <span class="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    id="soQuyen"
                    v-model.number="form.SoQuyen"
                    :class="{ 'is-invalid': errors.SoQuyen }"
                    placeholder="0"
                    min="0"
                  />
                  <div v-if="errors.SoQuyen" class="invalid-feedback">
                    {{ errors.SoQuyen }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="col-lg-4">
          <!-- Book Cover -->
          <div class="admin-card mb-4">
            <div class="card-header-custom">
              <h5 class="mb-0">
                <i class="bi bi-image me-2"></i>
                Ảnh bìa sách
              </h5>
            </div>
            <div class="card-body text-center">
              <div class="book-cover-upload">
                <div
                  class="upload-area"
                  :class="{ 'has-image': imagePreview }"
                  @click="$refs.fileInput.click()"
                  @drop="handleFileDrop"
                  @dragover.prevent
                  @dragenter.prevent
                >
                  <div v-if="!imagePreview" class="upload-placeholder">
                    <i class="bi bi-cloud-upload display-6 text-muted"></i>
                    <p class="mt-2 mb-1">Chọn ảnh bìa sách</p>
                    <small class="text-muted">
                      Kéo thả hoặc click để chọn ảnh
                    </small>
                  </div>
                  <div v-else class="image-preview">
                    <img :src="imagePreview" alt="Book cover" />
                    <div class="image-overlay">
                      <button
                        type="button"
                        class="btn btn-sm btn-light"
                        @click.stop="removeImage"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  class="d-none"
                  accept="image/*"
                  @change="handleFileSelect"
                />
                <div class="mt-2">
                  <small class="text-muted">
                    Định dạng: JPG, PNG. Tối đa 2MB
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="admin-card">
            <div class="card-body">
              <div class="d-grid gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  <i v-else class="bi bi-check-circle me-2"></i>
                  {{ isSubmitting ? "Đang lưu..." : "Lưu sách" }}
                </button>
                <router-link to="/books" class="btn btn-outline-secondary">
                  <i class="bi bi-x-circle me-2"></i>
                  Hủy bỏ
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "BookCreate",
  setup() {
    const router = useRouter();
    const toast = useToast();

    const form = reactive({
      TenSach: "",
      TacGia: "",
      MoTa: "",
      DonGia: null,
      SoQuyen: null,
      NamXuatBan: new Date().getFullYear(),
      MaNXB: "",
      MaDM: "",
      BiaSach: null,
    });

    const errors = ref({});
    const categories = ref([]);
    const publishers = ref([]);
    const imagePreview = ref("");
    const isSubmitting = ref(false);

    // Methods
    const fetchCategories = async () => {
      try {
        const response = await api.get("/danhmuc/all");
        if (response.success) {
          categories.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchPublishers = async () => {
      try {
        const response = await api.get("/nhaxuatban/all");
        if (response.success) {
          publishers.value = response.data;
        }
      } catch (error) {
        console.error("Error fetching publishers:", error);
      }
    };

    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file) {
        handleFile(file);
      }
    };

    const handleFileDrop = (event) => {
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    };

    const handleFile = (file) => {
      // Validate file
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("Kích thước file không được vượt quá 2MB");
        return;
      }

      form.BiaSach = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.value = e.target.result;
      };
      reader.readAsDataURL(file);
    };

    const removeImage = () => {
      form.BiaSach = null;
      imagePreview.value = "";
    };

    const validateForm = () => {
      const newErrors = {};

      if (!form.TenSach?.trim()) {
        newErrors.TenSach = "Vui lòng nhập tên sách";
      }

      if (!form.TacGia?.trim()) {
        newErrors.TacGia = "Vui lòng nhập tên tác giả";
      }

      if (!form.NamXuatBan) {
        newErrors.NamXuatBan = "Vui lòng nhập năm xuất bản";
      } else if (
        form.NamXuatBan < 1900 ||
        form.NamXuatBan > new Date().getFullYear()
      ) {
        newErrors.NamXuatBan = "Năm xuất bản không hợp lệ";
      }

      if (!form.MaDM) {
        newErrors.MaDM = "Vui lòng chọn danh mục";
      }

      if (!form.MaNXB) {
        newErrors.MaNXB = "Vui lòng chọn nhà xuất bản";
      }

      if (!form.DonGia || form.DonGia <= 0) {
        newErrors.DonGia = "Vui lòng nhập đơn giá hợp lệ";
      }

      if (!form.SoQuyen || form.SoQuyen < 0) {
        newErrors.SoQuyen = "Vui lòng nhập số lượng hợp lệ";
      }

      errors.value = newErrors;
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
      if (!validateForm()) {
        toast.error("Vui lòng kiểm tra lại thông tin");
        return;
      }

      isSubmitting.value = true;

      try {
        const formData = new FormData();

        // Add form data
        Object.keys(form).forEach((key) => {
          if (form[key] !== null && form[key] !== "") {
            formData.append(key, form[key]);
          }
        });

        const response = await api.post("/sach", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.success) {
          toast.success("Thêm sách thành công!");
          router.push("/books");
        }
      } catch (error) {
        console.error("Error creating book:", error);

        if (error.response?.data?.errors) {
          errors.value = error.response.data.errors;
        } else {
          toast.error(
            error.response?.data?.message || "Có lỗi xảy ra khi thêm sách"
          );
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    // Lifecycle
    onMounted(() => {
      fetchCategories();
      fetchPublishers();
    });

    return {
      form,
      errors,
      categories,
      publishers,
      imagePreview,
      isSubmitting,
      handleFileSelect,
      handleFileDrop,
      removeImage,
      handleSubmit,
      formatCurrency,
    };
  },
};
</script>

<style scoped>
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #0d6efd;
  background-color: #f8f9fa;
}

.upload-area.has-image {
  padding: 0;
  border: none;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 250px;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.image-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-preview:hover .image-overlay {
  opacity: 1;
}

.upload-placeholder {
  text-align: center;
}

.form-label {
  font-weight: 600;
  color: #495057;
}

.text-danger {
  color: #dc3545 !important;
}

.admin-card {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem 0.5rem 0 0;
  border: none;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6c757d;
  margin-bottom: 0;
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
