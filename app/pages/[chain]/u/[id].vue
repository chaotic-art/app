<script setup lang="ts">
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
const address = computed(() => getss58AddressByPrefix(String(route.params.id), currentChain.value))
const { profile } = useFetchProfile(computed(() => address.value))
const bannerUrl = computed(() => sanitizeIpfsUrl(profile.value?.banner || ''))
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ProfileDetail :profile="profile" :address="address" :banner-url="bannerUrl" />

    <LazyActionCart />
  </UContainer>
</template>
