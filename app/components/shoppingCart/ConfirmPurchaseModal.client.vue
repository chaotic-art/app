<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { useNftPallets } from '~/composables/onchain/useNftPallets'

const { completePurchaseModal } = storeToRefs(usePreferencesStore())
const shoppingCartStore = useShoppingCartStore()
const { itemsInChain, itemToBuy } = storeToRefs(shoppingCartStore)
const { accountId } = useAuth()
const { decimals, chainSymbol } = useChain()
const { open: isTransactionModalOpen } = useTransactionModal()
const { buyNfts } = useNftPallets()
const { prefix } = usePrefix()

const isModalOpen = computed({
  get: () => completePurchaseModal.value.open,
  set: (value) => {
    completePurchaseModal.value.open = value
  },
})

const items = computed(() => completePurchaseModal.value.mode === 'shopping-cart' ? itemsInChain.value : [itemToBuy.value].filter(Boolean) as [])

const nftPrice = computed(() => sum(items.value.map(nft => Number(nft.price || 0))))
const serviceFee = computed(() => getPercentSupportFee(nftPrice.value))
const total = computed(() => nftPrice.value + serviceFee.value)

const { usd, formatted } = useAmount(
  total,
  decimals,
  chainSymbol,
)

const label = computed(() => {
  return 'Confirm'
})

function buy() {
  isTransactionModalOpen.value = true
  isModalOpen.value = false

  buyNfts({
    nfts: items.value.map(item => ({
      id: item.id,
      sn: item.sn,
      collection: {
        id: item.collectionId,
        name: item.collection?.name || '',
      },
      price: Number(item.price),
      metadata_uri: item.metadata_uri,
      metadata: item.metadata,
    })),
    chain: prefix.value as AssetHubChain,
  })
}

// useModalIsOpenTracker({
//   isOpen: isModalOpen,
//   onClose: () => {
//     if (!isTransactionModalOpen.value) {
//       shoppingCartStore.clear()
//     }
//   },
// })
</script>

<template>
  <UModal
    v-model:open="isModalOpen"
    title="Confirm Purchase"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <div class="flex flex-col">
        <div class="p-3 border rounded-full">
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
            :collection-name="item.collection?.name"
            :price="item.price"
          />
        </div>

        <USeparator class="my-4" />

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span>Price for NFT(s)</span>
            <Money :value="nftPrice" inline />
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 text-sm">Service Commission (3%)</span>
            <Money class="text-gray-500 dark:text-gray-400 text-sm" :value="serviceFee" inline />
          </div>

          <div class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 text-sm">Royalties</span>
            <span class="text-gray-500 dark:text-gray-400 text-sm">0 DOT</span>
          </div>
        </div>

        <USeparator class="my-4" />

        <div class="flex justify-between items-center">
          <span class="text-gray-900 dark:text-white font-medium">You Will Pay</span>
          <div class="flex">
            <div class="text-gray-900 dark:text-white font-medium">
              {{ usd }}
            </div>
            <span class="text-gray-500 dark:text-gray-400 ml-2">{{ formatted }}</span>
          </div>
        </div>

        <UButton
          class="w-full mt-7 inline-flex justify-center"
          :label="label"
          @click="buy"
        />
      </div>
    </template>
  </UModal>
</template>
