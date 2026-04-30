<script setup lang="ts">
import type { AssetHubChain } from '~/types/chain'

const props = defineProps<{
  extraVariables?: Partial<Record<'owner' | 'issuer' | 'collections', string | string[]>>
  hideChainSwitcher?: boolean
}>()

defineEmits(['totalCountChange'])

const queryVariables = ref<Record<string, any>>({})
const { viewMode: nftViewMode, gridClass: nftGridClass } = useNftViewMode('profile')

const { currentChain } = useChain()
const chain = computed(() => currentChain.value as AssetHubChain)
</script>

<template>
  <div class="mt-4">
    <NftsToolbar
      :hide-chain-switcher="hideChainSwitcher"
      class="w-full md:w-fit md:ml-auto"
      :extra-variables="props.extraVariables"
      @update:query-variables="queryVariables = $event"
    >
      <template #trailing>
        <NftViewModeSelector scope="profile" />
      </template>
    </NftsToolbar>

    <div class="my-8">
      <NftsGrid
        :key="JSON.stringify(queryVariables)"
        :variables="queryVariables"
        :grid-class="nftGridClass"
        :view-mode="nftViewMode"
        :chain="chain"
        @total-count-change="$emit('totalCountChange', $event)"
      />
    </div>
  </div>
</template>
