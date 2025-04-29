<template>
  <div class="app">
    <!-- 메인 컨텐츠 (라우터 뷰) -->
    <div class="content">
      <router-view />
    </div>

    <!-- 하단 네비게이션 -->
    <nav class="bottom-nav">
      <div
        v-for="menu in menus"
        :key="menu.name"
        class="nav-item"
        @click="desktopSelectMenu(menu)"
        @touchstart="startHold(menu, $event)"
        @mousedown="startHold(menu, $event)"
        @touchmove="optimizedTouchMove"
        @mousemove="moveSelection"
        @touchend="selectMenu"
        @mouseup="selectMenu"
        @mouseleave="handleMouseLeave"
      >
        {{ menu.name }}
      </div>
      <router-link to="/" class="home-button" active-class="active">
        <span class="sr-only">홈</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </router-link>
    </nav>

    <!-- 트리 메뉴 (고정된 위치) -->
    <transition name="menu-fade">
      <div
        v-if="isMenuVisible"
        class="tree-menu"
        :style="{
          left: `${touchPosition.x}px`,
          bottom: `calc(var(--bottom-nav-height) + env(safe-area-inset-bottom))`,
        }"
      >
        <div
          v-for="(child, index) in activeMenu?.children"
          :key="child.name"
          class="tree-item"
          :class="{ selected: index === selectedIndex }"
          :style="{ transform: `translateY(-${index * 48}px)` }"
          @click="selectTreeItem(index)"
        >
          {{ child.name }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import "@/assets/styles/navigation.css";
import "@/assets/styles/layout.css";

const router = useRouter();

const menus = ref([
  {
    name: "Legacy",
    children: [
      { name: "Put-private", path: "/put" },
      { name: "Get-private", path: "/get" },
      { name: "Put-public", path: "/save" },
      { name: "Get-public", path: "/list" },
    ],
  },
  {
    name: "Util",
    children: [
      { name: "Todo", path: "/todo" },
      { name: "Upload", path: "/upload" },
      { name: "S3", path: "/s3" },
    ],
  },
]);

const activeMenu = ref(null);
const touchPosition = ref({ x: 0, y: 0 });
const selectedIndex = ref(null);
const isMenuVisible = ref(false);
let holdTimeout = null;

const startHold = (menu, event) => {
  event.preventDefault();
  selectedIndex.value = null;
  activeMenu.value = menu;

  const rect = event.target.getBoundingClientRect();
  touchPosition.value = {
    x: Math.max(
      80,
      Math.min(window.innerWidth - 80, rect.left + rect.width / 2),
    ),
    y: rect.top,
  };

  holdTimeout = setTimeout(() => {
    isMenuVisible.value = true;
  }, 100);
};

const moveSelection = (event) => {
  if (!isMenuVisible.value || !activeMenu.value) return;

  const touchY = event.touches ? event.touches[0].clientY : event.clientY;
  const startY = touchPosition.value.y;
  const moveDistance = startY - touchY;

  const threshold = 20;
  if (Math.abs(moveDistance) < threshold) return;

  const totalItems = activeMenu.value.children.length;
  const spreadFactor = 80;
  const index = Math.min(
    totalItems - 1,
    Math.max(0, Math.floor(moveDistance / spreadFactor)),
  );

  selectedIndex.value = index;
};

const optimizedTouchMove = (event) => {
  event.preventDefault();
  moveSelection(event);
};

const selectMenu = () => {
  if (selectedIndex.value !== null && activeMenu.value) {
    const selectedPath = activeMenu.value.children[selectedIndex.value].path;
    router.push(selectedPath);
  }
  resetMenu();
};

const resetMenu = () => {
  activeMenu.value = null;
  selectedIndex.value = null;
  isMenuVisible.value = false;
  clearTimeout(holdTimeout);
};

// 모바일에서만 mouseleave로 메뉴 닫기
const handleMouseLeave = (event) => {
  if (window.innerWidth <= 600) {
    resetMenu();
  }
};

// 데스크탑 클릭 메뉴 활성화 (600px 초과만), 토글 기능 추가
const desktopSelectMenu = (menu) => {
  if (window.innerWidth > 600) {
    if (activeMenu.value === menu && isMenuVisible.value) {
      resetMenu();
    } else {
      activeMenu.value = menu;
      isMenuVisible.value = true;
    }
  }
};

// 트리 메뉴 항목 클릭 시 라우팅
const selectTreeItem = (index) => {
  if (activeMenu.value && activeMenu.value.children[index]) {
    const selectedPath = activeMenu.value.children[index].path;
    router.push(selectedPath);
    resetMenu();
  }
};
</script>
