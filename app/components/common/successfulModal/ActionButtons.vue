<script setup lang="ts">
export interface ActionButton {
  label: string
  disabled?: boolean
}

defineProps<{
  primary: ActionButton
  secondary?: ActionButton
}>()

defineEmits(['primary', 'secondary'])

const BASE_CLASSES = 'rounded-full px-4 md:px-6 py-2 md:py-3 w-full'
</script>

<template>
  <div class="flex gap-4">
    <UButton
      v-if="secondary"
      class="border-k-grey hover-button"
      :class="BASE_CLASSES"
      :disabled="secondary.disabled"
      :label="secondary.label"
      variant="outline"
      @click="$emit('secondary')"
    />

    <UButton
      class="hover-button"
      :class="BASE_CLASSES"
      :disabled="primary.disabled"
      :loading="primary.disabled"
      color="primary"
      :label="primary.disabled ? $t('loading') : primary.label"
      @click="$emit('primary')"
    />
  </div>
</template>
