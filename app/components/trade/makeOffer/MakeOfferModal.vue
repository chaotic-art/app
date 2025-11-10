<script setup lang="ts">
import type { MakingOfferItem } from '../types'
import type { TxType } from '~/composables/onchain/useNftPallets'
import { whenever } from '@vueuse/core'
import { formatBalance } from 'dedot/utils'
import ModalIdentityItem from '@/components/common/ModalIdentityItem.vue'
import { getOfferCollectionId, OFFER_MINT_PRICE } from '@/composables/onchain/utils'
import { useMakingOfferStore } from '@/stores/makeOffer'
import { usePreferencesStore } from '@/stores/preferences'
import { toNative } from '@/utils/format/balance'
import { sum } from '@/utils/math'
import { warningMessage } from '@/utils/notification'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { unusedOfferedItems as unusedOfferedItemsQuery } from '~/graphql/queries/trades'

const DEFAULT_OFFER_EXPIRATION_DURATION = 7

const offerStore = useMakingOfferStore()
const { accountId, isCurrentAccount } = useAuth()
const { currentChain } = useChain()
const { isSuccess, close, result } = useTransactionModal()

const { makeOfferModalOpen } = storeToRefs(usePreferencesStore())
const { itemsInChain: items, hasInvalidOfferPrices, count } = storeToRefs(offerStore)

const { decimals, chainSymbol } = useChain()
const { $i18n, $apolloClient, $sdk } = useNuxtApp()
const { createOffer } = useNftPallets()

const offeredItem = ref<string>()

const txFees = ref(0)

const teleportTransitionTxFees = computed(() =>
  formatBalance(
    (txFees.value || 0) + OFFER_MINT_PRICE,
    { decimals: decimals.value, symbol: chainSymbol.value },
  ),
)

const totalOfferAmount = computed(
  () => toNative(sum(items.value.map(nft => Number(nft.offerPrice || 0))), decimals.value),
)

const totalNeededAmount = computed(() => totalOfferAmount.value + (!offeredItem.value ? OFFER_MINT_PRICE : 0))

const confirmButtonDisabled = computed(
  () => hasInvalidOfferPrices.value,
)

const confirmListingLabel = computed(() => {
  if (!totalOfferAmount.value) {
    return $i18n.t('offer.emptyInput')
  }

  if (hasInvalidOfferPrices.value) {
    return $i18n.t('offer.invalidPrice')
  }

  return $i18n.t('offer.createOffer')
})

function closeMakingOfferModal() {
  makeOfferModalOpen.value = false
}

function createOfferTx(items: MakingOfferItem[], type: TxType) {
  return createOffer({
    items: items.map(item => ({
      price: item.offerPrice ? String(Number(toNative(Number(item.offerPrice), decimals.value))) : '',
      desiredItem: Number(item.sn),
      desiredCollectionId: Number(item.collection.id),
      offeredItem: offeredItem.value ? Number(offeredItem.value) : undefined,
      duration: item.offerExpiration || DEFAULT_OFFER_EXPIRATION_DURATION,
    })),
    chain: currentChain.value,
    type,
  })
}

async function confirm() {
  try {
    createOfferTx([...items.value], 'submit')

    closeMakingOfferModal()
  }
  catch (error) {
    console.error(error)
    warningMessage($i18n.t('offer.failed'))
  }
}

function onClose() {
  closeMakingOfferModal()
}

async function fetchUnusedOfferCollectionTokens(collectionId: string): Promise<string[]> {
  const { api } = $sdk(currentChain.value)

  try {
    const { data: { offers: items } } = await $apolloClient.query({
      query: unusedOfferedItemsQuery,
      variables: {
        where: {
          status_not_in: ['ACTIVE', 'ACCEPTED'],
          caller_eq: accountId.value,
          nft: {
            currentOwner_eq: accountId.value,
            collection: {
              id_eq: collectionId,
            },
          },
        },
      },
    })

    const keys = items.map(({ nft }) => [Number(collectionId), Number(nft.sn)] as [number, number])

    // edge case: if a user quickly creates/accepts multiple offers and
    // due to indexer delay we need to verify with onchain data the following cases
    const [itemsData, pendingSwapsData] = await Promise.all([
      // after a offer is accepted the offered item changes ownership
      // so we need to check the current owner of the item
      api.query.Nfts.Item.getValues(keys, { at: 'best' }),
      // since offer id follows format `collectionId-tokenId`
      // is not possible to create multiple offers using the same offered item
      // doing so will be overridden the previous offer
      api.query.Nfts.PendingSwapOf.getValues(keys, { at: 'best' }),
    ])

    const onchainTokenData = items.map(({ nft }, index) => ({
      owner: itemsData[index]?.owner,
      pendingSwap: pendingSwapsData[index],
      sn: nft.sn,
    }))

    const unusedOfferItems = onchainTokenData.filter(token =>
      token.owner && isCurrentAccount(token.owner)
      && !token.pendingSwap,
    )

    return unusedOfferItems.map(token => token.sn)
  }
  catch (error) {
    console.error(error)
    return []
  }
}

watch(
  () => count.value,
  () => {
    if (count.value === 0) {
      closeMakingOfferModal()
    }
  },
)

useModalIsOpenTracker({
  isOpen: makeOfferModalOpen,
  onClose: () => {
    offerStore.clear()
  },
})

useModalIsOpenTracker({
  isOpen: makeOfferModalOpen,
  onOpen: async () => {
    createOfferTx(items.value, 'estimate')
      .then((amount) => {
        txFees.value = Number(amount)
      })
      .catch((error) => {
        console.error('Error estimating transaction fees:', error)
      })

    offeredItem.value = undefined
    const unusedOfferedItems = await fetchUnusedOfferCollectionTokens(String(getOfferCollectionId(currentChain.value)))
    offeredItem.value = unusedOfferedItems[0]
  },
})

whenever(() => isSuccess.value && result.value?.type === 'create_offer', () => {
  close()

  successMessage(
    $i18n.t('offer.offerCreation'),
    h('div', { class: 'flex justify-center w-fit gap-2' }, [
      h('span', {}, 'Completed'),
      h(resolveComponent('ULink'), {
        class: 'flex items-center justify-center',
        to: `/${currentChain.value}/u/${accountId.value}?tab=offers&filter=outgoing`,
      }, [
        h('span', {}, $i18n.t('offer.manageOffers')),
        h(resolveComponent('UIcon'), {
          name: 'tabler:arrow-up-right',
          size: '16px',
        }),
      ]),
    ]),
  )
})

onBeforeMount(closeMakingOfferModal)
onUnmounted(closeMakingOfferModal)
</script>

<template>
  <div>
    <UModal
      v-model:open="makeOfferModalOpen"
      :title="$t('offer.createOffer')"
      :ui="{
        content: 'max-w-md w-full',
      }"
      @close="onClose"
    >
      <template #body>
        <div class="overflow-y-auto flex flex-col gap-5">
          <ModalIdentityItem />

          <MakeOfferSingleItem
            v-if="offerStore.items.length === 1 && offerStore.items[0]"
            :item="offerStore.items[0]"
            :show-price="Boolean(offerStore.items[0]?.price)"
          />
        </div>

        <USeparator class="my-4" />

        <div class="mb-4">
          <div
            class="flex justify-between text-gray-600 dark:text-gray-400"
          >
            <span>{{ $t('offer.offerFees') }}</span>
            <span class="ml-2">{{ teleportTransitionTxFees }}</span>
          </div>
        </div>

        <!-- tmp provide amount above 0 to force paraport to render propely -->
        <ParaportButton
          :amount="totalNeededAmount || 1"
          :label="confirmListingLabel"
          :disabled="confirmButtonDisabled"
          @confirm="confirm"
        />
      </template>
    </UModal>
  </div>
</template>
