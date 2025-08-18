<script setup lang="ts">
import type { NftCategory } from '~/composables/useTransactionModal'
import { getSubscanNftUrl } from '~/utils/format/address'

interface Props {
  result: NftCategory
  status: TransactionStatus
}

const props = defineProps<Props>()
const router = useRouter()

const { close } = useTransactionModal()

const modalData = computed(() => {
  const items = props.result.itemIds.map(id => ({
    id,
    image: props.result.image,
    name: props.result.name,
    collection: props.result.collectionId,
    collectionName: props.result.name,
    metadata: props.result.description,
  }))

  return {
    share: {
      text: 'You successfully created an NFT',
      url: `${window.location.origin}/${props.result?.prefix}/gallery/${props.result.collectionId}-${items[0]?.id}`,
      withCopy: true,
    },
    actionButtons: {
      primary: {
        label: 'View NFT',
        onClick: () => {
          close()

          if (props.result.prefix === 'ahpas') {
            window.open(getSubscanNftUrl(props.result.collectionId, props.result.prefix), '_blank')
          }
          else {
            router.push(`/${props.result?.prefix}/gallery/${props.result.collectionId}-${items[0]?.id}`)
          }
        },
      },
    },
    header: {
      single: 'You successfully created an NFT',
      multiple: `You successfully created ${props.result.itemIds.length} NFTs`,
    },
    items,
  }
})
</script>

<template>
  <SuccessfulModalBody
    v-if="props.result?.type === 'nft'"
    :tx-hash="props.result?.hash"
    :share="modalData.share"
    :status="status"
    :action-buttons="modalData.actionButtons"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <SuccessfulItemsMedia
      :header="modalData.header"
      :items="modalData.items"
    />
  </SuccessfulModalBody>
</template>
