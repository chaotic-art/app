<script setup lang="ts">
import type { VmWalletState } from '@/stores/wallet'
import type { ChainVM } from '@kodadot1/static'

const props = defineProps<{
  walletType: ChainVM
  wallet: VmWalletState
}>()

const { $jdenticon } = useNuxtApp()
const avatarSvg = ref('')

function shortenAddress(address: string): string {
  if (!address)
    return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

function generateAvatar(address: string): string {
  if (import.meta.client && $jdenticon) {
    return $jdenticon.toSvg(address, 28)
  }
  return ''
}

function updateAvatar() {
  if (props.wallet.connected && props.wallet.account?.address && import.meta.client) {
    avatarSvg.value = generateAvatar(props.wallet.account.address)
  }
}

onMounted(() => {
  updateAvatar()
})

watch(() => props.wallet.account?.address, () => {
  updateAvatar()
})

const displayName = computed(() => {
  if (props.walletType === 'SUB' && props.wallet.account?.name) {
    return props.wallet.account.name
  }
  return props.walletType
})
</script>

<template>
  <div
    v-if="wallet.connected && wallet.account?.address"
    class="flex items-center cursor-pointer"
    :class="{ 'mr-1': walletType === 'EVM' }"
  >
    <div
      class="w-7 h-7 rounded-full overflow-hidden mr-2 border border-gray-200 dark:border-gray-700"
      v-html="avatarSvg"
    />
    <div class="flex flex-col">
      <span class="text-xs font-medium">{{ displayName }}</span>
      <span class="text-xs text-gray-500">{{ shortenAddress(wallet.account?.address || '') }}</span>
    </div>
  </div>
</template>
