<template>
  <div class="app">
    <div class="content">
      <router-view />
    </div>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <button
        v-for="menu in menus"
        :key="menu.name"
        class="nav-item"
        :class="{ active: isActive(menu) }"
        @click="onSelect(menu)"
      >
        {{ menu.name }}
      </button>

      <button class="nav-item home" @click="goHome">Home</button>
    </nav>

    <!-- Overlay Menu -->
    <transition name="menu-slide">
      <div v-if="isMenuOpen" class="overlay" @click.self="closeMenu">
        <div class="overlay-panel">
          <button
            v-for="child in activeMenu?.children"
            :key="child.path"
            class="overlay-item"
            @click="navigate(child.path)"
          >
            {{ child.name }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import "@/assets/styles/navigation.css";
import "@/assets/styles/layout.css";

const router = useRouter();
const route = useRoute();

const menus = ref([
  {
    name: "Util",
    children: [
      { name: "Todo", path: "/todo" },
      { name: "S3", path: "/s3" },
    ],
  },
]);

const isMenuOpen = ref(false);
const activeMenu = ref(null);

const isActive = (menu) =>
  menu.children.some((child) => child.path === route.path);

const onSelect = (menu) => {
  activeMenu.value = menu;
  isMenuOpen.value = true;
};

const closeMenu = () => {
  isMenuOpen.value = false;
  activeMenu.value = null;
};

const navigate = (path) => {
  router.push(path);
  closeMenu();
};

const goHome = () => {
  router.push("/");
  closeMenu();
};
</script>
