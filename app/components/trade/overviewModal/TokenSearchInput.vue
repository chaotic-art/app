<script setup lang="ts">
import type { ExploreNftsData } from '~/graphql/queries/explore'
import type { AssetHubChain } from '~/types/chain'
import { useDebounceFn } from '@vueuse/core'
import { exploreNfts } from '~/graphql/queries/explore'

const props = defineProps<{
  where: Record<string, unknown>
}>()

defineEmits<{
  (e: 'select', token: Token['value']): void
}>()

interface Token {
  label: string
  value: ExploreNftsData['tokenEntities'][0]
}

const { $apolloClient } = useNuxtApp()
const { currentChain } = useChain()
const chain = computed(() => currentChain.value as AssetHubChain)

const input = ref<Token>()
const items = ref<Token[]>([])

async function onSearch(searchKey: string = '') {
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
    context: { endpoint: chain.value },
  })

  items.value = data.tokenEntities.map(token => ({
    label: token.name || '',
    value: token,
  }))
}

const debouncedSearch = useDebounceFn((searchKey: string = '') => onSearch(searchKey), 300)

onBeforeMount(onSearch)
</script>

<template>
  <UInputMenu
    v-model="input"
    :items="items"
    open-on-focus
    size="lg"
    placeholder="Search tokens"
    @update:search-term="debouncedSearch"
    @change="() => {
      if (input?.value) {
        $emit('select', input.value)
      }
    }"
  >
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
