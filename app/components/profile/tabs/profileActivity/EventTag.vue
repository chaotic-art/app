<script setup lang="ts">
import { getInteractionColor } from './utils'

withDefaults(
  defineProps<{
    interaction: string
    interactionName: string
    distinguishBuyAndSell?: boolean
  }>(),
  {
    distinguishBuyAndSell: false,
  },
)
</script>

<template>
  <div
    class="border rounded text-white justify-center py-1 my-2 flex items-center w-[66px] h-[22px]"
    :class="getInteractionColor(interaction, { distinguishBuyAndSell })"
  >
    {{ interactionName }}
  </div>
</template>
