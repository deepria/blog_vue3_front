<template>
  <div class="home-container flex flex-col gap-lg p-2">
    <weather-widget class="weather-section" />
    <news-widget class="news-section" />
  </div>
</template>

<script setup>
import WeatherWidget from '@/components/WeatherWidget.vue';
import NewsWidget from '@/components/NewsWidget.vue';
import '@/assets/styles/layout.css';
</script>

 
 