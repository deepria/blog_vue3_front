<template>
  <div :class="['markdown-viewer', customClass]" ref="viewerRef"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { renderMarkdown } from '@/shared/utils/markdownParser';

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  customClass: {
    type: String,
    default: ''
  },
  interactiveCheckboxes: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['checkbox-toggle']);
const viewerRef = ref(null);
let viewerInstance = null;

const prepareRenderedLinks = () => {
  if (!viewerRef.value) return;

  viewerRef.value.querySelectorAll("a[href]").forEach((link) => {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  });
};

const prepareInteractiveCheckboxes = () => {
  if (!viewerRef.value || !props.interactiveCheckboxes) return;
  viewerRef.value.querySelectorAll('input[type="checkbox"]').forEach((checkbox, index) => {
    checkbox.disabled = false;
    checkbox.dataset.taskIndex = String(index);
    checkbox.setAttribute('aria-label', `체크리스트 ${index + 1}번 토글`);
  });
};

const updateViewer = () => {
  if (viewerRef.value) {
    if (viewerInstance?.setMarkdown) {
      viewerInstance.setMarkdown(props.content);
      prepareRenderedLinks();
      prepareInteractiveCheckboxes();
      return;
    }
    viewerInstance?.destroy?.();
    viewerInstance = renderMarkdown(viewerRef.value, props.content);
    prepareRenderedLinks();
    prepareInteractiveCheckboxes();
  }
};

const handleClick = (event) => {
  const checkbox = event.target?.closest?.('input[type="checkbox"]');
  if (checkbox && viewerRef.value?.contains(checkbox)) {
    if (!props.interactiveCheckboxes) return;
    event.preventDefault();
    const index = Number(checkbox.dataset.taskIndex);
    if (Number.isInteger(index)) emit('checkbox-toggle', index);
  }
};

onMounted(() => {
  updateViewer();
  viewerRef.value?.addEventListener('click', handleClick);
});

watch(() => props.content, () => {
  updateViewer();
});

onBeforeUnmount(() => {
  viewerRef.value?.removeEventListener('click', handleClick);
  viewerInstance?.destroy?.();
  viewerInstance = null;
});
</script>

<style scoped>
/* Scoped overrides if needed, generic ones belong in global css */
.markdown-viewer {
  width: 100%;
}

.markdown-viewer :deep(input[type="checkbox"]) {
  cursor: pointer;
}
</style>
