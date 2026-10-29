<template>
  <LegacyBaseModal
    :model-value="modelValue"
    :title="title"
    :wide="wide"
    :close-disabled="closeDisabled"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
  >
    <template v-if="$slots.header" #header>
      <slot name="header"></slot>
    </template>
    <slot></slot>
    <template v-if="$slots.footer" #footer>
      <slot name="footer"></slot>
    </template>
  </LegacyBaseModal>
</template>

<script setup>
import LegacyBaseModal from "@/components/base/BaseModal.vue";

defineProps({
  closeDisabled: Boolean,
  wide: Boolean,
  modelValue: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue", "close"]);
</script>
