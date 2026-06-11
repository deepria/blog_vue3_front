<template>
  <MilkdownProvider>
    <div
      class="memo-milkdown-editor"
      :style="{ '--memo-editor-font-size': `${fontSize}px` }"
    >
      <EditorSurface
        :key="editorKey"
        :model-value="modelValue"
        :readonly="readonly"
        @update:model-value="$emit('update:modelValue', $event)"
        @ready="$emit('ready')"
      />
    </div>
  </MilkdownProvider>
</template>

<script setup>
import { defineComponent, h } from "vue";
import { CrepeBuilder } from "@milkdown/crepe/builder";
import { blockEdit } from "@milkdown/crepe/feature/block-edit";
import { cursor } from "@milkdown/crepe/feature/cursor";
import { imageBlock } from "@milkdown/crepe/feature/image-block";
import { linkTooltip } from "@milkdown/crepe/feature/link-tooltip";
import { listItem } from "@milkdown/crepe/feature/list-item";
import { placeholder } from "@milkdown/crepe/feature/placeholder";
import { table } from "@milkdown/crepe/feature/table";
import { toolbar } from "@milkdown/crepe/feature/toolbar";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/vue";
import "@milkdown/crepe/theme/frame.css";

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  editorKey: {
    type: [String, Number],
    default: 0,
  },
  fontSize: {
    type: Number,
    default: 16,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:modelValue", "ready"]);

const EditorSurface = defineComponent({
  name: "EditorSurface",
  props: {
    modelValue: {
      type: String,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue", "ready"],
  setup(props, { emit }) {
    useEditor((root) => {
      const crepe = new CrepeBuilder({
        root,
        defaultValue: props.modelValue || "",
      });

      crepe
        .addFeature(cursor)
        .addFeature(listItem)
        .addFeature(linkTooltip)
        .addFeature(imageBlock)
        .addFeature(blockEdit)
        .addFeature(placeholder)
        .addFeature(toolbar)
        .addFeature(table)
        .setReadonly(props.readonly)
        .on((listener) => {
          listener
            .mounted(() => emit("ready"))
            .markdownUpdated((_, markdown) => {
              emit("update:modelValue", markdown);
            });
        });

      return crepe;
    });

    return () => h(Milkdown);
  },
});
</script>

<style scoped>
.memo-milkdown-editor {
  height: 100%;
  color: var(--color-text-primary);
  background: var(--color-bg-surface);
}

.memo-milkdown-editor :deep([data-milkdown-root]) {
  height: 100%;
}

.memo-milkdown-editor :deep(.milkdown) {
  height: 100%;
  --crepe-color-background: var(--color-bg-surface);
  --crepe-color-on-background: var(--color-text-primary);
  --crepe-color-surface: var(--color-bg-panel);
  --crepe-color-surface-low: var(--color-bg-panel-strong);
  --crepe-color-on-surface: var(--color-text-primary);
  --crepe-color-on-surface-variant: var(--color-text-secondary);
  --crepe-color-outline: var(--color-border-strong);
  --crepe-color-primary: var(--color-primary);
  --crepe-color-secondary: var(--color-bg-panel-strong);
  --crepe-color-on-secondary: var(--color-text-primary);
  --crepe-color-inverse: var(--color-text-primary);
  --crepe-color-on-inverse: var(--color-bg-surface);
  --crepe-color-inline-code: var(--color-danger);
  --crepe-color-error: var(--color-danger);
  --crepe-color-hover: var(--color-bg-panel-strong);
  --crepe-color-selected: var(--color-primary-soft);
  --crepe-color-inline-area: var(--color-bg-panel-strong);
  --crepe-font-default: var(--font-family);
  --crepe-font-title: var(--font-family);
}

.memo-milkdown-editor :deep(.ProseMirror) {
  min-height: 100%;
  height: 100%;
  overflow-y: auto;
  padding: 28px 32px 96px;
  color: var(--color-text-primary);
  background: var(--color-bg-surface);
  font-family: var(--font-family);
  font-size: var(--memo-editor-font-size);
  line-height: 1.72;
  outline: none;
}

.memo-milkdown-editor :deep(.ProseMirror > *:first-child) {
  margin-top: 0;
}

.memo-milkdown-editor :deep(.ProseMirror p) {
  margin: 0.85em 0;
}

.memo-milkdown-editor :deep(.ProseMirror h1),
.memo-milkdown-editor :deep(.ProseMirror h2),
.memo-milkdown-editor :deep(.ProseMirror h3) {
  margin: 1.35em 0 0.55em;
  color: var(--color-text-primary);
  line-height: 1.25;
  letter-spacing: 0;
}

.memo-milkdown-editor :deep(.ProseMirror h1) {
  font-size: 1.65em;
}

.memo-milkdown-editor :deep(.ProseMirror h2) {
  font-size: 1.35em;
}

.memo-milkdown-editor :deep(.ProseMirror h3) {
  font-size: 1.16em;
}

.memo-milkdown-editor :deep(.ProseMirror blockquote) {
  margin: 1em 0;
  padding: 2px 0 2px 16px;
  color: var(--color-text-secondary);
  border-left: 3px solid var(--color-border-bright);
}

.memo-milkdown-editor :deep(.ProseMirror code) {
  padding: 2px 5px;
  border-radius: var(--radius-sm);
  background: var(--color-bg-panel-strong);
  color: var(--color-text-primary);
  font-size: 0.9em;
}

.memo-milkdown-editor :deep(.ProseMirror pre) {
  overflow-x: auto;
  padding: 14px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-panel);
}

.memo-milkdown-editor :deep(.ProseMirror pre code) {
  padding: 0;
  background: transparent;
}

.memo-milkdown-editor :deep(.ProseMirror a) {
  color: var(--color-primary);
}

.memo-milkdown-editor :deep(.ProseMirror table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1em 0;
}

.memo-milkdown-editor :deep(.ProseMirror th),
.memo-milkdown-editor :deep(.ProseMirror td) {
  padding: 8px 10px;
  border: 1px solid var(--color-border);
}

.memo-milkdown-editor :deep(.ProseMirror-selectednode) {
  outline: 2px solid var(--color-border-bright);
}

@media (max-width: 720px) {
  .memo-milkdown-editor :deep(.ProseMirror) {
    padding: 20px 16px 88px;
  }
}
</style>
