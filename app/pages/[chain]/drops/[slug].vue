<script setup lang="ts">
import type { AssetHubChain } from '~/types/chain'
import { t } from 'try'
import { isAssetHubChain } from '@/utils/chain'
import { fetchOdaCollection } from '~/services/oda'

definePageMeta({
  validate: async (route) => {
    const { chain } = route.params
    return typeof chain === 'string' && isAssetHubChain(chain)
  },
})

const dropStore = useDropStore()
useDrop()

onBeforeMount(() => dropStore.reset())
onUnmounted(() => dropStore.reset())

const { params } = useRoute()
const chain = params.chain as AssetHubChain

const dropData = await $fetch('/api/genart/list', { query: { alias: params.slug?.toString() ?? '' } })
const [ok, err, collectionDataResult] = await t(fetchOdaCollection(chain, dropData?.data[0]?.collection ?? ''))
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
