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
        {
          name: "Util",
          isOpen: false, // 드롭다운 열림 상태 관리
          children: [
            { name: "Upload", path: "/upload" },
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

</style>