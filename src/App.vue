<template>
  <div>
    <nav>
      <ul class="menu">
        <li v-for="menu in menus" :key="menu.name" class="menu-item">
          <div
              v-if="menu.children"
              @mouseover="showDropdown(menu)"
              @mouseleave="hideDropdown(menu)"
              class="dropdown-container"
          >
            {{ menu.name }}
            <transition name="dropdown">
              <ul v-show="menu.isOpen" class="dropdown">
                <li v-for="child in menu.children" :key="child.name">
                  <router-link :to="child.path">{{ child.name }}</router-link>
                </li>
              </ul>
            </transition>
          </div>
          <router-link v-else :to="menu.path">{{ menu.name }}</router-link>
        </li>
      </ul>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      menus: [
        { name: "Home", path: "/" },
        {
          name: "Attribute",
          isOpen: false, // 드롭다운 열림 상태 관리
          children: [
            { name: "Get", path: "/get" },
            { name: "Put", path: "/put" },
          ],
        },
        {
          name: "Entity",
          isOpen: false, // 드롭다운 열림 상태 관리
          children: [
            { name: "Get", path: "/list" },
            { name: "Put", path: "/save" },
          ],
        },
      ],
    };
  },
  methods: {
    showDropdown(menu) {
      menu.isOpen = true;
    },
    hideDropdown(menu) {
      menu.isOpen = false;
    },
  },
};
</script>
<style scoped>
/* 가로로 표시되는 메뉴 스타일 */
.menu {
  display: flex; /* Flexbox로 가로 정렬 */
  list-style-type: none;
  padding: 0;
  margin: 0;
  gap: 20px; /* 메뉴 항목 간 간격 */
  align-items: center; /* 수직 정렬 */
}

.menu-item {
  position: relative; /* 드롭다운의 기준 위치 */
  font-size: 18px;
  font-weight: bold;
}

/* 드롭다운 스타일 */
.dropdown-container {
  cursor: pointer;
}

.dropdown {
  list-style-type: none;
  position: absolute; /* 부모 요소와 독립적인 위치 */
  top: 100%; /* 부모 요소 바로 아래에 배치 */
  left: 0;
  background-color: #ffffff;
  border: 1px solid #ccc;
  padding: 10px;
  margin: 0;
  width: 150px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  z-index: 1000; /* 다른 요소 위에 표시 */
}

/* 드롭다운 항목 스타일 */
.dropdown li {
  margin: 5px 0;
  font-size: 16px;
}

.dropdown li a {
  text-decoration: none;
  color: #333;
}

.dropdown li a:hover {
  color: #42b983;
}

/* 드롭다운 애니메이션 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>