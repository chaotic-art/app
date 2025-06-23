<script setup lang="ts">
import type { WalletAccount } from '@/stores/wallet/types'
import { shortenAddress } from '@/utils/format/address'

const props = defineProps<{
  account: WalletAccount
}>()

const { $jdenticon } = useNuxtApp()
const avatarSvg = ref('')

const selectedAccount = computed(() => props.account)

function generateAvatar(address: string): string {
  if (import.meta.client && $jdenticon) {
    return $jdenticon.toSvg(address, 28)
  }
  return ''
}

function updateAvatar() {
  if (selectedAccount.value && import.meta.client) {
    avatarSvg.value = generateAvatar(selectedAccount.value.address)
  }
}

onMounted(() => {
  updateAvatar()
})

watch(() => selectedAccount.value?.address, () => {
  updateAvatar()
})

const displayName = computed(() => {
  if (props.account.vm === 'SUB' && selectedAccount.value?.name) {
    return selectedAccount.value.name
  }
  return props.account.vm
})
</script>

<template>
  <div
    v-if="selectedAccount?.address"
    class="flex items-center cursor-pointer gap-2"
    :class="{ 'mr-1': account.vm === 'EVM' }"
  >
    <ProfileAvatar :address="selectedAccount?.address" :size="28" />
    <div class="flex flex-col">
      <span class="text-xs font-medium">{{ displayName }}</span>
      <span class="text-xs text-gray-500">{{ shortenAddress(selectedAccount?.address || '') }}</span>
    </div>
  </div>
</template>
