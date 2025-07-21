<template>
  <div class="reports fade-in-up">
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">Báo cáo thống kê</h1>
          <p class="page-subtitle">Phân tích dữ liệu và tạo báo cáo</p>
        </div>
        <div class="d-flex gap-2">
          <button @click="exportReport" class="btn btn-success">
            <i class="bi bi-download me-2"></i>
            Xuất báo cáo
          </button>
          <button @click="refreshData" class="btn btn-outline-primary">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Làm mới
          </button>
        </div>
      </div>
    </div>

    <!-- Time Range Filter -->
    <div class="admin-card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label">Từ ngày</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="form-control"
              @change="fetchReports"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Đến ngày</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="form-control"
              @change="fetchReports"
            />
          </div>
          <div class="col-md-3">
            <label class="form-label">Khoảng thời gian</label>
            <select
              v-model="filters.period"
              class="form-select"
              @change="handlePeriodChange"
            >
              <option value="custom">Tùy chọn</option>
              <option value="today">Hôm nay</option>
              <option value="week">7 ngày qua</option>
              <option value="month">30 ngày qua</option>
              <option value="quarter">3 tháng qua</option>
              <option value="year">1 năm qua</option>
            </select>
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button
              @click="resetFilters"
              class="btn btn-outline-secondary w-100"
            >
              <i class="bi bi-arrow-clockwise me-1"></i>
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Overview Stats -->
    <div class="row mb-4">
      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card primary">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-primary">
                {{ overview.totalBorrows || 0 }}
              </div>
              <p class="stats-label">Tổng lượt mượn</p>
            </div>
            <i class="bi bi-arrow-repeat stats-icon text-primary"></i>
          </div>
          <div class="stats-change">
            <span :class="getChangeClass(overview.borrowsChange)">
              <i :class="getChangeIcon(overview.borrowsChange)"></i>
              {{ Math.abs(overview.borrowsChange || 0) }}%
            </span>
            <small class="text-muted ms-1">so với kỳ trước</small>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card success">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-success">
                {{ overview.newUsers || 0 }}
              </div>
              <p class="stats-label">Độc giả mới</p>
            </div>
            <i class="bi bi-person-plus stats-icon text-success"></i>
          </div>
          <div class="stats-change">
            <span :class="getChangeClass(overview.usersChange)">
              <i :class="getChangeIcon(overview.usersChange)"></i>
              {{ Math.abs(overview.usersChange || 0) }}%
            </span>
            <small class="text-muted ms-1">so với kỳ trước</small>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card warning">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-warning">
                {{ overview.newBooks || 0 }}
              </div>
              <p class="stats-label">Sách mới</p>
            </div>
            <i class="bi bi-book-half stats-icon text-warning"></i>
          </div>
          <div class="stats-change">
            <span :class="getChangeClass(overview.booksChange)">
              <i :class="getChangeIcon(overview.booksChange)"></i>
              {{ Math.abs(overview.booksChange || 0) }}%
            </span>
            <small class="text-muted ms-1">so với kỳ trước</small>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-3">
        <div class="stats-card info">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <div class="stats-number text-info">
                {{ overview.overdueBooks || 0 }}
              </div>
              <p class="stats-label">Sách quá hạn</p>
            </div>
            <i class="bi bi-exclamation-triangle stats-icon text-info"></i>
          </div>
          <div class="stats-change">
            <span :class="getChangeClass(-overview.overdueChange)">
              <i :class="getChangeIcon(-overview.overdueChange)"></i>
              {{ Math.abs(overview.overdueChange || 0) }}%
            </span>
            <small class="text-muted ms-1">so với kỳ trước</small>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <!-- Chart Section -->
      <div class="col-lg-8 mb-4">
        <div class="admin-card">
          <div
            class="card-header-custom d-flex justify-content-between align-items-center"
          >
            <h5 class="mb-0">
              <i class="bi bi-graph-up me-2"></i>
              Biểu đồ mượn sách theo thời gian
            </h5>
            <div class="btn-group" role="group">
              <input
                type="radio"
                class="btn-check"
                id="chart-day"
                v-model="chartPeriod"
                value="day"
              />
              <label class="btn btn-outline-primary btn-sm" for="chart-day"
                >Ngày</label
              >
              <input
                type="radio"
                class="btn-check"
                id="chart-week"
                v-model="chartPeriod"
                value="week"
              />
              <label class="btn btn-outline-primary btn-sm" for="chart-week"
                >Tuần</label
              >
              <input
                type="radio"
                class="btn-check"
                id="chart-month"
                v-model="chartPeriod"
                value="month"
              />
              <label class="btn btn-outline-primary btn-sm" for="chart-month"
                >Tháng</label
              >
            </div>
          </div>
          <div class="card-body">
            <div v-if="isLoadingChart" class="text-center p-5">
              <div class="spinner-border text-primary"></div>
              <div class="mt-2">Đang tải biểu đồ...</div>
            </div>
            <div
              v-else-if="chartData.length === 0"
              class="text-center p-5 text-muted"
            >
              <i class="bi bi-graph-up display-4 d-block mb-3"></i>
              <p>Không có dữ liệu để hiển thị biểu đồ</p>
            </div>
            <div v-else class="chart-container">
              <!-- Simple Chart Implementation -->
              <canvas ref="chartCanvas" width="800" height="400"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Books & Categories -->
      <div class="col-lg-4">
        <!-- Top Books -->
        <div class="admin-card mb-4">
          <div class="card-header-custom">
            <h6 class="mb-0">
              <i class="bi bi-star me-2"></i>
              Top sách được mượn
            </h6>
          </div>
          <div class="card-body">
            <div v-if="topBooks.length === 0" class="text-center text-muted">
              <i class="bi bi-inbox display-6 d-block mb-2"></i>
              <small>Chưa có dữ liệu</small>
            </div>
            <div v-else>
              <div
                v-for="(book, index) in topBooks"
                :key="book._id"
                class="d-flex align-items-center mb-3"
              >
                <div class="ranking-number me-3">
                  {{ index + 1 }}
                </div>
                <div class="flex-grow-1">
                  <div class="fw-medium text-truncate">{{ book.TenSach }}</div>
                  <small class="text-muted">{{ book.TacGia }}</small>
                  <div class="text-primary small">
                    <i class="bi bi-heart-fill me-1"></i>
                    {{ book.soLanMuon }} lượt
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Categories -->
        <div class="admin-card">
          <div class="card-header-custom">
            <h6 class="mb-0">
              <i class="bi bi-grid-3x3-gap me-2"></i>
              Top danh mục
            </h6>
          </div>
          <div class="card-body">
            <div
              v-if="topCategories.length === 0"
              class="text-center text-muted"
            >
              <i class="bi bi-inbox display-6 d-block mb-2"></i>
              <small>Chưa có dữ liệu</small>
            </div>
            <div v-else>
              <div
                v-for="(category, index) in topCategories"
                :key="category._id"
                class="d-flex align-items-center justify-content-between mb-3"
              >
                <div class="d-flex align-items-center">
                  <div class="ranking-number me-3">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <div class="fw-medium">{{ category.TenDM }}</div>
                    <small class="text-muted"
                      >{{ category.soLanMuon }} lượt mượn</small
                    >
                  </div>
                </div>
                <div class="progress" style="width: 60px; height: 8px">
                  <div
                    class="progress-bar bg-primary"
                    :style="{
                      width:
                        getProgressWidth(
                          category.soLanMuon,
                          topCategories[0].soLanMuon
                        ) + '%',
                    }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Tables -->
    <div class="row mt-4">
      <!-- Monthly Summary -->
      <div class="col-lg-6 mb-4">
        <div class="admin-card">
          <div class="card-header-custom">
            <h6 class="mb-0">
              <i class="bi bi-calendar3 me-2"></i>
              Thống kê theo tháng
            </h6>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Tháng</th>
                    <th>Lượt mượn</th>
                    <th>Độc giả mới</th>
                    <th>Sách mới</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="month in monthlyStats" :key="month.month">
                    <td>{{ formatMonth(month.month) }}</td>
                    <td>
                      <span class="badge bg-primary">{{ month.borrows }}</span>
                    </td>
                    <td>
                      <span class="badge bg-success">{{ month.newUsers }}</span>
                    </td>
                    <td>
                      <span class="badge bg-warning">{{ month.newBooks }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- User Activity -->
      <div class="col-lg-6 mb-4">
        <div class="admin-card">
          <div class="card-header-custom">
            <h6 class="mb-0">
              <i class="bi bi-people me-2"></i>
              Top độc giả hoạt động
            </h6>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-sm mb-0">
                <thead class="table-light">
                  <tr>
                    <th>#</th>
                    <th>Độc giả</th>
                    <th>Số lần mượn</th>
                    <th>Điểm hoạt động</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(user, index) in topUsers" :key="user._id">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div class="fw-medium">{{ getFullName(user) }}</div>
                      <small class="text-muted">{{ user.Email }}</small>
                    </td>
                    <td>
                      <span class="badge bg-info">{{ user.soLanMuon }}</span>
                    </td>
                    <td>
                      <div class="progress" style="height: 6px">
                        <div
                          class="progress-bar bg-success"
                          :style="{
                            width:
                              getProgressWidth(user.diemHoatDong, 100) + '%',
                          }"
                        ></div>
                      </div>
                      <small>{{ user.diemHoatDong }}/100</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useToast } from "vue-toastification";
import api from "@/services/api";

export default {
  name: "Reports",
  setup() {
    const toast = useToast();

    const overview = ref({});
    const topBooks = ref([]);
    const topCategories = ref([]);
    const topUsers = ref([]);
    const monthlyStats = ref([]);
    const chartData = ref([]);
    const isLoading = ref(false);
    const isLoadingChart = ref(false);
    const chartPeriod = ref("month");
    const chartCanvas = ref(null);

    const filters = reactive({
      startDate: "",
      endDate: "",
      period: "month",
    });

    // Computed
    const dateRange = computed(() => {
      const now = new Date();
      const start = new Date();

      switch (filters.period) {
        case "today":
          return {
            start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            end: now,
          };
        case "week":
          start.setDate(now.getDate() - 7);
          return { start, end: now };
        case "month":
          start.setDate(now.getDate() - 30);
          return { start, end: now };
        case "quarter":
          start.setMonth(now.getMonth() - 3);
          return { start, end: now };
        case "year":
          start.setFullYear(now.getFullYear() - 1);
          return { start, end: now };
        default:
          return {
            start: filters.startDate ? new Date(filters.startDate) : start,
            end: filters.endDate ? new Date(filters.endDate) : now,
          };
      }
    });

    // Methods
    const fetchReports = async () => {
      try {
        isLoading.value = true;

        const params = {
          startDate: dateRange.value.start.toISOString().split("T")[0],
          endDate: dateRange.value.end.toISOString().split("T")[0],
        };

        const [
          overviewRes,
          topBooksRes,
          topCategoriesRes,
          topUsersRes,
          monthlyRes,
        ] = await Promise.all([
          api.get("/thongke/overview", { params }),
          api.get("/thongke/top-books", { params: { ...params, limit: 5 } }),
          api.get("/thongke/top-categories", {
            params: { ...params, limit: 5 },
          }),
          api.get("/thongke/top-users", { params: { ...params, limit: 5 } }),
          api.get("/thongke/monthly", { params }),
        ]);

        if (overviewRes.success) overview.value = overviewRes.data;
        if (topBooksRes.success) topBooks.value = topBooksRes.data;
        if (topCategoriesRes.success)
          topCategories.value = topCategoriesRes.data;
        if (topUsersRes.success) topUsers.value = topUsersRes.data;
        if (monthlyRes.success) monthlyStats.value = monthlyRes.data;
      } catch (error) {
        console.error("Error fetching reports:", error);
        toast.error("Có lỗi khi tải báo cáo");
      } finally {
        isLoading.value = false;
      }
    };

    const fetchChartData = async () => {
      try {
        isLoadingChart.value = true;

        const params = {
          startDate: dateRange.value.start.toISOString().split("T")[0],
          endDate: dateRange.value.end.toISOString().split("T")[0],
          period: chartPeriod.value,
        };

        const response = await api.get("/thongke/chart-data", { params });

        if (response.success) {
          chartData.value = response.data;
          await nextTick();
          drawChart();
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        isLoadingChart.value = false;
      }
    };

    const drawChart = () => {
      if (!chartCanvas.value || chartData.value.length === 0) return;

      const canvas = chartCanvas.value;
      const ctx = canvas.getContext("2d");
      const width = canvas.width;
      const height = canvas.height;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Chart settings
      const padding = 60;
      const chartWidth = width - 2 * padding;
      const chartHeight = height - 2 * padding;

      // Find max value
      const maxValue = Math.max(...chartData.value.map((d) => d.value));
      const stepY = chartHeight / maxValue;
      const stepX = chartWidth / (chartData.value.length - 1);

      // Draw axes
      ctx.strokeStyle = "#dee2e6";
      ctx.lineWidth = 1;

      // Y axis
      ctx.beginPath();
      ctx.moveTo(padding, padding);
      ctx.lineTo(padding, height - padding);
      ctx.stroke();

      // X axis
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      ctx.lineTo(width - padding, height - padding);
      ctx.stroke();

      // Draw grid lines
      ctx.strokeStyle = "#f8f9fa";
      for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();

        // Y labels
        ctx.fillStyle = "#6c757d";
        ctx.font = "12px Arial";
        ctx.textAlign = "right";
        ctx.fillText(
          Math.round(maxValue - (maxValue / 5) * i),
          padding - 10,
          y + 4
        );
      }

      // Draw line
      ctx.strokeStyle = "#007bff";
      ctx.lineWidth = 3;
      ctx.beginPath();

      chartData.value.forEach((point, index) => {
        const x = padding + stepX * index;
        const y = height - padding - point.value * stepY;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // Draw points
        ctx.fillStyle = "#007bff";
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();

        // X labels
        ctx.fillStyle = "#6c757d";
        ctx.font = "11px Arial";
        ctx.textAlign = "center";
        ctx.fillText(point.label, x, height - padding + 20);
      });

      ctx.stroke();
    };

    const handlePeriodChange = () => {
      if (filters.period !== "custom") {
        filters.startDate = "";
        filters.endDate = "";
      }
      fetchReports();
      fetchChartData();
    };

    const resetFilters = () => {
      filters.startDate = "";
      filters.endDate = "";
      filters.period = "month";
      fetchReports();
      fetchChartData();
    };

    const refreshData = () => {
      fetchReports();
      fetchChartData();
    };

    const exportReport = async () => {
      try {
        toast.info("Đang tạo báo cáo...");

        const params = {
          startDate: dateRange.value.start.toISOString().split("T")[0],
          endDate: dateRange.value.end.toISOString().split("T")[0],
          format: "excel",
        };

        const response = await api.get("/thongke/export", {
          params,
          responseType: "blob",
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          `bao-cao-thong-ke-${params.startDate}-${params.endDate}.xlsx`
        );
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Xuất báo cáo thành công");
      } catch (error) {
        console.error("Error exporting report:", error);
        toast.error("Có lỗi khi xuất báo cáo");
      }
    };

    // Helper functions
    const getChangeClass = (change) => {
      if (change > 0) return "text-success";
      if (change < 0) return "text-danger";
      return "text-muted";
    };

    const getChangeIcon = (change) => {
      if (change > 0) return "bi bi-arrow-up";
      if (change < 0) return "bi bi-arrow-down";
      return "bi bi-dash";
    };

    const getProgressWidth = (value, max) => {
      return max > 0 ? (value / max) * 100 : 0;
    };

    const getFullName = (user) => {
      return `${user.HoLot || ""} ${user.Ten || ""}`.trim();
    };

    const formatMonth = (monthStr) => {
      const [year, month] = monthStr.split("-");
      return `${month}/${year}`;
    };

    // Watch for chart period changes
    watch(chartPeriod, fetchChartData);

    // Set default date range
    const setDefaultDates = () => {
      const now = new Date();
      const lastMonth = new Date();
      lastMonth.setMonth(now.getMonth() - 1);

      filters.endDate = now.toISOString().split("T")[0];
      filters.startDate = lastMonth.toISOString().split("T")[0];
    };

    // Lifecycle
    onMounted(() => {
      setDefaultDates();
      fetchReports();
      fetchChartData();
    });

    return {
      overview,
      topBooks,
      topCategories,
      topUsers,
      monthlyStats,
      chartData,
      isLoading,
      isLoadingChart,
      chartPeriod,
      chartCanvas,
      filters,
      fetchReports,
      fetchChartData,
      handlePeriodChange,
      resetFilters,
      refreshData,
      exportReport,
      getChangeClass,
      getChangeIcon,
      getProgressWidth,
      getFullName,
      formatMonth,
    };
  },
};
</script>

<style scoped>
.stats-change {
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

.ranking-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #0056b3);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.progress {
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.6s ease;
}
</style>
