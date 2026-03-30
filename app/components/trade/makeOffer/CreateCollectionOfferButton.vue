<script lang="ts" setup>
import type { MakingOfferItem } from '@/components/trade/types'
import type { AssetHubChain } from '~/types/chain'
import { useQuery } from '@tanstack/vue-query'
import { highestOfferByCollectionId } from '@/graphql/queries/trades'

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
const chain = computed(() => currentChain.value as AssetHubChain)

const { data: collectionOfferData } = useQuery({
  queryKey: ['highestOfferByCollectionId', collectionId, chain],
  queryFn: () => {
    return $apolloClient.query({
      query: highestOfferByCollectionId,
      variables: { id: collectionId.value },
      context: { endpoint: chain.value },
    })
  },
})

const { collection } = useOdaCollection(collectionId)

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
    chain: chain.value,
    collection: {
      ...collection.value,
      id: collectionId.value,
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
      variant="secondary"
      :disabled="!collection"
      @click="onCreateCollectionOfferClick"
    >
      {{ $t('offer.createCollectionOffer') }}
    </UButton>
  </div>
</template>
