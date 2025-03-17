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
        @touchstart="startHold(menu, $event)"
        @mousedown="startHold(menu, $event)"
        @touchmove="optimizedTouchMove"
        @mousemove="optimizedTouchMove"
        @touchend="selectMenu"
        @mouseup="selectMenu"
        @mouseleave="resetMenu"
      >
        {{ menu.name }}
      </div>

      <router-link to="/" class="home-button">Home</router-link>
    </nav>

    <!-- 트리 메뉴 (고정된 위치) -->
    <transition name="menu-fade">
      <div
        v-if="isMenuVisible"
        class="tree-menu"
        :style="{
          left: `${touchPosition.x}px`,
          top: `${touchPosition.y - 60}px`,
        }"
      >
        <div
          v-for="(child, index) in activeMenu.children"
          :key="child.name"
          class="tree-item"
          :class="{ selected: index === selectedIndex }"
          :style="{ transform: `translateY(-${index * 120}px) scale(1.1)` }"
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

const router = useRouter();

const menus = ref([
  {
    name: "Legacy",
    children: [
      { name: "QR", path: "/qr" },
      { name: "ColorPicker", path: "/colorPicker" },
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
    ],
  },
]);

const activeMenu = ref(null);
const touchPosition = ref({ x: 0, y: 0 });
const selectedIndex = ref(null);
const isMenuVisible = ref(false);
let holdTimeout = null;

const startHold = (menu, event) => {
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
    document.querySelector(".content").style.overflow = "hidden"; // 스크롤 방지
  }, 100);
};

const moveSelection = (event) => {
  if (!isMenuVisible.value || !activeMenu.value) return;

  const touchY = event.touches ? event.touches[0].clientY : event.clientY;
  const startY = touchPosition.value.y;
  const moveDistance = startY - touchY; // Y축 기준으로 변경

  const threshold = 20; // 터치 감도 조정
  if (Math.abs(moveDistance) < threshold) return;

  const totalItems = activeMenu.value.children.length;
  const spreadFactor = 80;
  const index = Math.min(
    totalItems - 1,
    Math.max(0, Math.floor(moveDistance / spreadFactor)),
  );

  selectedIndex.value = index;
};

// 터치 이벤트 최적화 (Y축 전용)
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
  document.querySelector(".content").style.overflow = "auto"; // 스크롤 복구
  clearTimeout(holdTimeout);
};
</script>

<style scoped>
/* 전체 레이아웃 */
.app {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

/* 라우터 페이지 컨텐츠 */
.content {
  flex: 1;
  height: 100%;
  overflow: hidden; /* 네비게이션을 제외한 높이 */
  overflow-y: auto;
  padding-bottom: 6vh; /* 네비게이션 가리지 않도록 */
}

/* 하단 네비게이션 */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 6vh;
  display: flex;
  justify-content: space-around;
  background: #1e1e1e;
  padding: 10px 0;
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
  align-items: center;
}

/* 네비게이션 아이템 크기 확대 */
.nav-item {
  cursor: pointer;
  padding: 10px 20px; /* 기존보다 크기를 키움 */
  font-size: 20px; /* 글자 크기도 증가 */
}

/* 네비게이션 아이템 hover 효과 */
.nav-item:hover {
  color: #42b983;
}

/* 홈 버튼 */
.home-button {
  font-size: 18px;
  font-weight: bold;
  text-decoration: none;
  color: white;
  padding: 10px;
  transition: color 0.3s ease;
}

.home-button:hover {
  color: #42b983;
}

/* 트리 메뉴 */
.tree-menu {
  position: fixed; /* 화면 크기에 관계없이 떠 있도록 설정 */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 10px;
  z-index: 1000;
  pointer-events: none;
}

/* 트리 아이템 크기 확대 */
.tree-item {
  font-size: 30px; /* 글자 크기 증가 */
  color: white;
  text-align: center;
  margin: 8px 0;
  transition:
    font-weight 0.1s ease,
    transform 0.3s ease-out; /* 부드러운 애니메이션 */
  pointer-events: auto;
}

/* 선택 강조 (볼드 효과) */
.tree-item.selected {
  font-weight: bold;
}

/* 애니메이션 (메뉴 등장) */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
</style>
