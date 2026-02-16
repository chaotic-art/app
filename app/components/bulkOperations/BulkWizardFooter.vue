<script setup lang="ts">
withDefaults(defineProps<{
  backDisabled?: boolean
  continueDisabled?: boolean
  continueLabel?: string
  loading?: boolean
  showBack?: boolean
}>(), {
  continueLabel: 'Continue',
  showBack: true,
})

const emit = defineEmits<{
  back: []
  continue: []
}>()

const isMac = computed(() => {
  if (import.meta.server)
    return false
  return navigator.platform.toUpperCase().includes('MAC')
})

const shortcutHint = computed(() => isMac.value ? '⌘+Enter' : 'Ctrl+Enter')
</script>

<template>
  <div class="shrink-0 flex items-center justify-between px-6 py-4 border-t border-border bg-background shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
    <div>
      <UButton
        v-if="showBack"
        variant="ghost"
        icon="i-heroicons-arrow-left"
        :disabled="backDisabled"
        @click="emit('back')"
      >
        Back
      </UButton>
    </div>

    <div class="flex items-center gap-3">
      <slot name="cost-estimate" />

      <UButton
        color="primary"
        :loading="loading"
        :disabled="continueDisabled || loading"
        @click="emit('continue')"
      >
        {{ continueLabel }}
        <template #trailing>
          <kbd class="hidden sm:inline text-xs opacity-60 ml-1">{{ shortcutHint }}</kbd>
        </template>
      </UButton>
    </div>
  </div>
</template>
