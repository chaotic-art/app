<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { isAssetHubChain } from '~/utils/chain'

// Validate chain parameter
definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
  },
})

// SEO Meta
useSeoMeta({
  title: 'Explore NFTs - Discover Digital Collectibles',
  description: 'Browse and discover NFTs across different categories and collections.',
})

const { isLogIn } = useAuth()
const route = useRoute()
const { chain } = route.params as { chain: AssetHubChain }

const queryVariables = ref<Record<string, any>>({})
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ExploreHeader>
      <template #controls>
        <NftsToolbar
          :has-owned-filter="isLogIn"
          @update:query-variables="queryVariables = $event"
        />
      </template>
    </ExploreHeader>

    <!-- Grid Content for NFTs -->
    <div class="my-8">
      <NftsGrid
        :key="JSON.stringify(queryVariables)"
        :search="queryVariables.name || ''"
        :variables="queryVariables"
        :prefix="chain"
      />
    </div>
  </UContainer>
</template>
