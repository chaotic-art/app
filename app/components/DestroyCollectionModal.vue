<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { useNftPallets } from '~/composables/onchain/useNftPallets'

interface Props {
  collectionId: string
  collectionName?: string
  chain: AssetHubChain
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [boolean] }>()

const router = useRouter()
const { accountId } = useAuth()
const { destroyCollection } = useNftPallets()

const acknowledged = ref(false)
const txFee = ref(0)
const loading = ref(true)

const { onSuccess } = useTransactionModal()

// Redirect to explore page after successful deletion
onSuccess('collection_destroy', () => {
  router.push(`/${props.chain}/explore`)
})

async function destroy() {
  await destroyCollection({
    collectionId: Number(props.collectionId),
    chain: props.chain,
    type: 'submit',
  })
  emit('close', true)
}

onMounted(async () => {
  try {
    const fee = await destroyCollection({
      collectionId: Number(props.collectionId),
      chain: props.chain,
      type: 'estimate',
    })
    txFee.value = Number(fee || 0)
  }
  catch (error) {
    console.error('Error estimating fees:', error)
  }
  finally {
    loading.value = false
  }
})
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Destroy Collection"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <div class="flex flex-col">
        <div class="p-3 border border-border rounded-full">
          <UserInfo
            :address="accountId"
            :avatar-size="40"
            transparent-background
          />
        </div>

        <div class="mt-5 flex flex-col gap-4">
          <div class="p-4 border border-border rounded-lg">
            <div class="text-sm text-muted-foreground mb-1">
              Collection ID
            </div>
            <div class="font-medium">
              {{ collectionId }}
            </div>
            <div v-if="collectionName" class="text-sm text-muted-foreground mt-2">
              {{ collectionName }}
            </div>
          </div>
        </div>

        <USeparator class="my-4" />

        <div class="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
          <div class="flex gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div class="text-sm text-destructive">
              <div class="font-semibold mb-1">
                Warning: This action cannot be undone
              </div>
              <ul class="list-disc list-inside space-y-1 text-xs">
                <li>The collection will be permanently destroyed</li>
                <li><strong>All NFTs in this collection MUST be burned first</strong></li>
                <li>All metadata and attributes will be deleted</li>
                <li>This operation will fail if any NFTs still exist</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-3 mb-6">
          <UCheckbox
            v-model="acknowledged"
            :ui="{ base: 'mt-1' }"
          />
          <span class="text-foreground">
            I understand this collection will be permanently destroyed and this action cannot be undone
          </span>
        </div>

        <UButton
          class="w-full"
          color="error"
          size="lg"
          :disabled="!acknowledged || loading"
          :loading="loading"
          @click="destroy"
        >
          {{ acknowledged ? 'Destroy Collection' : 'Acknowledge To Continue' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
