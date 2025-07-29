<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import type { ItemMedia } from '@/components/common/successfulModal/SuccessfulItemsMedia.vue'
import type { ShareProp } from '@/components/common/successfulModal/SuccessfulModalBody.vue'
import type { MintedNFT, MintingSession } from '@/components/drop/types'

const props = defineProps<{
  mintingSession: MintingSession
}>()

const { $i18n } = useNuxtApp()
const { add: toast } = useToast()
const { prefix } = usePrefix()
const { accountId } = useAuth()
const { getCollectionFrameUrl } = useSocialShare()
const { toMintNFTs } = storeToRefs(useDropStore())

const txHash = computed(() => props.mintingSession.txHash ?? '')
const singleMint = computed(() => props.mintingSession.items.length === 1)
const mintedNft = computed<MintedNFT | undefined>(
  () => props.mintingSession.items[0],
)

const itemMedias = props.mintingSession.items.map(item => ({
  id: item.id,
  name: item.name,
  image: item.image,
  collection: item.collection.id,
  collectionName: item.collection.name,
  mimeType: item.mimeType,
  metadata: item.metadata,
}))
const items = ref<ItemMedia[]>(itemMedias)

onMounted(async () => {
  toast({ title: 'Successfully minted token. There is a 1 minute indexer and worker delay for this action to appear in the website.', duration: 15000 })

  // update serial number in nft.name asynchronously
  const metadatas = await Promise.all(
    items.value.map(item => $fetch<{ name?: string }>(item.metadata)),
  )

  items.value.forEach((_, index) => {
    const metadata = metadatas[index]
    if (metadata?.name && items.value[index] && toMintNFTs.value[index]) {
      items.value[index].name = metadata.name
      toMintNFTs.value[index].name = metadata.name
    }
  })
})

const nftPath = computed(
  () => mintedNft.value
    ? pickByVm({
        SUB: `/${mintedNft.value.chain}/gallery/${mintedNft.value.collection.id}-${mintedNft.value.id}`,
        EVM: `/${mintedNft.value.chain}/gallery/${mintedNft.value.id}`,
      }, { prefix: mintedNft.value.chain as Prefix })
    : '',
)
const nftFullUrl = computed(() => `${window.location.origin}${nftPath.value}`)
const userProfilePath = computed(() => `/${prefix.value}/u/${accountId.value}`)

const getItemSn = (name: string) => `#${name.split('#')[1]}`

const sharingTxt = computed(() =>
  singleMint.value
    ? $i18n.t('sharing.dropNft', [getItemSn(items.value[0]?.name || '')])
    : $i18n.t('sharing.dropNfts', [items.value.map(item => getItemSn(item.name)).join(', ')]),
)

const share = computed<ShareProp>(() => ({
  text: sharingTxt.value,
  url: nftFullUrl.value,
  withCopy: singleMint.value,
  social: {
    farcaster: {
      embeds: [
        getCollectionFrameUrl(
          prefix.value,
          mintedNft.value?.collection.id as string,
        ),
      ],
    },
  },
}))

const viewButton = computed(() => ({
  label: $i18n.t('general.viewNft', props.mintingSession.items.length),
  onClick: handleViewNft,
}))

const actionButtons = computed(() => ({ primary: viewButton.value }))

function handleViewNft() {
  window.open(
    singleMint.value ? nftPath.value : userProfilePath.value,
    '_blank',
  )
}
</script>

<template>
  <SuccessfulModalBody
    :tx-hash="txHash"
    :share="share"
    :status="mintingSession.status"
    :action-buttons="actionButtons"
  >
    <SuccessfulItemsMedia
      :header="{
        single: $t('drop.youSuccessfullyClaimedNft', [1]),
        multiple: $t('drop.amountMintedSuccessfully', [items.length]),
      }"
      :items="items"
    />
  </SuccessfulModalBody>
</template>
