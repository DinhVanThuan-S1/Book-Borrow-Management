<template>
  <div class="sidebar" :class="{ collapsed: collapsed, show: show }">
    <!-- Sidebar Header -->
    <div class="sidebar-header">
      <h4 v-if="!collapsed">
        <i class="bi bi-book text-warning me-2"></i>
        Library Admin
      </h4>
      <i v-else class="bi bi-book text-warning" style="font-size: 1.5rem"></i>
    </div>

    <!-- Navigation Menu -->
    <nav class="sidebar-nav">
      <ul class="nav flex-column">
        <li class="nav-item" v-for="item in menuItems" :key="item.name">
          <router-link
            :to="{ name: item.name }"
            class="nav-link"
            :class="{ active: isActiveRoute(item.name) }"
            @click="$emit('close')"
          >
            <i class="nav-icon" :class="item.icon"></i>
            <span class="nav-text">{{ item.title }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

export default {
  name: "AdminSidebar",
  props: {
    collapsed: {
      type: Boolean,
      default: false,
    },
    show: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["close"],
  setup() {
    const route = useRoute();
    const authStore = useAuthStore();

    const menuItems = computed(() => {
      const items = [
        {
          name: "Dashboard",
          title: "Dashboard",
          icon: "bi bi-house-door",
        },
        {
          name: "BookList",
          title: "Book Management",
          icon: "bi bi-book",
        },
        {
          name: "CategoryList",
          title: "Category Management",
          icon: "bi bi-grid-3x3-gap",
        },
        {
          name: "PublisherList",
          title: "Publisher Management",
          icon: "bi bi-building",
        },
        {
          name: "UserList",
          title: "Reader Management",
          icon: "bi bi-people",
        },
        {
          name: "BorrowList",
          title: "Borrow Management",
          icon: "bi bi-arrow-left-right",
        },
      ];

      // Add staff management for admin only
      if (authStore.isAdmin) {
        items.splice(5, 0, {
          name: "StaffList",
          title: "Staff Management",
          icon: "bi bi-person-badge",
        });
      }

      return items;
    });

    const isActiveRoute = (routeName) => {
      if (route.name === routeName) return true;

      // Check for parent routes
      const parentRoutes = {
        BookList: ["BookCreate", "BookEdit"],
        CategoryList: ["CategoryCreate", "CategoryEdit"],
        PublisherList: ["PublisherCreate", "PublisherEdit"],
        UserList: ["UserCreate", "UserEdit"],
        StaffList: ["StaffCreate", "StaffEdit"],
      };

      return parentRoutes[routeName]?.includes(route.name) || false;
    };

    return {
      menuItems,
      isActiveRoute,
    };
  },
};
</script>
