<template>
  <aside class="navigation-pc">
    <router-link to="/" class="brand"
      ><span class="brand-symbol" aria-hidden="true">✳</span
      ><span
        >deepria<small>cloud</small><em>나만의 작업 공간</em></span
      ></router-link
    >
    <p class="nav-caption">내 작업 공간 <span>01</span></p>
    <nav class="nav-menu" aria-label="작업 공간">
      <router-link
        v-for="item in workspaceItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        active-class="active"
        ><component :is="item.icon" /><span>{{ item.label }}</span
        ><i></i
      ></router-link>
    </nav>
    <div class="sidebar-note">
      <span aria-hidden="true">✳</span>
      <p>생각을 모으고,<br />가능성을 펼치는 곳.</p>
      <small>작은 여백에서 시작하는 가능성.</small>
    </div>
    <footer class="footer-area">
      <router-link to="/account" class="settings-link"
        ><SettingOutlined /><span>설정</span
        ><span class="current-design">{{ designName }}</span></router-link
      ><button
        class="theme-toggle"
        type="button"
        :aria-pressed="isDarkMode"
        @click="app.toggleTheme"
      >
        <component :is="isDarkMode ? BulbFilled : BulbOutlined" /><span>{{
          isDarkMode ? "다크 모드" : "라이트 모드"
        }}</span>
      </button>
      <div v-if="app.user" class="user-area">
        <span class="user-avatar">{{ initial }}</span
        ><router-link to="/account"
          ><strong>{{ app.user.name }}</strong
          ><small>개인 작업 공간</small></router-link
        ><button type="button" aria-label="로그아웃" @click="logout">
          <LogoutOutlined />
        </button>
      </div>
    </footer>
  </aside>
</template>
<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
  BulbFilled,
  BulbOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons-vue";
import { navigationItems } from "@/shared/navigation/items";
import { designOptions } from "@/features/appearance/lib/themes";
import { useAppStore } from "@/store/app";
const app = useAppStore();
const router = useRouter();
const workspaceItems = navigationItems.filter((item) => item.to !== "/account");
const isDarkMode = computed(() => app.theme === "dark");
const initial = computed(() => (app.user?.name || "d").charAt(0));
const designName = computed(
  () => designOptions.find((option) => option.id === app.design)?.name,
);
async function logout() {
  await app.logout();
  router.push({ name: "Login" });
}
</script>
<style scoped>
.navigation-pc {
  position: fixed;
  inset: 0 auto 0 0;
  width: var(--nav-width);
  height: 100dvh;
  z-index: 100;
  background: var(--nav-bg);
  color: var(--nav-ink);
  padding: 34px 20px 22px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}
.brand {
  display: flex;
  gap: 9px;
  align-items: center;
  color: var(--nav-heading);
  text-decoration: none;
  font-size: 26px;
  font-weight: 750;
  letter-spacing: -1.3px;
  line-height: 1;
}
.brand-symbol {
  font-size: 38px;
  color: var(--brand-color);
}
.brand small {
  font-size: 13px;
  letter-spacing: -0.6px;
  margin-left: 3px;
  font-weight: 450;
}
.brand em {
  display: block;
  font-size: 8px;
  letter-spacing: 1.35px;
  margin-top: 9px;
  font-style: normal;
  font-weight: 500;
}
.nav-caption {
  display: flex;
  justify-content: space-between;
  color: var(--nav-ink);
  opacity: 0.85;
  font-size: 10px;
  letter-spacing: 0.13em;
  margin: 46px 10px 16px;
}
.nav-menu {
  display: grid;
  gap: 5px;
}
.nav-item {
  display: flex;
  gap: 13px;
  align-items: center;
  min-height: 45px;
  padding: 10px 13px;
  color: var(--nav-ink);
  border-radius: var(--radius-md);
  font-size: 14px;
  text-decoration: none;
}
.nav-item > .anticon {
  font-size: 18px;
}
.nav-item.active {
  background: var(--nav-selected);
  color: var(--nav-accent);
}
.nav-item.active i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  margin-left: auto;
  background: currentColor;
}
.nav-item:hover {
  background: var(--nav-selected);
  color: var(--nav-accent);
}
.sidebar-note {
  margin-top: auto;
  padding: 56px 10px 28px;
}
.sidebar-note > span {
  color: var(--art-color);
  font-size: 38px;
}
.sidebar-note p {
  color: var(--nav-heading);
  font-size: 17px;
  line-height: 1.7;
  margin: 10px 0;
}
.sidebar-note small {
  font-size: 10px;
  color: var(--nav-ink);
}
.footer-area {
  border-top: 1px solid var(--color-border);
  padding-top: 12px;
}
.theme-toggle,
.settings-link {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  width: 100%;
  font: inherit;
  font-size: 12px;
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--nav-ink);
  text-decoration: none;
  cursor: pointer;
}
.theme-toggle:hover,
.settings-link:hover {
  background: var(--nav-selected);
  color: var(--nav-accent);
}
.current-design {
  margin-left: auto;
  font-size: 9px;
}
.user-area {
  display: flex;
  gap: 10px;
  align-items: center;
  padding-top: 15px;
  margin-top: 8px;
  border-top: 1px solid var(--color-border);
}
.user-avatar {
  width: 31px;
  height: 31px;
  border-radius: 50%;
  background: var(--brand-color);
  color: var(--nav-bg);
  display: grid;
  place-items: center;
  font-size: 18px;
  font-family: Georgia, serif;
}
.user-area > a {
  display: grid;
  min-width: 0;
  flex: 1;
  text-decoration: none;
  color: var(--nav-heading);
}
.user-area strong {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 550;
}
.user-area small {
  font-size: 9px;
  color: var(--nav-ink);
}
.user-area button {
  background: transparent;
  border: 0;
  color: var(--nav-ink);
  cursor: pointer;
  padding: 8px;
  min-width: 32px;
}
[data-design="studio"] .nav-item {
  font-weight: 650;
}
[data-design="studio"] .sidebar-note p {
  font-weight: 750;
}
[data-design="console"] .brand {
  font-family: ui-monospace, monospace;
  font-size: 23px;
}
@media (max-height: 800px) {
  .sidebar-note {
    padding-top: 25px;
    padding-bottom: 15px;
  }
  .sidebar-note p {
    font-size: 15px;
  }
  .nav-caption {
    margin-top: 30px;
  }
}
</style>
