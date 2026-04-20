<template>
  <div class="input-area">
    <div class="input-wrapper">
      <a-textarea
        :value="modelValue"
        placeholder="메시지를 입력하세요..."
        :auto-size="{ minRows: 1, maxRows: 4 }"
        @update:value="$emit('update:modelValue', $event)"
        @pressEnter.prevent="$emit('send')"
      />
      <a-button
        type="primary"
        shape="circle"
        :loading="loading"
        :disabled="!modelValue.trim()"
        @click="$emit('send')"
      >
        <template #icon><send-outlined /></template>
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { SendOutlined } from "@ant-design/icons-vue";

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue", "send"]);
</script>

<style scoped>
.input-area {
  padding: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.input-wrapper {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: end;
}
</style>
