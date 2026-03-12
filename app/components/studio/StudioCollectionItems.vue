<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'

const props = defineProps<{
  collectionId: string
  chain: AssetHubChain
}>()

const { accountId } = useAuth()
</script>

<template>
  <ProfileNftsList hide-chain-switcher :extra-variables="{ owner: accountId, collections: [props.collectionId] }" />
</template>
