<template>
  <LegacyBaseInput
    :model-value="modelValue"
    :label="label"
    :placeholder="placeholder"
    :type="type"
    :size="size"
    :disabled="disabled"
    :error="error"
    @update:model-value="$emit('update:modelValue', $event)"
    @focus="$emit('focus', $event)"
    @blur="$emit('blur', $event)"
    @enter="$emit('enter')"
  >
    <template v-if="$slots.prefix" #prefix>
      <slot name="prefix"></slot>
    </template>
    <template v-if="$slots.suffix" #suffix>
      <slot name="suffix"></slot>
    </template>
  </LegacyBaseInput>
</template>

<script setup>
import LegacyBaseInput from "@/components/ui/BaseInput.vue";

defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  size: {
    type: String,
    default: "md",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["update:modelValue", "focus", "blur", "enter"]);
</script>
