<script setup lang="ts">
import type { ItemMedia } from '@/components/common/successfulModal/SuccessfulItemsMedia.vue'

const props = defineProps<{
  result: ActionTransactionResult
  status: TransactionStatus
}>()

const { $i18n } = useNuxtApp()
const { accountId } = useAuth()
const { currentChain } = useChain()

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
const singleItem = computed(() => props.result.items.length === 1)

const shareText = computed(() => {
  const someNfts = items.value.map(item => item.name)

  // @ts-expect-error transaltion count
  return $i18n.t('sharing.boughtNft', items.value.length, [someNfts.join(', ')])
})

const url = computed(() => window.location.origin)
const userProfilePath = computed(() => `/${currentChain.value}/u/${accountId.value}`)
const nftPath = computed(() => `/${currentChain.value}/gallery/${items.value[0]?.id}`)

const shareUrl = computed(() =>
  singleItem.value
    ? `${url.value}${nftPath.value}`
    : `${url.value}${userProfilePath.value}`,
)

const share = computed(() => ({
  text: shareText.value,
  withCopy: singleItem.value,
  url: shareUrl.value,
}))

function handleViewNft() {
  window.open(shareUrl.value, '_blank')
}

const actionButtons = computed(() => {
  if (props.result.type === 'airdrop') {
    return {
      primary: {
        label: 'View Profile',
        onClick: () => {
          navigateTo(userProfilePath.value)
        },
      },
    }
  }

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

    case 'airdrop':
      return {
        single: 'NFT Airdropped',
        multiple: 'NFTs Airdropped',
      }

    case 'token_transfer':
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
