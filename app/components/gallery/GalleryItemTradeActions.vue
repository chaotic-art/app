<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

defineProps<{
  variant?: ButtonProps['variant']
}>()

defineEmits<{
  (e: 'createOffer'): void
  (e: 'createSwap'): void
}>()
</script>

<template>
  <div class="flex flex-1 gap-3">
    <UButton
      size="lg"
      class="flex-1"
      :variant="variant"
      @click="$emit('createOffer')"
    >
      {{ $t('offer.createOffer') }}
    </UButton>

    <UButton
      size="lg"
      icon="mdi:swap-horizontal"
      :variant="variant"
      @click="$emit('createSwap')"
    />
  </div>
</template>
