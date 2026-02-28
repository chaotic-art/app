import type { AssetHubChain } from '~/plugins/sdk.client'
import { CHAOTIC_MINTER } from '~/utils/support'

export function useNextItemId() {
  const { $sdk } = useNuxtApp()
  const isChaoticOwner = ref(true)

  async function getNextItemId(chain: AssetHubChain, collectionId: number): Promise<number> {
    const api = $sdk(chain).api
    await api.compatibilityToken

    const [entries, ownerQuery] = await Promise.all([
      api.query.Nfts.Item.getEntries(collectionId),
      api.query.Nfts.Collection.getValue(collectionId),
    ])

    const owner = ownerQuery?.owner.toString()
    isChaoticOwner.value = owner === CHAOTIC_MINTER
    const itemIds = entries.map(item => Number(item.keyArgs[1]))

    return Math.max(0, ...itemIds) + 1
  }

  return { getNextItemId, isChaoticOwner }
}
