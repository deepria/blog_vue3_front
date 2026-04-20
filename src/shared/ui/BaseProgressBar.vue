<template>
  <LegacyBaseProgressBar
    :value="value"
    :label="label"
    :show-value="showValue"
    :color="color"
  />
</template>

<script setup>
import LegacyBaseProgressBar from "@/components/base/BaseProgressBar.vue";

defineProps({
  value: {
    type: Number,
    default: 0,
  },
  label: {
    type: String,
    default: "",
  },
  showValue: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: "var(--color-primary)",
  },
});
</script>
