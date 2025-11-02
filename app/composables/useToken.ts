import type { AssetHubChain } from '~/plugins/sdk.client'
import type { NFTMetadata } from '~/services/oda'
import { formatBalance } from 'dedot/utils'
import { t } from 'try'
import { fetchMimeType, fetchOdaCollection, fetchOdaToken } from '~/services/oda'

export async function fetchTokenMetadata(metadataUri: string) {
  const [ok, _, metadataData] = await t($fetch(sanitizeIpfsUrl(metadataUri), {
    headers: {
      'Content-Type': 'application/json',
    },
  }))
  if (ok) {
    return metadataData as NFTMetadata
  }
  return null
}

export function useToken(props: {
  tokenId: number
  collectionId: number
  chain: AssetHubChain
  image?: string | null
  name?: string | null
}) {
  // Reactive data
  const token = ref<Awaited<ReturnType<typeof fetchOdaToken>> | null>(null)
  const collection = ref<Awaited<ReturnType<typeof fetchOdaCollection>> | null>(null)
  const queryPrice = ref<string | null>(null)
  const owner = ref<string | null>(null)
  const collectionCreator = ref<string | null>(null)
  const error = ref<unknown | null>(null)
  const mimeType = ref('image/png')

  const { $sdk } = useNuxtApp()
  const { decimals, chainSymbol } = useChain()

  // Calculate USD price from DOT price
  const { usd: usdPrice } = useAmount(computed(() => {
    if (!queryPrice.value)
      return undefined
    return queryPrice.value.toString()
  }), decimals, chainSymbol)

  // Fetch data on component mount
  onMounted(async () => {
    try {
      const [tokenData, collectionData] = await Promise.all([
        fetchOdaToken(props.chain, props.collectionId.toString(), props.tokenId.toString()).catch(() => null),
        fetchOdaCollection(props.chain, props.collectionId.toString()).catch(() => null),
      ])

      token.value = tokenData
      collection.value = collectionData

      owner.value = token.value?.owner ?? null
      collectionCreator.value = collection.value?.owner ?? null
      queryPrice.value = token.value?.price ?? null

      // fetch real-time price and owner
      const { api } = $sdk(props.chain)
      const [tokenMetadata, priceData, tokenItem] = await Promise.all([
        api.query.Nfts.ItemMetadataOf.getValue(props.collectionId, props.tokenId),
        api.query.Nfts.ItemPriceOf.getValue(props.collectionId, props.tokenId),
        api.query.Nfts.Item.getValue(props.collectionId, props.tokenId),
      ])
      queryPrice.value = priceData?.[0]?.toString() ?? null

      if (tokenItem?.owner) {
        owner.value = tokenItem.owner.toString()
      }

      // re-check token metadata if token.value is null
      const metadataUri = tokenMetadata?.data.asText()
      if (!token.value && metadataUri) {
        const metadata = await fetchTokenMetadata(metadataUri)
        if (metadata) {
          token.value = {
            ...tokenData,
            metadata,
            price: tokenData?.price ?? null,
            owner: tokenData?.owner ?? null,
          }
        }
      }

      if (!token.value?.metadata && collectionData?.metadata) {
        // fallback to collection metadata
        token.value = {
          ...token.value,
          metadata: collectionData?.metadata,
          metadata_uri: collection.value?.metadata_uri ?? undefined,
          price: tokenData?.price ?? null,
          owner: tokenData?.owner ?? null,
        }
      }

      const media = token.value?.metadata?.animation_url || token.value?.metadata?.image || props.image
      if (media) {
        const [ok, _, mimeTypeData] = await t(fetchMimeType(media))
        if (ok) {
          mimeType.value = mimeTypeData.mime_type
        }
      }
    }
    catch (err) {
      console.error('Failed to fetch token data:', err)
      error.value = err
    }
  })

  const price = computed(() => {
    if (!queryPrice.value)
      return ''

    return formatBalance(queryPrice.value, { decimals: decimals.value, symbol: chainSymbol.value })
  })

  const mediaIcon = computed(() => {
    if (!mimeType.value)
      return 'i-heroicons-photo'

    if (mimeType.value.includes('video'))
      return 'i-heroicons-play-circle'
    if (mimeType.value.includes('audio'))
      return 'i-heroicons-musical-note'
    if (mimeType.value.includes('image'))
      return 'i-heroicons-photo'
    if (mimeType.value.includes('html'))
      return 'i-heroicons-code-bracket'

    return 'i-heroicons-document'
  })

  return {
    // Reactive data
    token,
    collection: computed(() => collection.value),
    owner,
    collectionCreator,
    error,
    mimeType,

    // Computed properties
    nativePrice: queryPrice,
    price,
    usdPrice,
    mediaIcon,
  }
}
