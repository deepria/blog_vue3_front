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
  }
});

const viewerRef = ref(null);
let viewerInstance = null;

const updateViewer = () => {
  if (viewerRef.value) {
    if (viewerInstance?.setMarkdown) {
      viewerInstance.setMarkdown(props.content);
      return;
    }
    viewerInstance?.destroy?.();
    viewerInstance = renderMarkdown(viewerRef.value, props.content);
  }
};

onMounted(() => {
  updateViewer();
});

watch(() => props.content, () => {
  updateViewer();
});

onBeforeUnmount(() => {
  viewerInstance?.destroy?.();
  viewerInstance = null;
});
</script>

<style scoped>
/* Scoped overrides if needed, generic ones belong in global css */
.markdown-viewer {
  width: 100%;
}
</style>
