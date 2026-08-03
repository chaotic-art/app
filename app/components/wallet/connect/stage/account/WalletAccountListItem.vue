<script setup lang="ts">
import type { SupportedChain } from '~/plugins/sdk.client'
import { useQuery } from '@tanstack/vue-query'
import { shortenAddress } from '@/utils/format/address'

const props = defineProps<{
  account: WalletAccount
  extension: WalletExtensionAccountPair['extension']
}>()

const emit = defineEmits<{
  select: [accountId: string]
  copyAddress: [address: string]
}>()

const toast = useToast()
const { getBalance } = useBalances()
const { currentChain } = useChain()
const { selectedAccounts } = useWalletStore()
const { usePolkaVmTestnet } = useFeatureFlags()

const polkaVmBalanceChain = computed<SupportedChain>(() => {
  if (usePolkaVmTestnet.value) {
    return 'ahpas'
  }

  return currentChain.value === 'ahk' ? 'ahk' : 'ahp'
})

const { data: balanceData, isPending: isBalanceLoading } = useQuery({
  queryKey: ['wallet-balance', props.account.address, props.account.vm, currentChain, usePolkaVmTestnet],
  queryFn: async () => {
    if (props.account.vm === 'EVM') {
      const balance = await getBalance({
        address: props.account.address,
        chain: polkaVmBalanceChain.value,
      })

      return {
        usdFormatted: tokenToUsd(Number(balance.balance), balance.decimals, balance.symbol),
      }
    }

    const balance = await getBalance({
      address: props.account.address,
      chain: 'ahp',
    })

    return {
      usdFormatted: tokenToUsd(Number(balance.balance), chainSpec.ahp.tokenDecimals, chainSpec.ahp.tokenSymbol),
    }
  },
  staleTime: 30000,
  refetchInterval: 60000,
})

const usdBalance = computed(() => balanceData.value?.usdFormatted || '')

function selectAccount(account: WalletAccount) {
  emit('select', account.id)
}

async function copyAddress(address: string) {
  await navigator.clipboard.writeText(address)
  toast.add({
    title: 'Copied to clipboard',
    description: `Address ${address} copied`,
    color: 'success',
  })
}

const accountImg = ref()

onMounted(async () => {
  const icon = props.account.icon

  if (!icon) {
    accountImg.value = props.extension.icon
    return
  }

  const blob = await $fetch<Blob>(icon)

  accountImg.value = URL.createObjectURL(blob)
})
</script>

<template>
  <UCard
    class="cursor-pointer hover:bg-accent transition-colors"
    :class="{ 'ring-2 ring-primary-500 !bg-secondary': [selectedAccounts.SUB, selectedAccounts.EVM].includes(account.id) }"
    :ui="{ body: '!py-2 !px-3' }"
    @click="selectAccount(account)"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2 w-full">
        <div class="relative">
          <ProfileAvatar :address="account.address" :size="32" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-1">
              <div class="w-4 h-4 rounded shadow-lg bg-white flex items-center justify-center relative z-10">
                <img
                  :src="accountImg"
                  :alt="extension.name"
                  class="w-3 h-3 object-contain"
                >
              </div>
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ account.name || shortenAddress(account.address) }}
              </div>
              <UBadge
                v-if="account.vm === 'EVM'"
                color="info"
                size="xs"
              >
                EVM
              </UBadge>
            </div>
            <USkeleton
              v-if="isBalanceLoading"
              class="h-3 w-12"
            />
            <span
              v-else-if="usdBalance"
              class="text-xs text-gray-600 dark:text-gray-400"
            >
              {{ usdBalance }}
            </span>
          </div>

          <div class="flex justify-between items-center space-x-2">
            <div class="flex-1 min-w-0">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ account.address }}
              </div>
            </div>

            <UButton
              icon="i-lucide-copy"
              size="xs"
              color="neutral"
              variant="ghost"
              class="opacity-60 hover:opacity-100 transition-opacity"
              @click.stop="copyAddress(account.address)"
            />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
