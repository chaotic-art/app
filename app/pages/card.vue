<script setup lang="ts">
import { CHAOTIC_CARD_COLLECTION_ID, CHAOTIC_CARD_PREFIX } from '@/components/mintCard/constants'
import { fetchOdaCollection } from '~/services/oda'

const { data } = useLazyAsyncData(
  `card:${CHAOTIC_CARD_PREFIX}:${CHAOTIC_CARD_COLLECTION_ID}`,
  async () => {
    const collection = await fetchOdaCollection(CHAOTIC_CARD_PREFIX, CHAOTIC_CARD_COLLECTION_ID)
    return collection
  },
)

const title = 'Chaotic Cards'

definePageMeta({
  title,
  layout: 'empty',
})

useSeoMeta({
  title,
  description: () => data.value?.metadata?.description?.slice(0, 150),
  ogImage: () => sanitizeIpfsUrl(data.value?.metadata?.banner || data.value?.metadata?.image),
})
</script>

<template>
  <CardPage />
</template>
