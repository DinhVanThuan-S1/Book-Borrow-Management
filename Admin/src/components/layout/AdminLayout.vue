<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <AdminSidebar
      :collapsed="sidebarCollapsed"
      :show="sidebarShow"
      @close="sidebarShow = false"
    />

    <!-- Main Content -->
    <div class="main-content" :class="{ expanded: sidebarCollapsed }">
      <!-- Header -->
      <AdminHeader
        @toggle-sidebar="toggleSidebar"
        @show-sidebar="sidebarShow = true"
      />

      <!-- Page Content -->
      <div class="page-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from "vue";
import AdminSidebar from "./AdminSidebar.vue";
import AdminHeader from "./AdminHeader.vue";

export default {
  name: "AdminLayout",
  components: {
    AdminSidebar,
    AdminHeader,
  },
  setup() {
    const sidebarCollapsed = ref(false);
    const sidebarShow = ref(false);

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value;
    };

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        sidebarCollapsed.value = false;
        sidebarShow.value = false;
      }
    };

    onMounted(() => {
      window.addEventListener("resize", handleResize);
      handleResize();
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
    });

    return {
      sidebarCollapsed,
      sidebarShow,
      toggleSidebar,
    };
  },
};
</script>
