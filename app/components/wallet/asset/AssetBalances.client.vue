<script setup lang="ts">
import type { SupportedChain } from '~/plugins/sdk.client'
import { getBalance } from '~/utils/api/substrate'

const mainNet: Exclude<SupportedChain, 'ahpas'>[] = ['dot', 'ksm', 'ahp', 'ahk']
const balances = ref<Awaited<ReturnType<typeof getBalance>>[]>([])
const isLoading = ref(true)

onMounted(async () => {
  // Load balances gradually as they resolve
  const promises = mainNet.map(async (chain, index) => {
    try {
      const balance = await getBalance(chain, '1xjvRADwdJcnmUCLWerEHR4iGCT5EBTm4D4fzLLg4LcAC9p')
      // Add balance to the array as soon as it resolves
      balances.value[index] = balance
    }
    catch (error) {
      console.error(`Failed to load balance for ${chain}:`, error)
    }
  })

  // Wait for all to complete, then stop loading
  await Promise.allSettled(promises)
  isLoading.value = false
})

const isEmpty = computed(() =>
  !isLoading.value && balances.value.filter(Boolean).length === 0,
)

// Computed values using real data directly
const nonZeroBalances = computed(() =>
  balances.value
    .map((balance, index) => balance ? { ...balance, chainId: mainNet[index] } : null)
    .filter((balance): balance is NonNullable<typeof balance> =>
      balance !== null && Number(balance.freeBalance) > 0,
    ),
)

const totalUsdValue = computed(() =>
  nonZeroBalances.value.reduce((acc, balance) => acc + balance.usdNumeric, 0),
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
              {{ balance.usd || '$0.00' }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ balance.freeBalanceFormatted }}
            </p>
          </div>
        </div>
      </div>

      <!-- Show loading skeletons for remaining items -->
      <div
        v-for="i in (4 - balances.filter(Boolean).length)"
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
