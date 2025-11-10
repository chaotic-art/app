import type { Property } from '@/composables/onchain/useNftPallets'
import type { NftAttributesListByCollectionData } from '~/graphql/queries/collections'
import { nftAttributesListByCollection } from '~/graphql/queries/collections'

interface NftWithAttributes {
  id?: string
  meta?: {
    attributes?: Property[]
  }
}

export function useCollectionAttributes({ collectionId }: { collectionId: ComputedRef<string | undefined> }) {
  const { $apolloClient } = useNuxtApp()

  const nftsList = ref<NftWithAttributes[]>([])
  const loading = ref(false)

  watch(collectionId, async (id) => {
    if (!id) {
      nftsList.value = []
      return
    }

    loading.value = true
    try {
      const { data } = await $apolloClient.query<NftAttributesListByCollectionData>({
        query: nftAttributesListByCollection,
        variables: { id },
      })

      nftsList.value = (data?.nfts || []) as NftWithAttributes[]
    }
    catch (error) {
      console.error('Failed to fetch collection attributes:', error)
      nftsList.value = []
    }
    finally {
      loading.value = false
    }
  }, { immediate: true })

  const attributesList = computed<Attribute[]>(() => {
    return (nftsList.value || []).reduce((acc, nft) => {
      if (nft.meta?.attributes?.length) {
        acc.push(...nft.meta.attributes)
      }
      return acc
    }, [] as Property[])
  })

  const attributesRarityMaps = computed<Record<string, Record<string, number>>>(() => {
    const attributeCounts: Record<string, Record<string, number>> = {}

    attributesList.value.forEach((attr) => {
      if (!attr.trait)
        return
      if (!attributeCounts[attr.trait]) {
        attributeCounts[attr.trait] = {}
      }

      attributeCounts[attr.trait]![attr.value]
        = (attributeCounts[attr.trait]?.[attr.value] ?? 0) + 1
    })

    const totalNfts = nftsList.value.length

    if (totalNfts === 0)
      return {}

    return Object.fromEntries(
      Object.entries(attributeCounts).map(([traitType, valueCounts]) => [
        traitType,
        Object.fromEntries(
          Object.entries(valueCounts).map(([value, count]) => [
            value,
            Number.parseFloat(((count / totalNfts) * 100).toFixed(1)),
          ]),
        ),
      ]),
    )
  })

  const getAttributeRarity = (trait: string, value: string | number) => {
    return attributesRarityMaps.value[trait]?.[value] || 0
  }

  return {
    getAttributeRarity,
    loading,
  }
}
