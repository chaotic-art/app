<script lang="ts" setup>
import type { MakingOfferItem } from '@/components/trade/types'
import { useQuery } from '@tanstack/vue-query'
import { highestOfferByCollectionId } from '@/graphql/queries/trades'
import { fetchOdaCollection } from '~/services/oda'

const props = defineProps<{
  collectionId: string
}>()

const { $i18n } = useNuxtApp()
const preferencesStore = usePreferencesStore()
const { makeOfferModalOpen } = storeToRefs(preferencesStore)
const collectionId = computed(() => props.collectionId)
const makeOfferStore = useMakingOfferStore()
const { $apolloClient } = useNuxtApp()
const { doAfterLogin } = useDoAfterlogin()
const { currentChain } = useChain()

const { data: collectionOfferData } = useQuery({
  queryKey: ['highestOfferByCollectionId', collectionId],
  queryFn: () => $apolloClient.query({ query: highestOfferByCollectionId, variables: { id: collectionId.value } }),
})

const { data: collection } = useQuery({
  queryKey: ['odaCollection', collectionId],
  queryFn: () => fetchOdaCollection(currentChain.value, collectionId.value).catch(() => null),
})

const highestOfferPrice = computed(() => (collectionOfferData.value)?.data.offers[0]?.price)

function openOfferModal() {
  makeOfferStore.clear()

  if (!collection.value) {
    return
  }

  const item: MakingOfferItem = {
    id: crypto.randomUUID(),
    name: $i18n.t('offer.anyNftFromCollection'),
    highestOffer: highestOfferPrice.value,
    chain: currentChain.value,
    collection: {
      ...collection.value,
      id: collectionId.value,
      floorPrice: [{ price: '0' }],
    },
    metadata: collection.value?.metadata_uri || '',
    meta: {
      image: collection.value?.metadata?.image || '',
    },
    sn: null,
    currentOwner: collection.value.owner!,
  }

  makeOfferStore.setItem(item)

  makeOfferModalOpen.value = true
}

function onCreateCollectionOfferClick() {
  doAfterLogin({
    onLoginSuccess: openOfferModal,
  })
}
</script>

<template>
  <div>
    <UButton
      variant="outline"
      @click="onCreateCollectionOfferClick"
    >
      {{ $t('offer.createCollectionOffer') }}
    </UButton>
  </div>
</template>
