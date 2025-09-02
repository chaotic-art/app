<script setup lang="ts">
import { useNftPallets } from '~/composables/onchain/useNftPallets'

const emit = defineEmits<{ close: [boolean] }>()

const { currentChain } = useChain()
const { accountId } = useAuth()
const { items } = useActionCartStore()
const { burnNfts } = useNftPallets()

const acknowledged = ref(false)
const elligibleToBurn = computed(() => items.filter(item => !item.mimeType?.includes('html')))

function burn() {
  burnNfts({ items, chain: currentChain.value, type: 'submit' })
  emit('close', false)
}
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Burn NFT(s)"
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
          <CartItemDetails
            v-for="item in items"
            :key="item.id"
            :name="item.name"
            :image="item.metadata?.image"
            :collection-name="item.collection.name"
            :price="item.price"
            :not-eligible="item.mimeType?.includes('html')"
          />
        </div>

        <!-- <USeparator class="my-4" />

        <div class="flex justify-between items-center">
          <span class="text-foreground font-medium">Network Fee</span>
          <div class="flex items-center gap-2">
            <span class="text-foreground font-medium">{{ formatBalance(fees?.toString(), { decimals, symbol: chainSymbol }) }}</span>
          </div>
        </div> -->

        <USeparator class="my-4" />

        <div v-if="elligibleToBurn.length" class="flex items-start gap-3 mb-6">
          <UCheckbox
            v-model="acknowledged"
            :ui="{ base: 'mt-1' }"
          />
          <span class="text-foreground">
            I Understand NFT(S) Will Be Permanently Destroyed
          </span>
        </div>

        <UButton
          v-if="elligibleToBurn.length"
          class="w-full"
          :disabled="!acknowledged"
          variant="outline"
          color="primary"
          size="lg"
          @click="burn"
        >
          {{ acknowledged ? 'Burn NFT(s)' : 'Acknowledge To Continue' }}
        </UButton>
        <UButton
          v-else
          class="w-full"
          variant="outline"
          color="primary"
          size="lg"
        >
          No NFTs to burn
        </UButton>
      </div>
    </template>
  </UModal>
</template>
