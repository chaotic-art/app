<script setup lang="ts">
import type { TradeNftItem } from '@/components/trade/types'

defineProps<{
  trade: TradeNftItem
  disabled?: boolean
}>()
defineEmits(['submit'])
</script>

<template>
  <div
    v-if="trade"
    class="pt-5!"
  >
    <TradeOwnerButton
      class="w-full!"
      :trade="trade"
      @click="$emit('submit')"
    />
  </div>
</template>
