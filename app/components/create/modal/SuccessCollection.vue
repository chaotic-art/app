<script setup lang="ts">
import type { CollectionCategory } from '~/composables/useTransactionModal'
import { getSubscanNftUrl } from '~/utils/format/address'

interface Props {
  result: CollectionCategory
  status: TransactionStatus
}

const props = defineProps<Props>()
const router = useRouter()

const { close } = useTransactionModal()

const modalData = computed(() => {
  const collectionId = props.result.id

  return {
    share: {
      text: 'You successfully created a collection',
      url: `${window.location.origin}/${props.result?.prefix}/collection/${collectionId}`,
      withCopy: true,
    },
    actionButtons: {
      primary: {
        label: 'View Collection',
        onClick: () => {
          close()

          if (props.result.prefix === 'ahpas') {
            window.open(getSubscanNftUrl(collectionId, props.result.prefix), '_blank')
          }
          else {
            router.push(`/${props.result?.prefix}/collection/${collectionId}`)
          }
        },
      },
    },
    header: {
      single: 'You successfully created a collection',
      multiple: 'You successfully created a collection',
    },
    items: [{
      id: props.result?.id,
      image: props.result?.image,
      name: props.result?.name,
      collection: props.result?.id,
      collectionName: props.result?.name,
      metadata: props.result?.description,
    }],
  }
})
</script>

<template>
  <SuccessfulModalBody
    v-if="props.result?.type === 'collection'"
    :tx-hash="props.result?.hash"
    :share="modalData.share"
    :status="status"
    :action-buttons="modalData.actionButtons"
  >
    <SuccessfulItemsMedia
      :header="modalData.header"
      :items="modalData.items"
    />
  </SuccessfulModalBody>
</template>
