<script setup lang="ts">
import type { DropItem } from '@/types'

defineProps<{
  drop: DropItem
}>()
</script>

<template>
  <span class="font-medium text-foreground flex items-center">{{ drop?.minted }}/
    <UIcon v-if="drop?.max && drop?.max >= Number.MAX_SAFE_INTEGER" name="mdi:infinity" class="w-4 h-4" />
    <span v-else>{{ drop?.max }}</span>

    <span class="ml-1">{{ drop?.isMintedOut ? 'Minted Out' : $t('drop.minted') }}</span>
  </span>
</template>
