<template>
  <div
    class="modal fade"
    id="publisherBooksModal"
    tabindex="-1"
    aria-labelledby="publisherBooksModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="publisherBooksModalLabel">
            Sách của {{ publisher?.TenNXB }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
          </div>
          <div v-else-if="books.length === 0" class="text-center text-muted">
            <i class="fas fa-book fa-3x mb-3"></i>
            <p>Nhà xuất bản này chưa có sách nào</p>
          </div>
          <div v-else>
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Năm XB</th>
                    <th>Số lượng</th>
                    <th>Giá</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in books" :key="book._id">
                    <td>{{ book.TenSach }}</td>
                    <td>{{ book.TacGia }}</td>
                    <td>{{ book.NamXuatBan }}</td>
                    <td>{{ book.SoQuyen }}</td>
                    <td>{{ formatCurrency(book.DonGia) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PublisherBooksModal",
  props: {
    publisher: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      books: [],
      loading: false,
    };
  },
  watch: {
    publisher: {
      handler(newVal) {
        if (newVal) {
          this.loadBooks();
        }
      },
      immediate: true,
    },
  },
  methods: {
    async loadBooks() {
      if (!this.publisher?._id) return;

      this.loading = true;
      try {
        this.$emit("load-books", this.publisher._id);
      } finally {
        this.loading = false;
      }
    },
    formatCurrency(amount) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    },
    setBooks(books) {
      this.books = books;
      this.loading = false;
    },
  },
};
</script>
