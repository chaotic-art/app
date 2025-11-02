<script setup lang="ts">
import type { TxType } from '~/composables/onchain/useNftPallets'
import { whenever } from '@vueuse/core'
import { formatBalance } from 'dedot/utils'
import { shuffle } from 'lodash'
import ModalIdentityItem from '@/components/common/ModalIdentityItem.vue'
import { getOfferCollectionId, OFFER_MINT_PRICE } from '@/composables/onchain/utils'
import { useMakingOfferStore } from '@/stores/makeOffer'
import { usePreferencesStore } from '@/stores/preferences'
import { toNative } from '@/utils/format/balance'
import { sum } from '@/utils/math'
import { warningMessage } from '@/utils/notification'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { unusedOfferedItems } from '~/graphql/queries/trades'

const DEFAULT_OFFER_EXPIRATION_DURATION = 7

const offerStore = useMakingOfferStore()
const { accountId } = useAuth()
const { currentChain } = useChain()
const { isSuccess, close, result } = useTransactionModal()

const { makeOfferModalOpen } = storeToRefs(usePreferencesStore())
const { itemsInChain: items, hasInvalidOfferPrices, count } = storeToRefs(offerStore)

const { decimals, chainSymbol } = useChain()
const { $i18n } = useNuxtApp()
const { createOffer } = useNftPallets()

const unusedOfferedItemsSubscription = ref(() => {})
const usedOfferedItems = ref<string[]>([])
const offeredItem = ref<string>()

const txFees = ref(0)

const teleportTransitionTxFees = computed(() =>
  formatBalance(
    (txFees.value || 0) + OFFER_MINT_PRICE,
    { decimals: decimals.value, symbol: chainSymbol.value },
  ),
)

const totalOfferAmount = computed(
  () => toNative(sum(items.value.map(nft => Number(nft.offerPrice || 0))), decimals.value),
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

const closeMakingOfferModal = () => (makeOfferModalOpen.value = false)

function createOfferTx(type: TxType) {
  return createOffer({
    items: items.value.map(item => ({
      price: item.offerPrice ? String(Number(toNative(Number(item.offerPrice), decimals.value))) : '',
      desiredItem: Number(item.sn),
      desiredCollectionId: Number(item.collection.id),
      offeredItem: Number(offeredItem.value),
      duration: item.offerExpiration || DEFAULT_OFFER_EXPIRATION_DURATION,
    })),
    chain: currentChain.value,
    type,
  })
}

async function confirm() {
  try {
    unusedOfferedItemsSubscription.value()

    await createOfferTx('submit')

    offerStore.clear()

    closeMakingOfferModal()
  }
  catch (error) {
    warningMessage(error?.message)
  }
}

function onClose() {
  closeMakingOfferModal()
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
    unusedOfferedItemsSubscription.value()
  },
})

useModalIsOpenTracker({
  isOpen: makeOfferModalOpen,
  onOpen: () => {
    createOfferTx('estimate')
      .then((amount) => {
        txFees.value = Number(amount)
      })
      .catch((error) => {
        console.error('Error estimating transaction fees:', error)
      })

    unusedOfferedItemsSubscription.value = useSubscriptionGraphql({
      query: unusedOfferedItems,
      variables: {
        where: {
          status_not_in: ['ACTIVE', 'ACCEPTED'],
          caller_eq: accountId.value,
          nft: {
            currentOwner_eq: accountId.value,
            collection: {
              id_eq: String(getOfferCollectionId(currentChain.value)),
            },
          },
        },
      },
      onChange: ({ data: { offers: items } }) => {
        const tokensSn = items
          .map(({ nft }) => nft.sn)
          .filter((tokenSn: string) => !usedOfferedItems.value.includes(tokenSn))

        const unusedOfferedItems = shuffle(tokensSn)

        offeredItem.value = unusedOfferedItems[0]
      },
    })
  },
})

whenever(() => isSuccess.value && result.value?.type === 'create_offer', () => {
  if (offeredItem.value) {
    usedOfferedItems.value.push(offeredItem.value)
    offeredItem.value = undefined
  }

  close()

  successMessage(
    'Transaction Complted',
    h('div', { class: 'flex justify-center w-fit' }, [
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

        <div class="py-2">
          <div
            class="flex justify-between text-gray-600 dark:text-gray-400 border-b-k-shade"
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
