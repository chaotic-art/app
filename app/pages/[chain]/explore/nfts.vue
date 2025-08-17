<script setup lang="ts">
import { CHAINS } from '@kodadot1/static'

// Validate chain parameter
definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && chain in CHAINS
  },
})

// SEO Meta
useSeoMeta({
  title: 'Explore NFTs - Discover Digital Collectibles',
  description: 'Browse and discover NFTs across different categories and collections.',
})

const queryVariables = ref<Record<string, any>>({})
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <ExploreHeader>
      <template #controls>
        <NftsToolbar
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
      />
    </div>
  </UContainer>
</template>
