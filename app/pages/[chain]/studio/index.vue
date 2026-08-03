<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { isAssetHubChain } from '~/utils/chain'

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
  },
})

useSeoMeta({
  title: 'My Collections - Studio',
  description: 'View and manage your NFT collections.',
})

const route = useRoute()
const router = useRouter()
const { accountId } = useAuth()

const chain = computed(() => route.params.chain as AssetHubChain)

const queryVariables = computed(() => {
  if (!accountId.value)
    return { search: [] }
  return {
    orderBy: ['blockNumber_DESC'] as const,
    search: [{ issuer_eq: accountId.value }],
  }
})

const gridKey = computed(() => accountId.value ? `studio-${chain.value}-${accountId.value}` : `studio-${chain.value}-anon`)

function goToCreateCollection() {
  router.push('/create/collection')
}
</script>

<template>
  <UContainer class="px-4 py-8 md:px-6">
    <!-- Header: title, chain switcher, Create Collection -->
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
      <h1 class="text-3xl font-bold">
        My Collections
      </h1>
      <div class="flex items-center gap-3 flex-wrap">
        <ChainSwitcher :show-label="true" :compact="false" />
        <UButton
          icon="i-heroicons-plus"
          color="primary"
          size="md"
          @click="goToCreateCollection"
        >
          Create Collection
        </UButton>
      </div>
    </div>

    <!-- Not connected: empty state -->
    <div
      v-if="!accountId"
      class="flex flex-col items-center justify-center py-16 text-center"
    >
      <UIcon
        name="i-heroicons-user-circle"
        class="w-16 h-16 text-muted mb-4"
      />
      <h2 class="text-xl font-semibold text-foreground mb-2">
        Connect your wallet
      </h2>
      <p class="text-muted max-w-md mb-6">
        Connect your wallet to see the collections you created.
      </p>
      <NavbarWallet />
    </div>

    <div v-else class="space-y-8">
      <CollectionsGrid
        :key="gridKey"
        :variables="queryVariables"
        :prefix="chain"
        card-action-variant="studio-mode"
      />
    </div>
  </UContainer>
</template>
