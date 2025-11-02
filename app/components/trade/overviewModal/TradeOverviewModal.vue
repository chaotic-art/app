<script setup lang="ts">
import type { ExecTxParams, OverviewMode, TradeDetailedToken } from './utils'
import type { TradeNftItem } from '@/components/trade/types'
import type { OdaToken } from '~/services/oda'
import { useQuery } from '@tanstack/vue-query'
import ModalIdentityItem from '@/components/common/ModalIdentityItem.vue'
import { TradeType } from '@/components/trade/types'
import TradeOverviewModalContent from './Content.vue'
import { fetchTradeDetailedToken, TradeTypeTx, useIsTradeOverview } from './utils'

interface OverviewModeDetails {
  title: string
  signingTitle: string
  notificationTitle: string
}

interface Details {
  transactionSuccessTitle: string
  transactionSuccessTab: string
}

interface TradeNFTs { desired?: TradeDetailedToken, offered: TradeDetailedToken }

const props = defineProps<{
  trade?: TradeNftItem
}>()

const emit = defineEmits(['close'])

const { $i18n } = useNuxtApp()

const TradeTypeOverviewModeDetails: Record<TradeType, Record<OverviewMode, OverviewModeDetails>> = {
  [TradeType.SWAP]: {
    incoming: {
      title: $i18n.t('swap.incomingSwap'),
      signingTitle: $i18n.t('transaction.acceptSwap'),
      notificationTitle: $i18n.t('swap.acceptSwap'),
    },
    owner: {
      title: $i18n.t('swap.yourSwap'),
      signingTitle: $i18n.t('transaction.cancelSwap'),
      notificationTitle: $i18n.t('swap.swapCancellation'),
    },
  },
  [TradeType.OFFER]: {
    incoming: {
      title: $i18n.t('offer.incomingOffer'),
      signingTitle: $i18n.t('offer.acceptOffer'),
      notificationTitle: $i18n.t('offer.offerAccept'),
    },
    owner: {
      title: $i18n.t('offer.yourOffer'),
      signingTitle: $i18n.t('offer.cancelOffer'),
      notificationTitle: $i18n.t('offer.offerCancellation'),
    },
  },
}

const TradeTypeDetails: Record<TradeType, Details> = {
  [TradeType.SWAP]: {
    transactionSuccessTitle: $i18n.t('swap.manageSwaps'),
    transactionSuccessTab: 'swaps',
  },
  [TradeType.OFFER]: {
    transactionSuccessTitle: $i18n.t('offer.manageOffers'),
    transactionSuccessTab: 'offers',
  },
}

const modelValue = defineModel({ type: Boolean, required: true })

const selectedSendItemId = ref<string>()
const session = ref<string>()

const { currentChain } = useChain()

const { mode, isIncomingTrade } = useIsTradeOverview(computed(() => props.trade))

const trade = computed(() => props.trade)
const needsToSelectSendItem = computed(() => isIncomingTrade.value && !sendItem.value && Boolean(trade.value?.isAnyTokenInCollectionDesired))
const disabled = computed(() => needsToSelectSendItem.value)

const label = computed<string | undefined>(() => {
  if (needsToSelectSendItem.value) {
    return $i18n.t('trades.selectSendItem')
  }
  return undefined
})

const details = computed<Details & OverviewModeDetails>(() =>
  trade.value
    ? {
        ...TradeTypeDetails[trade.value.type],
        ...TradeTypeOverviewModeDetails[trade.value.type][mode.value],
      }
    : {
        title: '',
        signingTitle: '',
        notificationTitle: '',
        transactionSuccessTitle: '',
        transactionSuccessTab: '',
      })

const { data: nft, isLoading: nftLoading } = useQuery<TradeNFTs | null>({
  queryKey: ['trade-nft', computed(() => trade.value?.id)],
  queryFn: async () => {
    if (!trade.value) {
      return null
    }

    const promises = [
      fetchTradeDetailedToken(trade.value.offered.id, currentChain.value),
    ]

    if (trade.value.desired) {
      promises.push(fetchTradeDetailedToken(trade.value.desired.id, currentChain.value))
    }

    const [offered, desired] = await Promise.all(promises)

    return {
      offered: offered!,
      desired: desired!,
    }
  },
})

const { data: sendItem } = useQuery({
  queryKey: ['send-item', selectedSendItemId],
  queryFn: async () => {
    if (!selectedSendItemId.value) {
      return null
    }
    return await fetchTradeDetailedToken(selectedSendItemId.value, currentChain.value)
  },
})

const loading = computed(() => nftLoading.value || !nft.value)

const selectSendItem = (item: OdaToken) => selectedSendItemId.value = item.id
const clearSendItem = () => selectedSendItemId.value = undefined

function onClose() {
  modelValue.value = false
  emit('close')
}

function reset() {
  clearSendItem()
}

function execTransaction() {
  console.log('hi', mode.value)

  if (!nft.value || !trade.value) {
    return
  }

  modelValue.value = false

  const params: ExecTxParams = {
    trade: trade.value,
    chain: currentChain.value,
    sendItem: trade.value.desired?.sn || sendItem.value?.id as string,
  }

  console.log(mode.value)

  TradeTypeTx[trade.value.type][mode.value](params)
}

function initSession() {
  session.value = window.crypto.randomUUID()
  reset()
}

useModalIsOpenTracker({
  isOpen: modelValue,
  onOpen: initSession,
})

// useTransactionNotification({
//   status,
//   isError,
//   sessionId: lastSessionId,
//   updateSession,
//   init: () => {
//     vModel.value = false
//     return notification(({ isSessionState, notify, session }) => {
//       return notify({
//         title: details.value.notificationTitle,
//         state: computed(() => session.value.state),
//         action: computed(() => {
//           if (isSessionState('succeeded')) {
//             return {
//               label: details.value.transactionSuccessTitle,
//               icon: 'arrow-up-right',
//               url: `/${prefix.value}/u/${accountId.value}?tab=${details.value.transactionSuccessTab}&filter=outgoing`,
//             }
//           }
//           return undefined
//         }),
//         showIndexerDelayMessage: true,
//       })
//     })
//   },
// })
</script>

<template>
  <div>
    <UModal
      v-model:open="modelValue"
      :title="details.title"
      :ui="{
        content: 'max-w-md w-full',
      }"
      @close="onClose"
    >
      <template #body>
        <template v-if="loading">
          <div class="space-y-4 min-h-[200px]">
            <!-- Header skeleton (identity/info) -->

            <div class="space-y-3">
              <div class="flex items-center gap-3 p-3 rounded-full border border-muted">
                <USkeleton class="h-10 w-10 rounded-full" />
                <div class="space-y-2 flex-1">
                  <USkeleton class="h-4 w-1/2" />
                </div>
              </div>
            </div>

            <!-- Content skeleton (token details) -->
            <div class="space-y-3 pt-2">
              <div class="flex items-center gap-3">
                <USkeleton class="h-12 w-12 rounded-md" />
                <div class="space-y-2 flex-1">
                  <USkeleton class="h-4 w-3/4" />
                  <USkeleton class="h-3 w-1/2" />
                </div>
                <USkeleton class="h-8 w-16 rounded-md" />
              </div>
            </div>

            <div class="flex flex-col gap-4 pt-2">
              <USkeleton class="h-4 w-full rounded-md" />

              <USkeleton class="h-4 w-full rounded-md" />
            </div>

            <!-- Footer skeleton (action button) -->
            <div class="pt-4">
              <USkeleton class="h-10 w-full rounded-md" />
            </div>
          </div>
        </template>

        <template v-else>
          <ModalIdentityItem />

          <TradeOverviewModalContent
            v-if="trade && nft"
            :key="session"
            :desired="nft.desired"
            :offered="nft.offered"
            :trade="trade"
            :send-item="sendItem"
            @send-item-select="selectSendItem"
            @send-item-clear="clearSendItem"
          />

          <div
            v-if="trade"
            class="pt-5!"
          >
            <TradeOwnerButton
              main-class="w-full! capitalize"
              :trade="trade"
              :label="label"
              :disabled="disabled"
              @click-main="execTransaction"
            />
          </div>
        </template>
      </template>
    </UModal>
  </div>
</template>
