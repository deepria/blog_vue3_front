<template>
  <div class="app-layout">
    <NavigationPC class="nav-pc" />
    <NavigationMobile class="nav-mobile" />
    
    <main class="content-area content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import NavigationPC from './NavigationPC.vue';
import NavigationMobile from './NavigationMobile.vue';
import "@/assets/styles/layout.css";
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: #000;
}

.content-area {
  padding-left: 240px; /* PC Sidebar width */
  min-height: 100vh;
  transition: padding-left 0.3s ease;
}

.nav-mobile {
  display: none;
}

.nav-pc {
  display: flex;
}

/* Mobile & Tablet Styles */
@media (max-width: 1024px) {
  .content-area {
    padding-left: 0;
    padding-bottom: 100px; /* Space for mobile nav */
  }
  
  .nav-pc {
    display: none;
  }
  
  .nav-mobile {
    display: flex;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
