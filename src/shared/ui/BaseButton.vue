<template>
  <LegacyBaseButton
    :variant="variant"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    :block="block"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </LegacyBaseButton>
</template>

<script setup>
import LegacyBaseButton from "@/components/ui/BaseButton.vue";

defineProps({
  variant: {
    type: String,
    default: "primary",
  },
  size: {
    type: String,
    default: "md",
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  block: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);
</script>
