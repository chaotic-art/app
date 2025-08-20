<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { fetchOdaCollectionOwners } from '@/services/oda'

const props = withDefaults(
  defineProps<{
    chain: AssetHubChain
    collectionId: string
    maxAddressCount?: number
    size?: 'small' | 'medium'
    noBackground?: boolean
  }>(),
  {
    size: 'medium',
    maxAddressCount: 5,
  },
)

const zIndexMap = ['z-50', 'z-40', 'z-30', 'z-20', 'z-10']
const addresses = ref<string[]>([])
const remainingCount = computed(() =>
  addresses.value.length > props.maxAddressCount
    ? addresses.value.length - props.maxAddressCount
    : 0,
)

watchEffect(async () => {
  if (!props.collectionId) {
    return
  }

  fetchOdaCollectionOwners(props.chain, props.collectionId).then((data) => {
    addresses.value = Object.keys(data?.owners || {})
  })
})
</script>

<template>
  <div
    class="rounded-full h-[62px] md:w-auto bg-background inline-flex items-center justify-between py-1.5 px-3"
    :class="{ '!h-full !border-none !py-1 !px-2': size === 'small', 'bg-transparent': noBackground }"
  >
    <div class="flex items-center">
      <ProfileAvatar
        v-for="(address, index) in addresses.slice(0, maxAddressCount)"
        :key="address"
        :class="[zIndexMap[index], { '-ml-2': index > 0 }]"
        :address="address"
        :size="size === 'small' ? 18 : 40"
      />
    </div>

    <div
      v-if="remainingCount"
      class="ml-2.5"
      :class="{ 'text-xs !ml-1': size === 'small' }"
    >
      +{{ remainingCount }}
    </div>
  </div>
</template>
