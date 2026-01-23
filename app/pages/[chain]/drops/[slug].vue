<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { fetchOdaCollection } from '~/services/oda'

const dropStore = useDropStore()
useDrop()

onBeforeMount(() => dropStore.reset())
onUnmounted(() => dropStore.reset())

const { params } = useRoute()

// for opengraph purposes only
const { data: drop } = useLazyAsyncData(
  `drop-${params.chain}-${params.slug}`,
  async () => {
    const drop = await $fetch('/api/genart/list', { query: { alias: params.slug?.toString() ?? '' } })
    const collection = await fetchOdaCollection(params.chain?.toString() as AssetHubChain, drop.data[0]?.collection ?? '')

    return {
      ...drop,
      metadata: {
        title: collection.metadata?.name,
        description: collection.metadata?.description,
        image: collection?.metadata?.image,
      },
    }
  },
)

useSeoMeta({
  title: () => drop.value?.metadata?.title,
  description: () => drop.value?.metadata?.description?.slice(0, 150),
})

defineOgImage({
  component: 'Drops',
  props: {
    title: drop.value?.metadata.title,
    image: sanitizeIpfsUrl(drop.value?.metadata?.image),
    items: drop.value?.count || '0',
  },
})
</script>

<template>
  <ClientOnly>
    <GenerativeDrop />
  </ClientOnly>
</template>
