<template>
  <main class="clipboard-page">
    <section class="dashboard-top-row">
      <BaseCard class="welcome-card" glass>
        <p class="eyebrow">Today brief</p>
        <h1>Welcome back, {{ accountName }}</h1>
        <p class="welcome-date">{{ today }}</p>
      </BaseCard>

      <section class="clipboard-shell" aria-labelledby="clipboard-title">
        <header class="page-header">
          <div>
            <p class="eyebrow">Quick capture</p>
            <h1 id="clipboard-title">Quick Clipboard</h1>
            <p class="page-description">
              Keep the text you need across devices, ready to copy when you need
              it.
            </p>
          </div>
        </header>

        <label class="sr-only" for="clipboard-text">Clipboard text</label>
        <textarea
          id="clipboard-text"
          v-model="clipboardText"
          ref="clipboardTextarea"
          class="clipboard-textarea"
          placeholder="Paste or type anything here..."
          :disabled="clipboardLoading"
          @compositionstart="isComposing = true"
          @compositionend="handleCompositionEnd"
          @keydown.meta.enter.prevent="handleSaveShortcut"
          @keydown.ctrl.enter.prevent="handleSaveShortcut"
        />

        <footer class="clipboard-footer">
          <div class="clipboard-meta">
            <span class="shortcut-hint"
              ><kbd>⌘/Ctrl</kbd><kbd>Enter</kbd> to save</span
            >
            <span
              class="save-status"
              :class="{ 'save-status--pending': isDirty }"
              role="status"
            >
              {{ saveStatus }}
            </span>
          </div>
          <div class="clipboard-actions">
            <BaseButton
              variant="secondary"
              :disabled="!clipboardText"
              @click="handleCopyClipboard"
            >
              Copy
            </BaseButton>
            <BaseButton
              variant="ghost"
              :disabled="!clipboardText || clipboardSaving"
              @click="handleClearClipboard"
            >
              Clear
            </BaseButton>
            <BaseButton
              :loading="clipboardSaving"
              :disabled="!isDirty"
              @click="handleSaveClipboard"
            >
              Save
            </BaseButton>
          </div>
        </footer>
      </section>
    </section>

    <section
      v-if="activeSlide"
      class="dashboard-gallery"
      aria-label="Dashboard gallery"
    >
      <Transition name="slide-fade" mode="out-in">
        <img
          :key="activeSlide.id"
          :src="activeSlide.url"
          :alt="activeSlide.name"
        />
      </Transition>
    </section>
  </main>
</template>

<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { message } from "ant-design-vue";
import BaseCard from "@/shared/ui/BaseCard.vue";
import BaseButton from "@/shared/ui/BaseButton.vue";
import { useClipboard } from "@/features/dashboard/composables/useClipboard";
import { useDashboardGallery } from "@/features/dashboard/composables/useDashboardGallery";
import { useAppStore } from "@/store/app";

const app = useAppStore();
const { activeSlide } = useDashboardGallery();

const {
  clipboardText,
  clipboardLoading,
  clipboardSaving,
  saveClipboard,
  fetchClipboard,
} = useClipboard();

const savedText = ref("");
const hasLoaded = ref(false);
const isComposing = ref(false);
const clipboardTextarea = ref(null);
const isDirty = computed(
  () => hasLoaded.value && clipboardText.value !== savedText.value,
);
const saveStatus = computed(() => {
  if (clipboardLoading.value) return "Loading…";
  if (clipboardSaving.value) return "Saving…";
  return isDirty.value ? "Unsaved changes" : "Saved";
});
const today = computed(() => {
  const date = new Date();
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}(${days[date.getDay()]})`;
});
const accountName = computed(() => {
  const email = app.user?.email || "";
  return email.split("@")[0] || app.user?.name || "there";
});

const handleSaveClipboard = async () => {
  await nextTick();
  const currentText = clipboardTextarea.value?.value ?? clipboardText.value;
  clipboardText.value = currentText;

  if (currentText === savedText.value || clipboardSaving.value) return;
  try {
    await saveClipboard(currentText);
    savedText.value = currentText;
    message.success("Clipboard saved");
  } catch {
    message.error("Failed to save clipboard");
  }
};

const handleCompositionEnd = (event) => {
  clipboardText.value = event.target.value;
  isComposing.value = false;
};

const handleSaveShortcut = () => {
  if (!isComposing.value) handleSaveClipboard();
};

const handleClearClipboard = async () => {
  clipboardText.value = "";
  await handleSaveClipboard();
};

const handleCopyClipboard = async () => {
  if (!clipboardText.value) return;
  try {
    await navigator.clipboard.writeText(clipboardText.value);
    message.success("Copied to clipboard");
  } catch {
    message.error("Failed to copy clipboard text");
  }
};

onMounted(async () => {
  await fetchClipboard();
  savedText.value = clipboardText.value;
  hasLoaded.value = true;
});
</script>

<style scoped>
.clipboard-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 72px 28px 96px;
}

.dashboard-top-row {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.welcome-card {
  flex: 0 0 31%;
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-lg);
}

.welcome-card :deep(.base-card-body) {
  display: grid;
  gap: 2px;
  padding: 14px 16px;
}

.welcome-card .eyebrow {
  margin: 0;
}

.welcome-card h1 {
  margin: 0;
  font-size: 26px;
  line-height: 1.25;
}

.welcome-date {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-caption);
}

.clipboard-shell {
  flex: 1;
  display: grid;
  gap: 20px;
  padding: 30px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-surface);
  box-shadow: var(--shadow-lg);
}

.dashboard-gallery {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg-panel);
  box-shadow: var(--shadow-lg);
}

.dashboard-gallery img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.45s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
}

.page-header,
.clipboard-footer,
.clipboard-actions,
.clipboard-meta {
  display: flex;
  align-items: center;
}

.page-header,
.clipboard-footer {
  justify-content: space-between;
  gap: 20px;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--color-primary);
  font-size: var(--font-size-caption);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-hero);
  letter-spacing: var(--tracking-tight);
}

.page-description {
  margin: 8px 0 0;
  color: var(--color-text-secondary);
}

.save-status {
  flex: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}

.save-status--pending {
  color: var(--color-primary);
  font-weight: 700;
}

.clipboard-textarea {
  width: 100%;
  min-height: 140px;
  resize: vertical;
  box-sizing: border-box;
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-panel);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 16px;
  line-height: 1.65;
  outline: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

.clipboard-textarea:focus {
  border-color: var(--color-primary);
  background: var(--color-bg-surface);
  box-shadow: 0 0 0 3px var(--color-primary-glow);
}

.clipboard-actions {
  gap: 8px;
}
.clipboard-meta {
  gap: 12px;
}
.shortcut-hint {
  color: var(--color-text-muted);
  font-size: var(--font-size-caption);
}
kbd {
  padding: 2px 5px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-bg-panel);
  font: inherit;
}
kbd + kbd {
  margin-left: 3px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  .clipboard-page {
    padding: 16px 16px 104px;
  }
  .clipboard-shell {
    gap: 12px;
    padding: 16px;
  }
  .dashboard-top-row {
    display: grid;
    gap: 12px;
  }
  .welcome-card {
    flex-basis: auto;
  }
  .welcome-card :deep(.base-card-body) {
    padding: 12px 14px;
  }
  .welcome-card h1 {
    font-size: 22px;
  }
  .dashboard-gallery {
    margin-top: 12px;
  }
  .clipboard-footer {
    align-items: flex-start;
    flex-direction: column;
  }
  .page-header {
    display: none;
  }
  .clipboard-footer {
    gap: 14px;
  }
  .clipboard-actions {
    width: 100%;
    justify-content: flex-end;
  }
  .clipboard-meta {
    width: 100%;
    justify-content: space-between;
  }
  .clipboard-textarea {
    min-height: 16vh;
  }
}
</style>
