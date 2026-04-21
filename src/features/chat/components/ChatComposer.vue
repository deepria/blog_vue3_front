<template>
  <div class="input-area">
    <div class="input-wrapper">
      <a-textarea
        :value="modelValue"
        placeholder="Message Assistant..."
        :auto-size="{ minRows: 1, maxRows: 6 }"
        @update:value="$emit('update:modelValue', $event)"
        @pressEnter.prevent="$emit('send')"
      />
      <button
        class="send-btn"
        :class="{ loading: loading, disabled: !modelValue.trim() }"
        :disabled="!modelValue.trim() || loading"
        @click="$emit('send')"
        aria-label="Send message"
      >
        <send-outlined v-if="!loading" />
        <span v-else class="spinner"></span>
      </button>
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
  padding: var(--space-4);
  background-color: var(--color-bg-base);
  border-top: 1px solid var(--color-border);
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-xl);
  padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

:deep(.ant-input-textarea textarea) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: var(--color-text-primary) !important;
  padding: 8px 0 !important;
  font-size: var(--font-size-body);
  line-height: 1.5;
  resize: none;
}

:deep(.ant-input-textarea textarea)::placeholder {
  color: var(--color-text-muted);
}

.send-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: var(--color-primary);
  color: var(--text-inverse);
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-bottom: 2px;
}

.send-btn:hover:not(.disabled) {
  transform: scale(1.05);
  background-color: var(--color-primary-strong);
}

.send-btn.disabled {
  background-color: var(--color-bg-panel);
  color: var(--color-text-muted);
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
