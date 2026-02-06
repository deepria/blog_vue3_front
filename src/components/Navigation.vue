<template>
  <!-- 이 컴포넌트는 콘텐츠 표시, 하단 내비게이션, 하위 메뉴 탐색을 위한 오버레이 메뉴를 포함한 주요 앱 레이아웃 관리를 담당합니다 -->
  <div class="app">
    <div class="content">
      <router-view />
    </div>

    <!-- 하단 내비게이션은 주요 메뉴 카테고리에 빠르게 접근할 수 있도록 하며, 엄지손가락 닿기 최적화와 지속적인 가시성을 제공합니다 -->
    <nav class="bottom-nav">
      <button
        v-for="menu in menus"
        :key="menu.name"
        class="nav-item"
        :class="{ active: isActive(menu) }"
        @click="onSelect(menu)"
      >
        <!-- 라벨은 메뉴 카테고리를 표시합니다 -->
        <span class="nav-label">{{ menu.name }}</span>
        <!-- 시각적 인디케이터는 활성 상태를 강조합니다 -->
        <span class="nav-indicator"></span>
      </button>

      <!-- 홈 버튼은 기본 랜딩 페이지로서의 고유 역할을 강조하기 위해 분리되어 있습니다 -->
      <button class="nav-item" @click="goHome">
        <span class="nav-label">Home</span>
        <span class="nav-indicator"></span>
      </button>
    </nav>

    <!-- 오버레이 메뉴는 하위 메뉴 탐색을 위해 슬라이드 인하며, CSS 전환으로 부드럽고 하드웨어 가속된 애니메이션을 보장합니다 -->
    <transition name="menu-slide">
      <div v-if="isMenuOpen" class="overlay" @click.self="closeMenu">
        <div class="overlay-panel">
          <button
            v-for="child in activeMenu?.children"
            :key="child.path"
            class="overlay-item"
            @click="navigate(child.path)"
          >
            <span class="overlay-label">{{ child.name }}</span>
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

// 단순하고 평면적인 메뉴 구조는 내비게이션 로직을 간소화하고 성능을 향상시키기 위해 설계되었습니다
const menus = ref([
  {
    name: "Util",
    children: [
      { name: "Tasks", path: "/todo" },
      { name: "S3", path: "/s3" },
      { name: "Notes", path: "/notes" },
    ],
  },
]);

// 상태 변수는 오버레이 메뉴의 가시성을 제어하고 현재 활성 메뉴를 추적하여 하위 메뉴 렌더링을 가능하게 합니다
const isMenuOpen = ref(false);
const activeMenu = ref(null);

// 현재 라우트 경로를 기준으로 활성 메뉴를 감지하여 정확한 내비게이션 상태를 반영합니다
const isActive = (menu) =>
  menu.children.some((child) => child.path === route.path);

// 메뉴 선택 시 오버레이를 열고 활성 메뉴를 설정하여 하위 메뉴 표시를 가능하게 합니다
const onSelect = (menu) => {
  activeMenu.value = menu;
  isMenuOpen.value = true;
};

// 오버레이 메뉴를 닫고 활성 메뉴를 초기화하여 내비게이션 또는 취소 후 UI 상태를 깔끔하게 유지합니다
const closeMenu = () => {
  isMenuOpen.value = false;
  activeMenu.value = null;
};

// 선택한 하위 메뉴 경로로 이동하고 오버레이를 닫아 원활한 사용자 흐름을 보장합니다
const navigate = (path) => {
  router.push(path);
  closeMenu();
};

// 홈 페이지로 이동하고 오버레이를 닫아 오버레이에서 일관된 종료 지점을 제공합니다
const goHome = () => {
  router.push("/");
  closeMenu();
};
</script>
