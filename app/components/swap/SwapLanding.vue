<script lang="ts" setup>
import { SwapStep } from '@/components/swap/types'
import { getSwapStepRouteName } from '@/utils/swap'
import { graphql } from '~/graphql/client'

const { isCurrentAccount, accountId } = useAuth()
const { $i18n, $apolloClient } = useNuxtApp()
const { currentChain } = useChain()

const traderAddress = ref('')
const isTraderAddressValid = ref(false)
const isYourAddress = ref(false)
const isLoadingSwapOffersCount = ref(true)
const swapOffersCount = ref<number>()

const { data: ownedCollections, isPending: isLoadingOwnedCollections } = useOwnedCollections(accountId)

const isLoadingIncomingTrades = computed(() => isLoadingSwapOffersCount.value || isLoadingOwnedCollections.value)
const showIncomingTrades = computed(() => Boolean(accountId.value) && (isLoadingIncomingTrades.value || Boolean(swapOffersCount.value)))

const isAddressEmpty = computed(() => !traderAddress.value)
const disabled = computed(() => isAddressEmpty.value || isYourAddress.value || !isTraderAddressValid.value)

const label = computed(() => {
  if (isYourAddress.value) {
    return $i18n.t('swap.cantSwapWithYourself')
  }

  if (isAddressEmpty.value) {
    return $i18n.t('validation.inputAddressFirst')
  }

  if (!isTraderAddressValid.value) {
    return $i18n.t('validation.addressIncorrect')
  }

  return $i18n.t('swap.beginSwap')
})

function handleAddressCheck(isValid: boolean) {
  isTraderAddressValid.value = isValid
  isYourAddress.value = isTraderAddressValid.value ? isCurrentAccount(traderAddress.value) : false
}

const swapStore = useAtomicSwapStore()

async function handleSubmit() {
  const createdId = swapStore.createSwap(traderAddress.value, currentChain.value).id
  await navigateTo({
    name: getSwapStepRouteName(SwapStep.DESIRED),
    params: { id: traderAddress.value, chain: currentChain.value },
    query: { swapId: createdId },
  })
}

watch([ownedCollections, accountId], async ([ownedCollections, account]) => {
  swapOffersCount.value = undefined

  if (!account) {
    return
  }

  if (ownedCollections !== undefined && ownedCollections.length) {
    isLoadingSwapOffersCount.value = true

    try {
      const response = await $apolloClient.query<{ swapsConnection: { totalCount: number } }>({
        query: graphql(`
          query swapsConnection {
            swapsConnection(
              orderBy: blockNumber_DESC,
              where: {
                OR: [
                  ${buildIncomingTradesQuery(accountId.value, ownedCollections || [], { stringify: true })},
                  { caller_eq: "${accountId.value}", status_in: [ACTIVE, EXPIRED] }
                ]
              }
            ) {
              totalCount
            }
          }
        `),
      })

      swapOffersCount.value = response.data.swapsConnection.totalCount
    }

    catch {
      console.error('Error fetching swap offers count')
    }
    finally {
      isLoadingSwapOffersCount.value = false
    }
  }
}, { immediate: true })
</script>

<template>
  <UContainer>
    <div class="max-w-[490px] mx-auto">
      <div class="flex flex-col h-full space-y-10 pt-8">
        <div class="flex flex-col gap-2 items-start">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-medium font-serif italic text-foreground">
            {{ $t('swap.landingTitle') }}
          </h1>
          <p class="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {{ $t('swap.landingSubtitle') }}
          </p>
        </div>

        <div>
          <h2 class="mb-2 font-bold capitalize">
            {{ $t('swap.connectTrader') }}
          </h2>
          <p class="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
            {{ $t('swap.connectTraderInfo') }}
          </p>
        </div>

        <div class="flex flex-col gap-7">
          <form @submit.prevent="handleSubmit">
            <UInput
              v-model="traderAddress"
              class="w-full"
              placeholder="Enter wallet address"
              size="lg"
            />

            <AddressChecker
              class="mt-2"
              :address="traderAddress"
              @check="handleAddressCheck"
              @change="address => traderAddress = address"
            />

            <UButton
              type="submit"
              :label="label"
              :disabled="disabled"
              size="lg"
              class="mt-5 capitalize w-full"
              :class="{ 'mb-5': !showIncomingTrades }"
            />
          </form>

          <div
            v-if="showIncomingTrades"
            class="flex justify-center"
          >
            <USkeleton
              v-if="isLoadingIncomingTrades"
              class="w-[200px] h-9 rounded-full"
            />

            <UButton
              v-else
              variant="outline"
              @click="navigateTo(`/${currentChain}/u/${accountId}?tab=swaps`)"
            >
              {{ $t('swap.yourSwapOffers') }}

              <span class="text-gray-600 dark:text-gray-400">
                ({{ swapOffersCount }})
              </span>

              <UIcon
                class="ml-2"
                name="i-mdi:arrow-right"
              />
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
