<template>
  <div :class="['markdown-viewer', customClass]" ref="viewerRef"></div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
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

const updateViewer = () => {
  if (viewerRef.value) {
    renderMarkdown(viewerRef.value, props.content);
  }
};

onMounted(() => {
  updateViewer();
});

watch(() => props.content, () => {
  updateViewer();
});
</script>

<style scoped>
/* Scoped overrides if needed, generic ones belong in global css */
.markdown-viewer {
  width: 100%;
}
</style>
