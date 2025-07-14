<script setup lang="ts">
import useTheme from '@/composables/useTheme'

defineProps<{
  showLabel?: boolean
}>()

const { currentMode, switchToNextMode } = useTheme()
</script>

<template>
  <UTooltip :text="currentMode?.label">
    <UButton
      variant="ghost"
      color="neutral"
      class="rounded-full"
      @click="switchToNextMode"
    >
      <UIcon
        :name="currentMode?.icon || 'i-mdi:weather-sunny'"
        class="h-5 w-5"
      />
      <span v-if="showLabel">
        {{ currentMode?.label }}
      </span>
    </UButton>
  </UTooltip>
</template>
