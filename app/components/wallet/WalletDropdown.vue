<script setup lang="ts">
import type { ChainVM } from '@kodadot1/static'
import type { DropdownMenuItem } from '@nuxt/ui'

const emit = defineEmits(['selectWalletType'])
const { t } = useI18n()

const { getIsEvmConnected, getIsSubstrateConnected } = storeToRefs(useWalletStore())

const isDropdownOpen = ref(false)

function selectWalletType(type: ChainVM) {
  emit('selectWalletType', type)
  isDropdownOpen.value = false
}

const items = computed<DropdownMenuItem[]>(() => [
  {
    label: t('wallet.connectEvm'),
    icon: 'i-lucide-link',
    onSelect: () => selectWalletType('EVM')
  },
  {
    label: t('wallet.connectSubstrate'),
    icon: 'i-lucide-link',
    onSelect: () => selectWalletType('SUB')
  }
])
</script>

<template>
  <div>
    <UDropdownMenu
      v-model:open="isDropdownOpen"
      :items="items"
      :ui="{ content: 'w-48' }"
    >
      <UButton
        v-if="!getIsEvmConnected || !getIsSubstrateConnected"
        :label="$t('wallet.connect')"
        variant="solid"
        class="text-white rounded-full px-6 text-base cursor-pointer"
      />

      <ConnectedWallets v-else />
    </UDropdownMenu>
  </div>
</template>
