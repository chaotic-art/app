<script setup lang="ts">
import type { Chain, EvmChain, SubstrateChain } from '~/types/chain'
import { formatBalance } from 'dedot/utils'

interface WalletSidebarBalanceRow {
  chainId: string
  freeBalance: string
  freeBalanceFormatted: string
  tokenName: string
  tokenSymbol: string
  usd: number
  usdFormatted: string
}

const { getConnectedEvmAccount, getConnectedSubAccount } = storeToRefs(useWalletStore())
const { currentChain } = useChain()
const { getBalance } = useBalances()

const mainNet: Exclude<SubstrateChain, 'ahpas'>[] = ['dot', 'ksm', 'ahp', 'ahk']
const balances = ref<Array<WalletSidebarBalanceRow | null>>([])
const isLoading = ref(false)
const fetchRun = ref(0)

const expectedBalanceCount = computed(() =>
  (getConnectedSubAccount.value ? mainNet.length : 0) + (getConnectedEvmAccount.value ? 1 : 0),
)
const polkaVmChain = computed<EvmChain>(() => {
  if (currentChain.value === 'polkadot-testnet') {
    return 'polkadot-testnet'
  }

  return currentChain.value === 'ahk' || currentChain.value === 'kusama' ? 'kusama' : 'polkadot'
})

const isEmpty = computed(() => !isLoading.value && balances.value.filter(Boolean).length === 0)

const nonZeroBalances = computed(() =>
  balances.value
    .filter((balance): balance is NonNullable<typeof balance> =>
      balance !== null && Number(balance.freeBalance) > 0,
    ),
)

const totalUsdValue = computed(() =>
  nonZeroBalances.value.reduce((acc, balance) => acc + balance.usd, 0),
)

const formattedTotal = computed(() =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalUsdValue.value),
)

// Mock functions
function handleAddFunds() {
  // Add funds functionality would be implemented here
}

function toWalletSidebarBalanceRow(
  chainId: Chain,
  balance: Awaited<ReturnType<typeof getBalance>>,
): WalletSidebarBalanceRow {
  const freeBalance = balance.balance.toString()
  const usd = tokenToUsdValue(Number(freeBalance), balance.decimals, balance.symbol)
  const usdFormatted = tokenToUsd(Number(freeBalance), balance.decimals, balance.symbol)

  return {
    chainId,
    freeBalance,
    freeBalanceFormatted: formatBalance(freeBalance, { decimals: balance.decimals, symbol: balance.symbol }),
    tokenName: balance.tokenName,
    tokenSymbol: balance.symbol,
    usd,
    usdFormatted,
  }
}

watch(
  () => [getConnectedSubAccount.value?.address, getConnectedEvmAccount.value?.address] as const,
  async ([subAddress, evmAddress], _, onCleanup) => {
    balances.value = []
    isLoading.value = Boolean(subAddress || evmAddress)

    if (!subAddress && !evmAddress) {
      return
    }

    const currentRun = ++fetchRun.value
    let cancelled = false

    onCleanup(() => {
      cancelled = true
    })

    const promises = [
      ...mainNet.map(async (chain, index) => {
        if (!subAddress) {
          return
        }

        try {
          const balance = await getBalance({ address: subAddress, chain })
          if (cancelled || currentRun !== fetchRun.value) {
            return
          }

          balances.value[index] = toWalletSidebarBalanceRow(chain, balance)
        }
        catch (error) {
          console.error(`Failed to load balance for ${chain}:`, error)
        }
      }),
      (async () => {
        if (!evmAddress) {
          return
        }

        try {
          const balance = await getBalance({ address: evmAddress, chain: polkaVmChain.value })
          if (cancelled || currentRun !== fetchRun.value) {
            return
          }

          balances.value[mainNet.length] = toWalletSidebarBalanceRow(polkaVmChain.value, balance)
        }
        catch (error) {
          console.error('Failed to load PolkaVM balance:', error)
        }
      })(),
    ]

    await Promise.allSettled(promises)

    if (!cancelled && currentRun === fetchRun.value) {
      isLoading.value = false
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-2">
    <!-- Header -->
    <div>
      <h3 class="text-sm font-medium text-foreground">
        Asset Balances
      </h3>
    </div>

    <!-- Progressive loading state -->
    <div v-if="isLoading || balances.some(Boolean)" class="space-y-1">
      <!-- Show loaded balances -->
      <div
        v-for="balance in nonZeroBalances"
        :key="`${balance.chainId}-${balance.tokenSymbol}`"
        class="group relative py-1 hover:bg-muted/20 -mx-1 px-1 rounded transition-colors duration-150"
      >
        <!-- 2-column layout -->
        <div class="grid grid-cols-2 gap-3 items-center">
          <!-- Left column: Token name -->
          <div class="flex items-center">
            <div class="min-w-0">
              <p class="text-sm font-medium text-foreground truncate">
                {{ balance.tokenSymbol.toUpperCase() }}
              </p>
              <p class="text-xs text-muted-foreground capitalize truncate">
                {{ balance.tokenName }}
              </p>
            </div>
          </div>

          <!-- Right column: USD value and token amount -->
          <div class="text-right">
            <p class="text-sm font-medium text-foreground">
              {{ balance.usdFormatted || '$0.00' }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ balance.freeBalanceFormatted }}
            </p>
          </div>
        </div>
      </div>

      <!-- Show loading skeletons for remaining items -->
      <div
        v-for="i in Math.max(expectedBalanceCount - balances.filter(Boolean).length, 0)"
        v-show="isLoading"
        :key="`loading-${i}`"
        class="py-1"
      >
        <div class="grid grid-cols-2 gap-3 items-center">
          <!-- Left column skeleton -->
          <div class="flex items-center">
            <div class="min-w-0">
              <USkeleton class="h-4 w-16 rounded mb-1" />
              <USkeleton class="h-3 w-20 rounded" />
            </div>
          </div>

          <!-- Right column skeleton -->
          <div class="text-right space-y-1">
            <USkeleton class="h-4 w-20 rounded ml-auto" />
            <USkeleton class="h-3 w-24 rounded ml-auto" />
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else-if="isEmpty"
      class="flex flex-col items-center justify-center py-4 px-2 text-center"
    >
      <p class="text-sm text-muted-foreground mb-2">
        No assets found in your wallet
      </p>
      <UButton
        size="sm"
        variant="outline"
        @click="handleAddFunds"
      >
        Add Funds
      </UButton>
    </div>

    <!-- Total value -->
    <div v-if="nonZeroBalances.length > 0" class="pt-2 mt-2 border-t border-border">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-muted-foreground">
          Total Portfolio Value
        </span>
        <span class="text-lg font-semibold text-foreground">
          {{ formattedTotal }}
        </span>
      </div>
    </div>
  </div>
</template>
