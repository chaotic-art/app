<script setup lang="ts">
import type { Chain } from '@/types'
import { chainNames } from '@kodadot1/static'

const accountStore = useAccountStore()
const { accounts, loading: isBalanceLoading } = storeToRefs(accountStore)

const chainBalances = computed(() => {
  return Object.entries(accounts.value).flatMap(([_vm, account]) =>
    Object.entries(account.chains).flatMap(([chain, chainData]) => {
      const assets = chainData?.assets || []

      return Object.entries(assets).map(([token, details]) => {
        const { getCurrentTokenValue } = useFiatStore()

        const { usd, formatted } = useAmount(
          computed(() => details.nativeBalance),
          computed(() => decimalsOf(getPrefixOfChain(chain as Chain))),
          computed(() => token),
        )

        const tokenValue = getCurrentTokenValue(token as Token)

        return {
          chain,
          name: chainNames[getPrefixOfChain(chain as Chain)],
          token,
          native: details.balance,
          formatted: String(formatted.value.split(' ')[0]),
          usd: usd.value,
          fetchingTokenValue: tokenValue === null,
          exactUsd: calculateExactUsdFromToken(
            Number(details.balance),
            Number(tokenValue),
          ),
        }
      })
    }),
  )
})

const nonZeroBalances = computed(() => {
  return chainBalances.value.filter(balance => Number(balance.native) > 0)
})

const isEmptyBalanceOnAllChains = computed(() => !isBalanceLoading.value && chainBalances.value.reduce((acc, balance) => acc && Number(balance.native) === 0, true))

const total = computed(() => nonZeroBalances.value.reduce((acc, balance) => acc + Number(balance.exactUsd), 0).toFixed(1))

onMounted(() => {
  accountStore.fetchBalance()
})
</script>

<template>
  <div>
    <!-- Empty Asset -->
    <div
      v-if="isEmptyBalanceOnAllChains && !isBalanceLoading"
      class="text-xs py-4 flex flex-col items-center"
    >
      <div class="mb-3 text-center">
        {{ $t('asset.emptyAsset') }}
      </div>
      <UButton
        class="px-4 py-1"
      >
        + {{ $t('asset.addFunds') }}
      </UButton>
    </div>
    <!-- Balances -->
    <div
      v-else
      class="balance"
    >
      <div class="balance-row text-k-grey text-xs">
        <div class="flex-grow-3">
          {{ $t('general.chain') }}
        </div>
        <div class="text-right grow">
          {{ $t('general.token') }}
        </div>
        <div class="text-right flex-grow-2">
          {{ $t('general.balance') }}
        </div>
        <div class="text-right flex-grow-2">
          {{ $t('general.usd') }}
        </div>
      </div>

      <div
        v-for="chainBalance in nonZeroBalances"
        :key="`${chainBalance.chain}-${chainBalance.token}`"
        class="balance-row text-base"
      >
        <div class="capitalize flex-grow-3 truncate">
          {{ chainBalance.name }}
        </div>
        <div class="text-right grow">
          {{ chainBalance.token.toUpperCase() }}
        </div>

        <div class="text-right flex-grow-2">
          {{ chainBalance.formatted }}
        </div>
        <div class="text-right flex-grow-2 flex justify-end">
          <USkeleton v-if="chainBalance.fetchingTokenValue" class="h-4 w-12 rounded" />
          <span v-else>{{ chainBalance.usd }}</span>
        </div>
      </div>

      <div v-if="isBalanceLoading" class="py-2">
        <USkeleton class="h-4 w-full rounded" />
      </div>
    </div>

    <hr class="my-2">

    <p class="flex justify-between items-end">
      <span class="text-xs"> {{ $t('general.total') }}: </span>
      <span class="text-base">${{ total }}</span>
    </p>
  </div>
</template>

<style scoped>
.balance-row {
  display: flex;
  justify-content: space-between;
}

.balance-row > * {
  flex-shrink: 1;
  flex-basis: 0%;
}
</style>
