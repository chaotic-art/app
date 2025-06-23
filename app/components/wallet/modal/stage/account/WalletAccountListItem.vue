<script setup lang="ts">
import type { WalletAccount, WalletExtensionAccountPair } from '@/stores/wallet/types.ts'
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
const { prefix: currentPrefix } = usePrefix()
const { vm: currentVm } = useChain()
const { getBalance } = useBalances()
const { decimals, chainSymbol } = useChain()

const { data: balanceData, isPending: isBalanceLoading } = useQuery({
  queryKey: ['wallet-balance', props.account.address, currentPrefix],
  queryFn: () => {
    const vm = vmOf(currentPrefix.value)
    let prefix = currentPrefix.value

    if (vm !== currentVm.value) {
      // TODO: add default chain map
      prefix = vm === 'SUB' ? 'ahp' : 'ahw'
    }

    return getBalance({
      address: props.account.address,
      prefix,
    })
  },
  staleTime: 30000,
  refetchInterval: 60000,
})

const balance = computed(() => balanceData.value?.balance?.toString() || '0')
const { usd: usdBalance } = useAmount(balance, decimals, chainSymbol)

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
    class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    :class="{ 'ring-2 ring-primary-500': account.isSelected }"
    :ui="{ body: '!py-2 !px-3' }"
    @click="selectAccount(account)"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-2 w-full">
        <div class="relative">
          <ProfileAvatar :address="account.address" :size="32" />
        </div>
        <div class="w-full">
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
              v-else
              class="text-xs text-gray-600 dark:text-gray-400"
            >
              {{ usdBalance }}
            </span>
          </div>

          <div class="flex justify-between items-center space-x-2">
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ account.address }}
            </div>

            <UButton
              icon="i-lucide-copy"
              size="xs"
              color="neutral"
              variant="ghost"
              class="opacity-60 hover:opacity-100 transition-opacity"
              @click.prevent="copyAddress(account.address)"
            />
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>
