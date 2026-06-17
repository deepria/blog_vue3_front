<template>
  <footer class="composer-area">
    <div class="composer-shell" :class="{ focused: isFocused }">
      <a-textarea
        :value="modelValue"
        placeholder="Enter 전송 · Shift+Enter 줄바꿈"
        :auto-size="{ minRows: 1, maxRows: 7 }"
        :disabled="loading"
        @focus="isFocused = true"
        @blur="isFocused = false"
        @update:value="$emit('update:modelValue', $event)"
        @keydown.enter.exact.prevent="submit"
      />
      <button
        class="send-btn"
        :class="{ loading: loading }"
        :disabled="!modelValue.trim() || loading"
        type="button"
        aria-label="메시지 보내기"
        @click="submit"
      >
        <send-outlined v-if="!loading" />
        <loading-outlined v-else />
      </button>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";
import { LoadingOutlined, SendOutlined } from "@ant-design/icons-vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "send"]);
const isFocused = ref(false);

function submit() {
  if (!props.modelValue.trim() || props.loading) return;
  emit("send");
}
</script>

<style scoped>
.composer-area {
  padding: 14px clamp(14px, 3vw, 28px) calc(14px + env(safe-area-inset-bottom, 0px));
  background: var(--color-bg-surface);
  border-top: 1px solid var(--color-border);
}

.composer-shell {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 920px;
  margin: 0 auto;
  padding: 8px 8px 8px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-panel);
  box-shadow: var(--shadow-sm);
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.composer-shell.focused {
  border-color: var(--color-border-bright);
  background: var(--color-bg-surface);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

:deep(.ant-input-textarea textarea) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: var(--color-text-primary) !important;
  padding: 8px 0 !important;
  font-size: var(--font-size-body);
  line-height: 1.55;
  resize: none;
}

:deep(.ant-input-textarea textarea)::placeholder {
  color: var(--color-text-muted);
}

.send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
  background-color: var(--color-primary);
  color: var(--text-inverse);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  background-color: var(--color-primary-strong);
  border-color: var(--color-primary-strong);
}

.send-btn:disabled {
  background-color: var(--color-bg-panel-strong);
  border-color: var(--color-border);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

.send-btn.loading {
  color: var(--text-inverse);
}

@media (max-width: 768px) {
  .composer-area {
    padding: 10px 10px calc(10px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
