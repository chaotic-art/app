import type { AssetHubChain } from '~/plugins/sdk.client'
import { formatBalance } from 'dedot/utils'
import { t } from 'try'
import { fetchMimeType, fetchOdaCollection, fetchOdaToken } from '~/services/oda'

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
  const queryPrice = ref<bigint | null>(null)
  const owner = ref<string | null>(null)
  const collectionCreator = ref<string | null>(null)
  const isLoading = ref(true)
  const error = ref<unknown | null>(null)
  const mimeType = ref<string | null>(null)

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
    const api = $sdk(props.chain).api

    try {
      // Fetch token metadata, price, and owner in parallel
      const [tokenData, collectionData, priceData, ownerData, collectionConfig, collectionMetadata] = await Promise.all([
        fetchOdaToken(props.chain, props.collectionId.toString(), props.tokenId.toString()),
        fetchOdaCollection(props.chain, props.collectionId.toString()),
        api.query.Nfts.ItemPriceOf.getValue(props.collectionId, props.tokenId).catch(() => null),
        api.query.Nfts.Item.getValue(props.collectionId, props.tokenId).catch(() => null),
        api.query.Nfts.Collection.getValue(props.collectionId).catch(() => null),
        api.query.Nfts.CollectionMetadataOf.getValue(props.collectionId).catch(() => null),
      ])

      token.value = tokenData
      collection.value = collectionData
      queryPrice.value = priceData?.[0] || null
      owner.value = ownerData?.owner || null
      collectionCreator.value = collectionConfig?.owner || null

      if (!tokenData.metadata && collectionData?.metadata) {
        // fallback to collection metadata
        token.value = {
          ...tokenData,
          metadata: collectionData?.metadata,
          metadata_uri: collectionMetadata?.data.asText(),
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
    finally {
      isLoading.value = false
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
    isLoading,
    error,
    mimeType,

    // Computed properties
    nativePrice: queryPrice,
    price,
    usdPrice,
    mediaIcon,
  }
}
