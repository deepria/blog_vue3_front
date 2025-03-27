<template>
  <div class="home-container flex flex-col gap-lg p-2">
    <weather-widget class="weather-section" />

    <div class="construction-banner">🚧 공사중 - 너무 힘들어요 🚜</div>

    <news-widget class="news-section" />
  </div>
</template>

<script setup>
import WeatherWidget from "@/components/WeatherWidget.vue";
import NewsWidget from "@/components/NewsWidget.vue";
import "@/assets/styles/layout.css";
</script>
<!--공사중 css-->
<style scoped>
.construction-banner {
  text-align: center;
  background-color: #000000;
  color: #ffffff;
  padding: 12px;
  border: 1px solid var(--primary-color);
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  margin: 8px 0;
}
</style>
