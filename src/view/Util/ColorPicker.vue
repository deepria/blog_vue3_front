<script setup>
import { ref, onMounted } from 'vue';

const bgColor = ref('#000000');
const invertedColor = ref('');
const showColor = ref(false);

// RGB 값을 Hex로 변환하는 함수
const rgbToHex = (r, g, b) => {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

// Hex 색상을 반전시키는 함수
const invertHex = (hex) => {
  const r = 255 - parseInt(hex.slice(1, 3), 16);
  const g = 255 - parseInt(hex.slice(3, 5), 16);
  const b = 255 - parseInt(hex.slice(5, 7), 16);
  return rgbToHex(r, g, b);
};

// 마우스 이동에 따라 배경색 변경
const updateColor = (event) => {
  const x = event.clientX / window.innerWidth;
  const y = event.clientY / window.innerHeight;
  const r = Math.floor(x * 255);
  const g = Math.floor(y * 255);
  const b = Math.floor((1 - x) * 255);
  bgColor.value = rgbToHex(r, g, b);
  invertedColor.value = invertHex(bgColor.value);
  showColor.value = true;
};

// 클릭 시 반전된 색상 표시 및 클립보드 복사
const setInvertedColor = async () => {

  try {
    await navigator.clipboard.writeText(invertedColor.value);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

onMounted(() => {
  window.addEventListener('mousemove', updateColor);
});
</script>

<template>
  <div
      class="container"
      :style="{ backgroundColor: bgColor }"
      @click="setInvertedColor"
  >
    <div v-if="showColor" class="color-display" :style="{ color: invertedColor }">
      {{ invertedColor }}
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 90vw;
  height: 90vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
}
.color-display {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  padding: 20px;
  border-radius: 10px;
}
</style>