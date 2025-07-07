<script setup lang="ts">
import { CHAINS } from '@kodadot1/static'
import { isAddress } from '@polkadot/util-crypto'

// Validate chain parameter
definePageMeta({
  validate: async (route) => {
    const { chain, id } = route.params
    const isValidChain = typeof chain === 'string' && chain in CHAINS
    const isValidAddress = isAddress(String(id))
    return isValidChain && isValidAddress
  },
})

useSeoMeta({
  title: 'NFT Artist Profile',
  description: 'Find more NFTs from this creator.',
})

const route = useRoute()
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ProfileDetail :address="String(route.params.id)" />
  </UContainer>
</template>
