<template>
  <div class="client-layout">
    <!-- Header -->
    <ClientHeader />

    <!-- Main Content -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- Footer -->
    <ClientFooter />

    <!-- Scroll to Top Button -->
    <ScrollToTop />

    <!-- Loading Overlay -->
    <div v-if="isGlobalLoading" class="loading-overlay">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <div class="mt-3">Đang tải...</div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import ClientHeader from "./ClientHeader.vue";
import ClientFooter from "./ClientFooter.vue";
import ScrollToTop from "@/components/common/ScrollToTop.vue";

export default {
  name: "ClientLayout",
  components: {
    ClientHeader,
    ClientFooter,
    ScrollToTop,
  },
  setup() {
    const authStore = useAuthStore();

    const isGlobalLoading = computed(() => {
      return document.body.classList.contains("loading");
    });

    return {
      isGlobalLoading,
    };
  },
};
</script>

<style scoped>
.client-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
}
</style>
