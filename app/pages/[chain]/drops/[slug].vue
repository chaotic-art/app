<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { t } from 'try'
import { fetchOdaCollection } from '~/services/oda'

const dropStore = useDropStore()
useDrop()

onBeforeMount(() => dropStore.reset())
onUnmounted(() => dropStore.reset())

const { params } = useRoute()

const dropData = await $fetch('/api/genart/list', { query: { alias: params.slug?.toString() ?? '' } })
const [ok, err, collectionDataResult] = await t(fetchOdaCollection(params.chain?.toString() as AssetHubChain, dropData?.data[0]?.collection ?? ''))
const collectionData = ok ? collectionDataResult : { metadata: undefined, claimed: undefined }
if (!ok) {
  const errMessage = err instanceof Error ? err.message : String(err)
  console.error('Error fetching ODA collection', errMessage)
}
const drop = {
  ...dropData,
  metadata: {
    title: collectionData.metadata?.name,
    description: collectionData.metadata?.description,
    image: sanitizeIpfsUrl(collectionData?.metadata?.image),
  },
}
useSeoMeta({
  title: () => drop.metadata?.title,
  description: () => drop.metadata?.description?.slice(0, 150),
})

defineOgImage({
  component: 'Drops',
  props: {
    title: drop.metadata.title,
    image: drop.metadata?.image,
    items: collectionData.claimed,
  },
})
</script>

<template>
  <ClientOnly>
    <GenerativeDrop />
  </ClientOnly>
</template>
