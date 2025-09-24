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
      },
    }
  },
)

useSeoMeta({
  title: () => drop.value?.metadata?.title,
  description: () => drop.value?.metadata?.description?.slice(0, 150),
  ogImage: () => `https://ogi.koda.art/__og-image__/image/${params.chain}/drops/${params.slug}/og.png`, // TODO: at the moment satori somehow doesn't work on cf-pages (defineOgImageComponent)
})
</script>

<template>
  <GenerativeDrop />
</template>
