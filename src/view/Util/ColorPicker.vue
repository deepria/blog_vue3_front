<script setup>
import { ref, onMounted } from 'vue';

const bgColor = ref('#000000');
const invertedColor = ref('');
const showColor = ref(false);
let lastTouchTime = 0; // 더블터치 감지를 위한 변수

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

// 터치 드래그 시 배경색 변경
const updateColor = (event) => {
  event.preventDefault();
  const touch = event.touches[0];
  const x = touch.clientX / window.innerWidth;
  const y = touch.clientY / window.innerHeight;
  const r = Math.floor(x * 255);
  const g = Math.floor(y * 255);
  const b = Math.floor((1 - x) * 255);
  bgColor.value = rgbToHex(r, g, b);
  // 더블 터치 감지 (300ms 이내의 연속 터치)
  invertedColor.value = invertHex(bgColor.value);
  showColor.value = true;
};

// 더블 터치 감지 및 반전 색상 표시 + 클립보드 복사
const handleTouchEnd = async () => {
  const now = Date.now();
  if (now - lastTouchTime < 300) {
    try {
      await navigator.clipboard.writeText(invertedColor.value);
      console.log('Copied to clipboard:', invertedColor.value);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
  lastTouchTime = now;
};

onMounted(() => {
  window.addEventListener('touchmove', updateColor, {passive: false});
  window.addEventListener('touchend', handleTouchEnd);
});
</script>

<template>
  <div class="container" :style="{ backgroundColor: bgColor }">
    <div v-if="showColor" class="color-display" :style="{ color: invertedColor }">
      double tap for copy
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
  touch-action: none; /* 모바일 터치 이벤트 방지 */
}

.color-display {
  font-size: 3rem;
  font-weight: bold;
  padding: 20px;
  border-radius: 10px;
}
</style>