<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
    @click.self="closeModal"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEdit ? "Chỉnh sửa nhà xuất bản" : "Thêm nhà xuất bản mới" }}
          </h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="modal-body">
            <div class="mb-3">
              <label for="tenNXB" class="form-label">Tên nhà xuất bản *</label>
              <input
                type="text"
                class="form-control"
                id="tenNXB"
                v-model="form.TenNXB"
                required
                :class="{ 'is-invalid': errors.TenNXB }"
                placeholder="Nhập tên nhà xuất bản..."
              />
              <div v-if="errors.TenNXB" class="invalid-feedback">
                {{ errors.TenNXB }}
              </div>
            </div>

            <div class="mb-3">
              <label for="diaChi" class="form-label">Địa chỉ *</label>
              <textarea
                class="form-control"
                id="diaChi"
                v-model="form.DiaChi"
                required
                :class="{ 'is-invalid': errors.DiaChi }"
                placeholder="Nhập địa chỉ nhà xuất bản..."
                rows="3"
              ></textarea>
              <div v-if="errors.DiaChi" class="invalid-feedback">
                {{ errors.DiaChi }}
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              @click="closeModal"
              :disabled="loading"
            >
              Hủy
            </button>
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="
                loading || !form.TenNXB?.trim() || !form.DiaChi?.trim()
              "
            >
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{ isEdit ? "Cập nhật" : "Thêm mới" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "PublisherModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    publisher: {
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

    const loading = ref(false);
    const form = reactive({
      TenNXB: "",
      DiaChi: "",
    });
    const errors = reactive({});

    // Methods
    const clearErrors = () => {
      Object.keys(errors).forEach((key) => {
        delete errors[key];
      });
    };

    const resetForm = () => {
      form.TenNXB = "";
      form.DiaChi = "";
      clearErrors();
    };

    const validateForm = () => {
      clearErrors();
      let isValid = true;

      if (!form.TenNXB?.trim()) {
        errors.TenNXB = "Tên nhà xuất bản là bắt buộc";
        isValid = false;
      } else if (form.TenNXB.trim().length < 2) {
        errors.TenNXB = "Tên nhà xuất bản phải có ít nhất 2 ký tự";
        isValid = false;
      }

      if (!form.DiaChi?.trim()) {
        errors.DiaChi = "Địa chỉ là bắt buộc";
        isValid = false;
      } else if (form.DiaChi.trim().length < 5) {
        errors.DiaChi = "Địa chỉ phải có ít nhất 5 ký tự";
        isValid = false;
      }

      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      loading.value = true;

      try {
        const submitData = {
          TenNXB: form.TenNXB.trim(),
          DiaChi: form.DiaChi.trim(),
        };

        let response;

        if (props.isEdit && props.publisher?._id) {
          response = await api.put(
            `/nhaxuatban/${props.publisher._id}`,
            submitData
          );
        } else {
          response = await api.post("/nhaxuatban", submitData);
        }

        if (response.success) {
          toast.success(
            props.isEdit
              ? "Cập nhật nhà xuất bản thành công!"
              : "Thêm nhà xuất bản mới thành công!"
          );
          emit("saved");
        }
      } catch (error) {
        console.error("Error saving publisher:", error);

        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error(
            props.isEdit
              ? "Có lỗi khi cập nhật nhà xuất bản!"
              : "Có lỗi khi thêm nhà xuất bản mới!"
          );
        }
      } finally {
        loading.value = false;
      }
    };

    const closeModal = () => {
      emit("close");
    };

    // Watch for prop changes
    watch(
      () => props.publisher,
      (newPublisher) => {
        if (newPublisher && props.isEdit) {
          form.TenNXB = newPublisher.TenNXB || "";
          form.DiaChi = newPublisher.DiaChi || "";
        } else {
          resetForm();
        }
      },
      { immediate: true }
    );

    watch(
      () => props.show,
      (show) => {
        if (!show) {
          resetForm();
        }
      }
    );

    return {
      loading,
      form,
      errors,
      validateForm,
      handleSubmit,
      closeModal,
      resetForm,
    };
  },
};
</script>
