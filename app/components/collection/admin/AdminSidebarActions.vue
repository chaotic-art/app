<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { warningMessage } from '~/utils/notification'

const props = defineProps<{
  collectionId: string
  collectionName?: string
  chain: AssetHubChain
}>()

const emit = defineEmits<{
  toggleSelection: []
}>()

const route = useRoute()
const router = useRouter()

const isMock = computed(() => route.query.mock === 'true')

function handleMassMint() {
  const mockQuery = isMock.value ? '?mock=true' : ''
  const url = `/${props.chain}/studio/${props.collectionId}/massmint${mockQuery}`
  router.push(url)
}

function handleSelectItems() {
  emit('toggleSelection')
}

function handleDestroyCollection() {
  warningMessage('Coming soon — collection deletion will be available in a future update.')
}
</script>

<template>
  <div class="p-4 space-y-2">
    <UButton
      class="w-full"
      icon="i-heroicons-squares-plus"
      @click="handleMassMint"
    >
      Mass Mint
    </UButton>

    <UButton
      class="w-full"
      variant="outline"
      icon="i-heroicons-cursor-arrow-ripple"
      @click="handleSelectItems"
    >
      Select Items
    </UButton>

    <USeparator class="my-3!" />

    <UButton
      class="w-full"
      color="error"
      variant="outline"
      icon="i-heroicons-trash"
      @click="handleDestroyCollection"
    >
      Delete Collection
    </UButton>
  </div>
</template>
