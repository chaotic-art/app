<script setup lang="ts">
import type { SwapSurchargeDirection } from '~/composables/onchain/useNftPallets'
import { useQuery } from '@tanstack/vue-query'
import { useElementVisibility } from '@vueuse/core'
import { SwapStep } from '@/components/swap/types'
import { sanitizeIpfsUrl } from '@/utils/ipfs'
import { toNative } from '~/utils/format/balance'

interface StepDetails {
  title: string
  surchargeTitle: string
  nextRouteName: string
  backRouteName: string
  surchargeDirection: SwapSurchargeDirection
}

const props = defineProps<{
  step: SwapStep
}>()

const swapStore = useAtomicSwapStore()
const { swap } = storeToRefs(swapStore)
const { $i18n } = useNuxtApp()
const { accountId } = useAuth()
const { decimals, currentChain } = useChain()
const { getChainIcon } = useIcon()
const isCollectionSwap = computed(() => swap.value.isCollectionSwap)
const { getBalance } = useBalances()
const { existentialDeposit } = useDeposit(currentChain)

const { data: balance } = useQuery({
  queryKey: ['balance', accountId],
  queryFn: async () => {
    const response = await getBalance({
      address: accountId.value,
      prefix: currentChain.value,
    })

    return response.balance
  },
  retry: 3,
  enabled: computed(() => Boolean(accountId.value)),
  initialData: 0n,
})

const stepDetailsMap: ComputedRef<Partial<Record<SwapStep, StepDetails>>> = computed(() => ({
  [SwapStep.DESIRED]: {
    title: 'swap.yourSwapList',
    surchargeTitle: 'swap.requestToken',
    nextRouteName: getSwapStepRouteName(SwapStep.OFFERED, isCollectionSwap.value),
    backRouteName: getSwapStepRouteName(SwapStep.COUNTERPARTY, isCollectionSwap.value),
    surchargeDirection: 'Receive',
  },
  [SwapStep.OFFERED]: {
    title: 'swap.yourOffer',
    surchargeTitle: 'swap.addToken',
    nextRouteName: getSwapStepRouteName(SwapStep.REVIEW, isCollectionSwap.value),
    backRouteName: getSwapStepRouteName(SwapStep.DESIRED, isCollectionSwap.value),
    surchargeDirection: 'Send',
  },
}))

const target = ref()
const amount = ref()
const itemsContainer = ref()

const isTargetVisible = useElementVisibility(target)
const stepItems = computed(() => swapStore.getStepItems(props.step))
const stepDetails = computed(() => stepDetailsMap.value[props.step] as StepDetails)
const title = computed(() => $i18n.t(stepDetails.value.title))
const surchargeTitle = computed(() => $i18n.t(stepDetails.value.surchargeTitle))
const surchargeDisabled = computed(() => Boolean(swap.value.surcharge))
const stepHasSurcharge = computed(() => swap.value.surcharge?.direction === stepDetails.value.surchargeDirection)
const count = computed(() => stepItems.value.length + (stepHasSurcharge.value ? 1 : 0))
const isOverOneToOneSwap = computed(() => swap.value.offered.length > swap.value.desired.length && props.step === SwapStep.OFFERED)
const isCollectionSwapDesired = computed(() => isCollectionSwap.value && props.step === SwapStep.DESIRED)
const isOfferedSwapStep = computed(() => props.step === SwapStep.OFFERED)
const insufficientBalance = computed(() => isOfferedSwapStep.value && Number(balance.value) - existentialDeposit.value < toNative(Number(amount.value), decimals.value))

const disabled = computed(() => {
  if ((!accountId.value && props.step === SwapStep.OFFERED) || isOverOneToOneSwap.value) {
    return true
  }

  if (props.step === SwapStep.DESIRED) {
    return !swap.value.desired.length
  }

  return swap.value.desired.length !== swap.value.offered.length
})

function goTo(name: string) {
  return navigateTo({ name, params: { id: swap.value.counterparty }, query: { swapId: swap.value.id } })
}

async function onNext() {
  await goTo(stepDetails.value.nextRouteName)
}

async function onBack() {
  await goTo(stepDetails.value.backRouteName)
}

function clearAll() {
  swapStore.updateStepItems([])
  swapStore.updateSwap({ surcharge: undefined })
}

function addSurcharge() {
  swapStore.updateSwap({ surcharge: { amount: String(toNative(Number(amount.value), decimals.value)), direction: stepDetails.value.surchargeDirection } })
  amount.value = ''
}

watch(() => stepItems.value.length, () => {
  nextTick().then(() => {
    // scroll to bottom
    itemsContainer.value.scrollTo({
      top: itemsContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  })
})

watchEffect(() => {
  if (isOverOneToOneSwap.value) {
    swap.value.offered = []
  }
})
</script>

<template>
  <div class="md:w-[380px] relative">
    <span
      ref="target"
      class="md:relative md:top-[-100px]"
    />

    <div
      class="border rounded-xl border-border h-min"
      :class="{
        'md:fixed md:top-[100px]': !isTargetVisible,
      }"
    >
      <div class="px-6 py-4 flex justify-between items-center">
        <div class="text-base font-bold line-height">
          {{ title }}
        </div>
      </div>

      <USeparator class="my-0" />

      <div class="px-6! pb-6! pt-4! min-h-[40vh] overflow-y-auto">
        <div class="flex justify-between items-center">
          <span>
            {{ count }} {{ $t('items') }}
          </span>

          <UButton
            v-if="count && !isCollectionSwapDesired"
            variant="ghost"
            @click="clearAll"
          >
            {{ $t('actionCart.clearAll') }}
          </UButton>
        </div>

        <USeparator v-if="count" class="my-6" />

        <div
          ref="itemsContainer"
          class="flex flex-col gap-3 max-h-[300px] overflow-y-auto"
        >
          <SwapPreviewItem
            v-for="nft in stepItems"
            :key="nft.id"
            :name="nft.name"
            :image="sanitizeIpfsUrl(nft.meta.image)"
            :removable="!(isCollectionSwap && !nft.id)"
            @remove="swapStore.removeStepItem(nft.id)"
          />

          <SwapPreviewItem
            v-if="stepHasSurcharge"
            :image="getChainIcon(currentChain) || ''"
            @remove="swap.surcharge = undefined"
          >
            <template #name>
              <Money
                :value="swap.surcharge?.amount"
                inline
              />
            </template>
          </SwapPreviewItem>
        </div>

        <USeparator class="my-6" />

        <div class="flex flex-col gap-4">
          <div class="font-bold flex items-center gap-2">
            <span> {{ surchargeTitle }}  </span>
            <span class="text-gray-600 dark:text-gray-400 text-xs">({{ $t('general.optional') }})</span>
          </div>

          <div class="flex items-center gap-2">
            <ListingCartPriceInput
              v-model="amount"
              class="w-[200px]"
              :disabled="surchargeDisabled"
              full-width
            />

            <UButton
              class="h-10 w-[120px]"
              icon="mdi:plus"
              :label="$t('general.add')"
              :disabled="surchargeDisabled || !amount || insufficientBalance"
              @click="addSurcharge"
            />
          </div>
          <div
            v-if="isOfferedSwapStep"
            class="flex align-center text-xs"
            :class="{ 'text-error': insufficientBalance }"
          >
            <div class="flex gap-1">
              {{ $t('general.balance') }}:

              <Money :value="String(balance)" inline />
            </div>
          </div>
        </div>
      </div>

      <div class="py-6 px-6">
        <div class="flex gap-4">
          <UButton
            size="lg"
            label="Back"
            variant="ghost"
            class="flex-1"
            @click="onBack"
          />
          <UButton
            size="lg"
            label="Next"
            class="flex-1"
            :disabled="disabled"
            @click="onNext"
          />
        </div>
      </div>
    </div>
  </div>
</template>
