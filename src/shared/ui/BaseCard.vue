<template>
  <LegacyBaseCard
    v-bind="$attrs"
    :title="title"
    :hoverable="hoverable"
    :interactive="interactive"
    :glass="glass"
    @click="$emit('click', $event)"
  >
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>
    <slot></slot>
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </LegacyBaseCard>
</template>

<script setup>
defineOptions({
  inheritAttrs: false,
});

import LegacyBaseCard from "@/components/layout/BaseCard.vue";

defineProps({
  title: {
    type: String,
    default: "",
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  interactive: {
    type: Boolean,
    default: false,
  },
  glass: {
    type: Boolean,
    default: true,
  },
});

defineEmits(["click"]);
</script>
