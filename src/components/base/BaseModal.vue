<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="modelValue" class="modal-backdrop" @click="close">
        <div
          ref="dialog"
          class="modal-container"
          :class="{ wide }"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :aria-label="title ? undefined : '대화상자'"
          tabindex="-1"
          @click.stop
        >
          <!-- Header -->
          <div v-if="$slots.header || title" class="modal-header">
            <h3 v-if="title" :id="titleId" class="modal-title">{{ title }}</h3>
            <slot name="header"></slot>
            <button
              class="close-btn"
              @click="close"
              aria-label="대화상자 닫기"
              :disabled="closeDisabled"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { nextTick, onBeforeUnmount, ref, useId, watch } from "vue";
import {
  isTopDialog,
  pushDialog,
  removeDialog,
} from "@/shared/lib/dialogStack";
const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: "" },
  closeDisabled: Boolean,
  wide: Boolean,
});
const emit = defineEmits(["update:modelValue", "close"]);
const dialog = ref(null);
const titleId = useId();
let trigger = null;
let active = null;
let generation = 0;
const focusable = () =>
  [
    ...(dialog.value?.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
    ) || []),
  ].filter((el) => el.getClientRects().length && !el.closest("[inert]"));
function close() {
  if (props.closeDisabled) return;
  emit("update:modelValue", false);
  emit("close");
}
function focusInside(event) {
  if (active && isTopDialog(active) && !dialog.value?.contains(event.target))
    (focusable()[0] || dialog.value)?.focus();
}
function keydown(event) {
  if (!active || !isTopDialog(active)) return;
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopImmediatePropagation();
    close();
  }
  if (event.key !== "Tab") return;
  const items = focusable();
  if (!items.length) {
    event.preventDefault();
    dialog.value?.focus();
    return;
  }
  const first = items[0],
    last = items.at(-1);
  if (
    event.shiftKey &&
    (document.activeElement === first ||
      !dialog.value.contains(document.activeElement))
  ) {
    event.preventDefault();
    last.focus();
  } else if (
    !event.shiftKey &&
    (document.activeElement === last ||
      !dialog.value.contains(document.activeElement))
  ) {
    event.preventDefault();
    first.focus();
  }
}
function cleanup() {
  if (!active) return;
  const wasTop = isTopDialog(active);
  removeDialog(active);
  active = null;
  document.removeEventListener("keydown", keydown, true);
  document.removeEventListener("focusin", focusInside, true);
  if (wasTop && trigger?.isConnected) trigger.focus();
}
watch(
  () => props.modelValue,
  async (open) => {
    const version = ++generation;
    if (!open) {
      cleanup();
      return;
    }
    trigger = document.activeElement;
    await nextTick();
    if (!props.modelValue || version !== generation || !dialog.value) return;
    active = dialog.value;
    pushDialog(active);
    document.addEventListener("keydown", keydown, true);
    document.addEventListener("focusin", focusInside, true);
    (
      focusable().find((el) => el.matches("input,textarea,select")) ||
      focusable()[0] ||
      dialog.value
    ).focus();
  },
  { immediate: true, flush: "post" },
);
onBeforeUnmount(() => {
  generation++;
  cleanup();
});
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: var(--bg-overlay);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--space-4);
}

.modal-container {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  width: 100%;
  max-width: 480px;
  max-height: calc(100dvh - 40px);
  display: flex;
  flex-direction: column;
  box-shadow: var(--glass-shadow-deep);
  overflow: hidden;
}

.modal-header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: var(--font-size-title);
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  letter-spacing: 0;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background-color: var(--color-bg-panel);
  color: var(--color-text-primary);
}

.modal-body {
  padding: var(--space-6);
  overflow-y: auto;
  overscroll-behavior: contain;
  color: var(--color-text-primary);
  font-size: var(--font-size-body);
}

.modal-footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  background-color: var(--color-bg-panel);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active {
  pointer-events: none;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-enter-from .modal-container,
.modal-fade-leave-to .modal-container {
  transform: scale(0.96) translateY(8px);
}
.modal-container.wide {
  max-width: 1000px;
}
.close-btn {
  min-width: 40px;
  min-height: 40px;
}
.close-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
@media (max-width: 640px) {
  .modal-backdrop {
    padding: var(--safe-top) 0 0;
    align-items: flex-end;
  }
  .modal-container {
    max-width: none;
    max-height: calc(100dvh - var(--safe-top) - 20px);
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  }
  .modal-header,
  .modal-body {
    padding: 18px 20px;
  }
  .modal-footer {
    padding: 16px 20px calc(16px + var(--safe-bottom));
  }
}
</style>
