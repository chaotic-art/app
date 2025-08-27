<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { CHAINS } from '@kodadot1/static'
import { encodeAddress } from 'dedot/utils'

// Validate chain parameter
definePageMeta({
  validate: async (route) => {
    const { chain, id } = route.params
    const isValidChain = typeof chain === 'string' && chain in CHAINS

    try {
      encodeAddress(String(id), 0)
      return isValidChain
    }
    catch {
      return false
    }
  },
})

useSeoMeta({
  title: 'NFT Artist Profile',
  description: 'Find more NFTs from this creator.',
})

const route = useRoute()
const { currentChain } = useChain()
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ProfileDetail :address="getss58AddressByPrefix(String(route.params.id), currentChain as Prefix)" />

    <LazyActionCart />
  </UContainer>
</template>
