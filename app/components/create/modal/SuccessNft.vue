<script setup lang="ts">
import type { ItemMedia } from '~/components/common/successfulModal/SuccessfulItemsMedia.vue'
import type { NftCategory } from '~/composables/useTransactionModal'
import { getSubscanNftUrl } from '~/utils/format/address'

interface Props {
  result: NftCategory
  status: TransactionStatus
}

const props = defineProps<Props>()
const router = useRouter()
const isSingleItem = computed(() => props.result.items.length <= 1)
const { close } = useTransactionModal()

const modalData = computed(() => {
  const items: ItemMedia[] = props.result.items.map(item => ({
    ...item,
    collection: props.result.collectionId,
    collectionName: props.result.collectionName,
    price: String(item.price),
  }))

  return {
    share: {
      text: isSingleItem.value ? 'I successfully created an NFT' : 'I successfully created NFTs',
      url: isSingleItem.value ? `${window.location.origin}/${props.result?.prefix}/gallery/${props.result.collectionId}-${items[0]?.id}` : `${window.location.origin}/${props.result?.prefix}/collection/${props.result.collectionId}`,
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
      multiple: `You successfully created ${props.result.items.length} NFTs`,
    },
    items,
    chain: props.result.prefix,
  }
})
</script>

<template>
  <SuccessfulModalBody
    v-if="props.result?.type === 'nft'"
    :tx-hash="props.result?.hash"
    :share="modalData.share"
    :chain="modalData.chain"
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
