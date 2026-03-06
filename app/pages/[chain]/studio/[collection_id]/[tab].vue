<script setup lang="ts">
import { isAssetHubChain } from '~/utils/chain'

const validTabs = ['preview', 'details', 'items'] as const

definePageMeta({
  layout: 'studio-collection',
  validate: async (route) => {
    const { chain, tab } = route.params
    return (
      typeof chain === 'string'
      && isAssetHubChain(chain)
      && typeof tab === 'string'
      && (validTabs as readonly string[]).includes(tab)
    )
  },
})

const route = useRoute()
const tab = computed(() => route.params.tab as (typeof validTabs)[number])
</script>

<template>
  <div>
    <p class="text-muted capitalize">
      {{ tab }}
    </p>
  </div>
</template>
