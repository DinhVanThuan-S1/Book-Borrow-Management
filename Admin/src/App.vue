<template>
  <div id="app">
    <router-view />

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner-border loading-spinner text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from "@/stores/auth";
import { onMounted, computed } from "vue";

export default {
  name: "App",
  setup() {
    const authStore = useAuthStore();

    const isLoading = computed(() => authStore.isLoading);

    onMounted(() => {
      // Initialize auth from localStorage
      authStore.initializeAuth();
    });

    return {
      isLoading,
    };
  },
};
</script>
