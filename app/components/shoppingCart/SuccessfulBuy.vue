<script setup lang="ts">
import type { ItemMedia } from '@/components/common/successfulModal/SuccessfulItemsMedia.vue'

const props = defineProps<{
  result: ActionTransactionResult
  status: TransactionStatus
}>()

const { $i18n } = useNuxtApp()
const { prefix } = usePrefix()
const { accountId } = useAuth()

const items = computed<ItemMedia[]>(() =>
  props.result.items.map(item => ({
    id: item.id,
    image: item.metadata.image || '',
    name: item.metadata.name || '',
    collection: String(item.collection.id),
    collectionName: item.collection.name,
    price: String(item.price),
    metadata: item.metadata_uri || '',
  })),
)

const txHash = computed(() => props.result.hash)
const singleListing = computed(() => props.result.items.length === 1)

const shareText = computed(() => {
  const someNfts = items.value.map(item => item.name)

  // @ts-expect-error transaltion count
  return $i18n.t('sharing.boughtNft', items.value.length, [someNfts.join(', ')])
})

const url = computed(() => window.location.origin)
const userProfilePath = computed(() => `/${prefix.value}/u/${accountId.value}`)
const nftPath = computed(() => `/${prefix.value}/gallery/${items.value[0]?.id}`)

const shareUrl = computed(() =>
  singleListing.value
    ? `${url.value}${nftPath.value}`
    : `${url.value}${userProfilePath.value}`,
)

const share = computed(() => ({
  text: shareText.value,
  withCopy: singleListing.value,
  url: shareUrl.value,
}))

function handleViewNft() {
  window.open(shareUrl.value, '_blank')
}

const actionButtons = computed(() => {
  if (props.result.type === 'burn') {
    return {
      primary: {
        label: 'Done',
        onClick: () => {},
      },
    }
  }

  return {
    primary: {
      label: $i18n.t('general.viewNft', items.value.length),
      onClick: handleViewNft,
    },
  }
})

const headerContent = computed<{ single: string, multiple: string }>(() => {
  switch (props.result.type) {
    case 'buy':
      return {
        single: $i18n.t('buyModal.purchaseSuccessful'),
        multiple: $i18n.t('buyModal.amountPurchaseSuccessfully'),
      }

    case 'transfer':
      return {
        single: 'NFT Transferred',
        multiple: 'NFTs Transferred',
      }

    case 'burn':
      return {
        single: 'NFT Burned',
        multiple: 'NFTs Burned',
      }
  }

  return {
    single: $i18n.t('transferModal.nftTransferred'),
    multiple: $i18n.t('transferModal.amountNftTransferred'),
  }
})
</script>

<template>
  <SuccessfulModalBody
    :tx-hash="txHash"
    :share="share"
    :status="status"
    :action-buttons="actionButtons"
  >
    <SuccessfulItemsMedia
      :items="items"
      :header="headerContent"
    />
  </SuccessfulModalBody>
</template>
