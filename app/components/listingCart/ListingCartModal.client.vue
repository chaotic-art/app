<script setup lang="ts">
import { toNative } from '@/utils/format/balance'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import useQueryBalance from '~/composables/useQueryBalance'

const { $i18n } = useNuxtApp()
const { accountId } = useAuth()
const { listNfts } = useNftPallets()
const listingCartStore = useListingCartStore()
const { itemsInChain: items } = storeToRefs(listingCartStore)
const { listingCartModalOpen } = storeToRefs(usePreferencesStore())
const actionCartStore = useActionCartStore()
const { decimals, chainSymbol, currentChain } = useChain()
const { open: isTransactionModalOpen } = useTransactionModal()
const { balance, isLoading: isBalanceLoading } = useQueryBalance({ enabled: listingCartModalOpen })
const listingFees = ref()
const { existentialDeposit } = useDeposit(currentChain)

const { usd: priceUSD, formatted: totalNFTsPrice } = useAmount(
  computed(() =>
    toNative(
      sum(listingCartStore.itemsInChain.map(nft => Number(nft.listPrice || 0))),
      decimals.value,
    )),
  decimals,
  chainSymbol,
)

const isLoading = computed(() => (
  listingCartModalOpen.value
  && !items.value.length
  && !isBalanceLoading.value
))

const cartHasNFTsWithPrice = computed(() =>
  listingCartStore.itemsInChain.map(nft => Number(nft.price)).some(Boolean),
)
const showChangePriceModal = computed(
  () => cartHasNFTsWithPrice.value && listingCartStore.count === 1,
)

const title = computed(() => {
  if (isLoading.value) {
    return ''
  }

  const items
    = listingCartStore.count === 1
      ? 'NFT'
      : `${listingCartStore.count} ${$i18n.t('general.items')}`

  return showChangePriceModal.value
    ? $i18n.t('listingCart.changePrice')
    : `List ${items}`
})

const confirmButtonDisabled = computed(
  () => Boolean(listingCartStore.incompleteListPrices),
)

const hasEnoughFunds = computed(() => {
  return (Number(balance.value) - Number(existentialDeposit.value)) > listingFees.value
})

const label = computed(() => {
  if (!hasEnoughFunds.value) {
    return $i18n.t('balance.insufficient')
  }

  switch (listingCartStore.incompleteListPrices) {
    case 0:
      return showChangePriceModal.value
        ? $i18n.t('listingCart.changePrice')
        : $i18n.t('listingCart.complete')
    case 1:
      return listingCartStore.count === 1
        ? $i18n.t('listingCart.inputPriceFirst')
        : $i18n.t('listingCart.missing1')
    default:
      return `${listingCartStore.incompleteListPrices} ${$i18n.t(
        'listingCart.missingMultiple',
      )}`
  }
})

function getListParams() {
  return {
    nfts: items.value.map(item => ({
      id: item.id,
      sn: item.sn,
      collection: item.collection,
      price: toNative(item.listPrice || 0, decimals.value),
      metadata_uri: item.metadata_uri,
      metadata: item.metadata,
    })),
    chain: currentChain.value,
  }
}

function handleListNfts() {
  const listParams = getListParams()
  // order matters
  isTransactionModalOpen.value = true
  listingCartModalOpen.value = false

  listingCartStore.clearCartItems()
  actionCartStore.clearCartItems()

  listNfts({
    type: 'submit',
    ...listParams,
  })
}

watchEffect(async () => {
  // TODO: debounce
  if (accountId.value) {
    try {
      listingFees.value = Number(
        await listNfts({
          ...getListParams(),
          type: 'estimate',
        }),
      )
    }
    catch {}
  }
})

useModalIsOpenTracker({
  isOpen: listingCartModalOpen,
  onClose: () => {
    if (!isTransactionModalOpen.value) {
      listingCartStore.clearCartItems()
    }
  },
})
</script>

<template>
  <UModal
    v-model:open="listingCartModalOpen"
    :title="title"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <div v-if="isLoading" class="space-y-4">
        <!-- Header skeleton -->
        <div class="flex items-center gap-3">
          <USkeleton class="h-10 w-10 rounded-full" />
          <div class="space-y-2 flex-1">
            <USkeleton class="h-4 w-3/4" />
            <USkeleton class="h-3 w-1/2" />
          </div>
        </div>

        <!-- List items skeleton -->
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center gap-3 p-3 rounded-lg border border-muted">
            <USkeleton class="h-12 w-12 rounded-md" />
            <div class="space-y-2 flex-1">
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-3 w-3/4" />
              <USkeleton class="h-3 w-1/2" />
            </div>
            <USkeleton class="h-8 w-16 rounded-md" />
          </div>
        </div>

        <!-- Footer skeleton -->
        <div class="flex gap-2 pt-4">
          <USkeleton class="h-10 flex-1 rounded-md" />
          <USkeleton class="h-10 w-20 rounded-md" />
        </div>
      </div>

      <div v-else>
        <div class="flex flex-col">
          <div class="p-3 border border-border rounded-full">
            <UserInfo
              :address="accountId"
              :avatar-size="40"
              transparent-background
            />
          </div>

          <div class="py-5">
            <ListingCartSingleItem
              v-if="items.length === 1 && items[0]"
              :item="items[0]"
            />

            <ListingCartMultipleItems
              v-if="items.length > 1"
              :items="items"
            />
          </div>

          <div class="space-y-6">
            <div class="bg-gray-50 dark:bg-neutral-800 rounded-lg p-4 space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-gray-900 dark:text-white font-medium">Potential Earnings</span>
                <div class="flex">
                  <div class="text-gray-900 dark:text-white font-medium">
                    {{ totalNFTsPrice }}
                  </div>
                  <span class="text-gray-500 dark:text-gray-400 ml-2">{{ priceUSD }}</span>
                </div>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-gray-600 dark:text-gray-300">Listing Fees</span>
                <Money class="text-gray-600 dark:text-gray-300" :value="listingFees" inline />
              </div>
            </div>

            <UButton
              class="w-full py-4 inline-flex justify-center"
              :label="label"
              :disabled="confirmButtonDisabled"
              @click="handleListNfts"
            />
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
