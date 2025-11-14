<script setup lang="ts">
import type { TokenToSwap } from '~/composables/onchain/useNftPallets'
import { SwapStep } from '@/components/swap/types'
import { useNftPallets } from '~/composables/onchain/useNftPallets'

const router = useRouter()
const { $i18n } = useNuxtApp()
const { currentChain } = useChain()
const { accountId } = useAuth()
const { createSwap } = useNftPallets()
const { onSuccess } = useTransactionModal()

const swapStore = useAtomicSwapStore()
const { swap } = storeToRefs(swapStore)

const offeredQuery = computed(() => ({ id_in: swap.value?.offered.map(item => item.id) }))
const desiredQuery = computed(() => ({ id_in: swap.value?.desired.map(item => item.id) }))

function toTokenToSwap(item: SwapItem): TokenToSwap {
  return {
    collectionId: item.collectionId,
    sn: item.sn ? Number(item.sn) : undefined,
  }
}

const surcharge = computed(() => swap.value?.surcharge)

function onModifyOfferClick() {
  router.push({ name: getSwapStepRouteName(SwapStep.DESIRED, swap.value?.isCollectionSwap), params: { id: swap.value?.counterparty }, query: { swapId: swap.value?.id } })
}

function submit() {
  if (!swap.value) {
    return
  }

  createSwap({
    offered: swap.value.offered.map(toTokenToSwap),
    desired: swap.value.desired.map(toTokenToSwap),
    duration: swap.value.duration,
    surcharge: surcharge.value,
    chain: currentChain.value,
    type: 'submit',
  })
}

onSuccess<CreateSwapTransactionResult>('create_swap', (data) => {
  successMessage($i18n.t('swap.created'))

  swapStore.updateSwap({ blockNumber: data.blockNumber })

  navigateTo(`/${currentChain.value}/u/${accountId.value}?tab=swaps&filter=outgoing`)
})
</script>

<template>
  <SwapLayout class="pb-[100px]">
    <template #title>
      <SwapBannerTitle
        step="4/4"
        :title="$t('swap.reviewOffer')"
        :subtitle="$t('swap.reviewCheckAssets')"
      />
    </template>

    <div>
      <USeparator class="mb-10 mt-0" />

      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="flex items-center mb-2 gap-2">
            <div class="text-3xl md:text-4xl lg:text-5xl font-medium font-serif italic text-foreground">
              {{ $t('swap.youOffer') }}
            </div>
            <UIcon
              class="text-5xl"
              name="i-mdi:arrow-up"
              size="lg"
            />
          </div>

          <p class="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {{ $t('swap.reviewSelected') }}
          </p>

          <SwapGridList
            :query="offeredQuery"
            class="my-10!"
            :surcharge="surcharge?.direction === 'Send' ? surcharge : undefined"
          />
        </div>

        <div class="hidden md:flex md:items-center">
          <UIcon
            class="text-5xl"
            name="i-mdi:swap-horizontal"
            size="lg"
          />
        </div>

        <div class="flex-1">
          <div class="flex items-center mb-2 gap-2">
            <div class="text-3xl md:text-4xl lg:text-5xl font-medium font-serif italic text-foreground mb-0">
              {{ $t('swap.youWillReceive') }}
            </div>
            <UIcon
              class="text-5xl"
              name="i-mdi:arrow-down"
              size="lg"
            />
          </div>
          <p class="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {{ $t('swap.reviewCounterpartyAccept') }}
          </p>

          <SwapCollectionSwapGridList
            v-if="swap.isCollectionSwap"
          />
          <SwapGridList
            v-else
            :query="desiredQuery"
            class="my-10!"
            :surcharge="surcharge?.direction === 'Receive' ? surcharge : undefined"
          />
        </div>
      </div>
    </div>
  </SwapLayout>

  <div class="fixed bottom-0 left-0 right-0 bg-blend-color z-100">
    <USeparator class="m-0" />

    <UContainer>
      <div
        class="flex flex-col gap-6 justify-between items-center my-6! md:flex-row md:my-[3.5rem]"
      >
        <div class="w-[300px]">
          <TradeExpirationSelector
            v-model="swap.duration"
          />
        </div>

        <div class="flex gap-8 justify-end">
          <UButton
            class="px-10!"
            size="lg"
            variant="subtle"
            :label="$t('swap.modifyOffer')"
            @click="onModifyOfferClick"
          />

          <UButton
            class="px-10!"
            size="lg"
            :label="$t('swap.submit')"
            @click="submit"
          />
        </div>
      </div>
    </UContainer>
  </div>

  <!-- <SigningModal
    :title="$t('swap.creatingSwap')"
    :is-loading="isLoading"
    :status="status"
    @try-again="submit"
  /> -->
</template>
