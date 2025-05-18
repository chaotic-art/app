<script setup lang="ts">
import type { SetWalletParams } from '@/stores/wallet'

const props = defineProps<{
  initialWalletType?: 'EVM' | 'SUB'
}>()

const emit = defineEmits(['select'])

const activeWalletType = ref(props.initialWalletType || 'EVM')

function onSelectAccount({ vm, account }: SetWalletParams) {
  emit('select', { vm, account })
}
</script>

<template>
  <UCard class="max-h-[90vh] overflow-auto">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="text-xl font-bold">
          Connect Wallet
        </div>
      </div>
    </template>

    <div class="p-4">
      <div v-if="activeWalletType === 'EVM'">
        <WalletEvm @select="account => onSelectAccount({ vm: 'EVM', account })" />
      </div>
      <div v-else-if="activeWalletType === 'SUB'">
        <WalletSubstrate @select="account => onSelectAccount({ vm: 'SUB', account })" />
      </div>
    </div>
  </UCard>
</template>
