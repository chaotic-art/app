<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'

const props = defineProps<{
  selectedCount: number
  collectionId: string
  chain: AssetHubChain
}>()

const emit = defineEmits<{
  selectAll: []
  clearSelection: []
  toggleSelection: []
}>()

const router = useRouter()

function handleAirdrop() {
  router.push(`/${props.chain}/studio/${props.collectionId}/airdrop`)
}

function handleList() {
  router.push(`/${props.chain}/studio/${props.collectionId}/list`)
}

function handleTransfer() {
  router.push(`/${props.chain}/studio/${props.collectionId}/transfer`)
}
</script>

<template>
  <div class="p-4 space-y-4">
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium">
        {{ selectedCount }} item{{ selectedCount !== 1 ? 's' : '' }} selected
      </span>
      <UButton
        variant="ghost"
        size="xs"
        icon="i-heroicons-x-mark"
        @click="emit('toggleSelection')"
      />
    </div>

    <div class="flex gap-2">
      <UButton
        size="sm"
        variant="outline"
        @click="emit('selectAll')"
      >
        Select All
      </UButton>
      <UButton
        size="sm"
        variant="ghost"
        @click="emit('clearSelection')"
      >
        Clear
      </UButton>
    </div>

    <USeparator />

    <div class="space-y-1">
      <p class="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Actions
      </p>

      <UButton
        class="w-full justify-start"
        variant="ghost"
        icon="i-heroicons-paper-airplane"
        :disabled="selectedCount === 0"
        @click="handleAirdrop"
      >
        Airdrop
      </UButton>

      <UButton
        class="w-full justify-start"
        variant="ghost"
        icon="i-heroicons-tag"
        :disabled="selectedCount === 0"
        @click="handleList"
      >
        List
      </UButton>

      <UButton
        class="w-full justify-start"
        variant="ghost"
        icon="i-heroicons-arrow-right-circle"
        :disabled="selectedCount === 0"
        @click="handleTransfer"
      >
        Transfer
      </UButton>
    </div>
  </div>
</template>
