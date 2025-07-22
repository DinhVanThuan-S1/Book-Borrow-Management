<template>
  <div
    v-if="show"
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5)"
    @click.self="closeModal"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Sách của {{ publisher?.TenNXB }}</h5>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <div class="modal-body">
          <!-- Loading -->
          <div v-if="isLoading" class="text-center p-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <div class="mt-2">Đang tải danh sách sách...</div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="books.length === 0"
            class="text-center p-4 text-muted"
          >
            <i class="bi bi-book display-4 d-block mb-3"></i>
            <h6>Chưa có sách nào</h6>
            <p>Nhà xuất bản này chưa có sách nào trong hệ thống</p>
          </div>

          <!-- Books List -->
          <div v-else>
            <div class="row g-3">
              <div v-for="book in books" :key="book._id" class="col-md-6">
                <div class="card h-100">
                  <div class="row g-0 h-100">
                    <div class="col-4">
                      <img
                        :src="getBookImage(book.BiaSach)"
                        :alt="book.TenSach"
                        class="img-fluid rounded-start h-100"
                        style="object-fit: cover"
                      />
                    </div>
                    <div class="col-8">
                      <div class="card-body p-3 d-flex flex-column h-100">
                        <h6 class="card-title mb-2">{{ book.TenSach }}</h6>
                        <p class="card-text">
                          <small class="text-muted">
                            <i class="bi bi-person me-1"></i>
                            {{ book.TacGia }}
                          </small>
                        </p>
                        <p class="card-text">
                          <small class="text-muted">
                            <i class="bi bi-calendar me-1"></i>
                            {{ book.NamXuatBan }}
                          </small>
                        </p>
                        <div class="mt-auto">
                          <div
                            class="d-flex justify-content-between align-items-center"
                          >
                            <span class="badge bg-primary"
                              >{{ book.SoQuyen }} quyển</span
                            >
                            <router-link
                              :to="`/books/${book._id}`"
                              class="btn btn-sm btn-outline-primary"
                              @click="closeModal"
                            >
                              Xem chi tiết
                            </router-link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <div class="d-flex justify-content-between align-items-center w-100">
            <span class="text-muted"> Tổng cộng: {{ books.length }} sách </span>
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "PublisherBooksModal",
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    publisher: {
      type: Object,
      default: null,
    },
  },
  emits: ["close"],
  setup(props, { emit }) {
    const toast = useToast();

    const books = ref([]);
    const isLoading = ref(false);

    // Methods
    const fetchBooks = async () => {
      if (!props.publisher?._id) return;

      try {
        isLoading.value = true;
        console.log("Fetching books for publisher:", props.publisher);

        const response = await api.get("/sach", {
          params: {
            nhaxuatban: props.publisher._id,
            limit: 100, // Lấy nhiều sách để hiển thị
          },
        });

        console.log("API response:", response);

        if (response.success) {
          books.value = response.data || [];
          console.log("Books found:", books.value.length);
        }
      } catch (error) {
        console.error("Error fetching books:", error);

        // Thử với API riêng của nhà xuất bản
        try {
          console.log("Trying fallback API...");
          const fallbackResponse = await api.get(
            `/nhaxuatban/${props.publisher._id}/books`
          );
          console.log("Fallback response:", fallbackResponse);

          if (fallbackResponse.success) {
            books.value = fallbackResponse.data || [];
            console.log("Fallback books found:", books.value.length);
          }
        } catch (fallbackError) {
          console.error("Fallback API also failed:", fallbackError);
          toast.error("Có lỗi khi tải danh sách sách");
        }
      } finally {
        isLoading.value = false;
      }
    };

    const getBookImage = (imagePath) => {
      if (!imagePath) return "/src/assets/images/book-placeholder.jpg";
      if (imagePath.startsWith("http")) return imagePath;
      return `http://localhost:5000${imagePath}`;
    };

    const closeModal = () => {
      emit("close");
    };

    // Watch for prop changes
    watch(
      () => props.show,
      (show) => {
        if (show && props.publisher) {
          fetchBooks();
        } else {
          books.value = [];
        }
      }
    );

    return {
      books,
      isLoading,
      getBookImage,
      closeModal,
    };
  },
};
</script>

<style scoped>
.card {
  transition: transform 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
}
</style>
