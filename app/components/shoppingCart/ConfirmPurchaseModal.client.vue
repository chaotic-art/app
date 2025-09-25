<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { useQuery } from '@tanstack/vue-query'
import { useNftPallets } from '~/composables/onchain/useNftPallets'

const { completePurchaseModal } = storeToRefs(usePreferencesStore())
const shoppingCartStore = useShoppingCartStore()
const { itemsInChain, itemToBuy } = storeToRefs(shoppingCartStore)
const { accountId } = useAuth()
const { decimals, chainSymbol, currentChain } = useChain()
const { open: isTransactionModalOpen } = useTransactionModal()
const { buyNfts, collectionRoyalties } = useNftPallets()

const isModalOpen = computed({
  get: () => completePurchaseModal.value.open,
  set: (value) => {
    completePurchaseModal.value.open = value
  },
})

const items = computed(() => completePurchaseModal.value.mode === 'shopping-cart' ? itemsInChain.value : [itemToBuy.value].filter(Boolean) as ShoppingCartItem[])

const nftPrice = computed(() => sum(items.value.map(nft => Number(nft.price || 0))))
const serviceFee = computed(() => getPercentSupportFee(nftPrice.value))
const total = computed(() => nftPrice.value + serviceFee.value)

const { usd, formatted } = useAmount(
  total,
  decimals,
  chainSymbol,
)

const { data: royaltiesData, isPending: isRoyaltiesLoading } = useQuery({
  queryKey: ['royalties', items.value.map(item => item.id)],
  queryFn: () => Promise.all(items.value.map(item => collectionRoyalties(item.chain, item.collection.id))),
  enabled: isModalOpen,
})

const totalRoyalties = computed(() => {
  let total = 0

  for (const [index, item] of items.value.entries()) {
    total += Math.floor(Number(item.price) * ((royaltiesData.value?.[index]?.amount || 0) / 100))
  }

  return total
})

const loading = computed(() => isRoyaltiesLoading.value)

const label = computed(() => {
  if (loading.value) {
    return 'Loading...'
  }

  return 'Confirm'
})

const isDisabled = computed(() => loading.value)

function buy() {
  isTransactionModalOpen.value = true
  isModalOpen.value = false

  buyNfts({
    nfts: items.value.map(item => ({
      id: item.id,
      sn: item.sn,
      collection: item.collection,
      price: Number(item.price),
      metadata_uri: item.metadata_uri,
      metadata: item.metadata,
    })),
    chain: currentChain.value as AssetHubChain,
  })
}
</script>

<template>
  <UModal
    v-model:open="isModalOpen"
    :title="$t('shoppingCart.confirmPurchase')"
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
          />
        </div>

        <USeparator class="my-4" />

        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span>{{ $t('shoppingCart.priceForNfts') }}</span>
            <Money :value="nftPrice" inline />
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 text-sm">{{ $t('shoppingCart.serviceCommission') }}</span>
            <Money class="text-gray-500 dark:text-gray-400 text-sm" :value="serviceFee" inline />
          </div>

          <div v-if="totalRoyalties" class="flex justify-between items-center">
            <span class="text-gray-500 dark:text-gray-400 text-sm">{{ $t('shoppingCart.royalties') }}</span>
            <Money class="text-gray-500 dark:text-gray-400 text-sm" :value="totalRoyalties" inline />
          </div>
        </div>

        <USeparator class="my-4" />

        <div class="flex justify-between items-center">
          <span class="text-gray-900 dark:text-white font-medium">{{ $t('shoppingCart.youWillPay') }}</span>
          <div class="flex">
            <div class="text-gray-900 dark:text-white font-medium">
              {{ usd }}
            </div>
            <span class="text-gray-500 dark:text-gray-400 ml-2">{{ formatted }}</span>
          </div>
        </div>

        <div class="mt-7">
          <ParaportButton
            :amount="total"
            :disabled="isDisabled"
            :label="label"
            @confirm="buy"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
