<script setup lang="ts">
import type { ExploreNftsData } from '~/graphql/queries/explore'
import { exploreNfts } from '~/graphql/queries/explore'

const props = defineProps<{
  where: Record<string, unknown>
}>()

defineEmits(['select'])

interface Token {
  label: string
  value: ExploreNftsData['tokenEntities'][0]
}

const { $apolloClient } = useNuxtApp()
const { currentChain } = useChain()

const input = ref<Token>()
const items = ref<Token[]>([])

async function onSearch(searchKey: string) {
  const search = {
    name_containsInsensitive: searchKey,
  }

  if (props.where) {
    Object.assign(search, props.where)
  }

  const { data } = await $apolloClient.query({
    query: exploreNfts,
    variables: {
      first: 5,
      offset: 0,
      orderBy: ['blockNumber_DESC'],
      search: search as any,
    },
    context: { endpoint: currentChain.value },
  })

  items.value = data.tokenEntities.map(token => ({
    label: token.name || '',
    value: token,
  }))
}
</script>

<template>
  <UInputMenu v-model="input" :items="items" @update:search-term="onSearch" @change="$emit('select', input?.value)">
    <template #item-leading="{ item }">
      <img
        v-if="item.value.image"
        :src="sanitizeIpfsUrl(item.value.image)"
        :alt="item.value.name || 'NFT'"
        class="w-6 aspect-square object-cover"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      >
    </template>
  </UInputMenu>
</template>
