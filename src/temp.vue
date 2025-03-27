<template>
  <div class="container">
    <button class="add-button" @click="showPopup = true">+</button>

    <div v-if="showPopup" class="popup-overlay" @click.self="showPopup = false">
      <div class="popup">
        <input v-model="inputText" type="text" placeholder="입력하세요" />
        <button @click="confirmInput">
          <i class="fas fa-check"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const showPopup = ref(false);
const inputText = ref("");

const confirmInput = () => {
  showPopup.value = false;
  console.log(inputText.value); // 임시로 입력값 확인
};
</script>

<style scoped>
.add-button {
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  font-size: 32px;
  font-weight: bold;
  color: white;
  background-color: #42b983;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(255, 0, 0, 0.5);
  transition: background 0.3s ease;
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup {
  background-color: #333333; /* 배경색 변경 */
  padding: 20px;
  border-radius: 8px;
  display: flex;
  gap: 10px;
  width: 90%; /* 팝업의 너비를 늘려 꽉 차게 */
  max-width: 400px; /* 최대 너비 제한 설정 */
}

.popup input {
  padding: 12px; /* 패딩을 약간 더 크게 조정 */
  font-size: 18px; /* 글꼴 크기를 키움 */
  background-color: #121212; /* 인풋 배경색 */
  color: white; /* 인풋 텍스트 색상 */
  border: none;
  outline: none;
  border-radius: 4px;
  flex: 1; /* 인풋이 팝업 내부를 최대한 꽉 채우게 설정 */
  width: 100%; /* 추가로 너비 100% 설정하여 명시적 확장 */
  box-sizing: border-box;
}

.popup button {
  padding: 8px 16px; /* 버튼 패딩도 약간 늘림 */
  font-size: 18px; /* 버튼 폰트 크기 증가 */
  cursor: pointer;
  color: white; /* 버튼 아이콘 색상 */
  background-color: transparent;
  border: none;
}
</style>
