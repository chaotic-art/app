<script lang="ts" setup>
export interface ButtonConfig {
  label: string
  icon?: string
  onClick?: () => void
  classes?: string
  active?: boolean
  disabled?: boolean
  variant?: 'solid' | 'outline' | 'ghost' | 'subtle' | 'soft' | 'link'
}

defineProps<{
  button: ButtonConfig
  loading?: boolean
  testId?: string
}>()
</script>

<template>
  <UButton
    rounded
    no-shadow
    loading-with-label
    :data-testid="testId"
    :class="button.classes"
    :active="button.active"
    :disabled="button.disabled || loading"
    :loading="loading"
    :variant="button.variant"
    @click="button.onClick"
  >
    <UIcon
      v-if="button.icon"
      :name="button.icon"
      class="mr-1"
    />
    {{ button.label }}
  </UButton>
</template>
