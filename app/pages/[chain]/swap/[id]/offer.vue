<script lang="ts" setup>
import { isAssetHubChain } from '~/utils/chain'

definePageMeta({
  layout: 'no-footer',
  middleware: ['swap'],
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
  },
})
</script>

<template>
  <SwapYourProfile />
</template>
