<script setup lang="ts">
import { encodeAddress } from 'dedot/utils'
import { isAssetHubChain } from '@/utils/chain'

// Validate chain parameter
definePageMeta({
  validate: async (route) => {
    const { chain, id } = route.params
    const isValidChain = typeof chain === 'string' && isAssetHubChain(chain)

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
const address = computed(() => getSs58AddressByChain(String(route.params.id), currentChain.value))
const { profile } = useFetchProfile(computed(() => address.value))
const bannerUrl = computed(() => sanitizeIpfsUrl(profile.value?.banner || ''))
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ProfileDetail :profile="profile" :address="address" :banner-url="bannerUrl" />

    <LazyActionCart />
    <ScrollToTop />
  </UContainer>
</template>
