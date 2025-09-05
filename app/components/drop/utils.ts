import type { DropItem } from '@/types'
import { getDropById } from '@/services/fxart'
import { fetchOdaCollection } from '@/services/oda'
import { DropStatus } from '@/types'

export function formatCETDate(date: string, time: string): Date {
  return new Date(`${date}T${time}+02:00`)
}

export function parseCETDate(datetime: string): Date {
  const [date, time] = datetime.split(' ')
  return formatCETDate(date!, time!)
}

function getLocalDropStatus(drop: Pick<DropItem, 'dropStartTime' | 'minted' | 'max' | 'disabled'>): DropStatus {
  const now = new Date()

  if (drop.minted === drop.max) {
    return DropStatus.MINTING_ENDED
  }

  if (!drop.dropStartTime) {
    return DropStatus.UNSCHEDULED
  }

  if (drop.dropStartTime <= now) {
    if (drop.disabled) {
      return DropStatus.COMING_SOON
    }
    return DropStatus.MINTING_LIVE
  }

  if (drop.dropStartTime.valueOf() - now.valueOf() <= ONE_DAY_MS) {
    return DropStatus.SCHEDULED_SOON
  }

  return DropStatus.SCHEDULED
}

export const FALLBACK_DROP_COLLECTION_MAX = 64

export async function getEnrichedDrop(campaign: DropItem): Promise<DropItem | undefined> {
  // get some offchain data
  // ----------------------
  const offChainData = {
    id: campaign.id,
    chain: campaign.chain,
    alias: campaign.alias,
    collection: campaign.collection,
    type: campaign.type,
    disabled: campaign.disabled,
    start_at: campaign.start_at,
    holder_of: campaign.holder_of,

    // would be nice if we could get this from the onchain
    price: campaign.price,
    creator: campaign.creator,
  }

  const address = campaign.collection
  if (!address) {
    return
  }

  // get some onchain data
  // ----------------------
  const [{ supply, claimed: minted, metadata }, abi] = await Promise.all([
    fetchOdaCollection(campaign.chain, address),
    Promise.resolve(null), // TODO: handle evm
  ])

  const onChainData = {
    max: Number(supply) || FALLBACK_DROP_COLLECTION_MAX,
    minted: Number(minted),
    name: metadata?.name || '',
    collectionName: metadata?.name || '',
    collectionDescription: metadata?.description || '',
    image: metadata?.image || '',
    banner: metadata?.banner || metadata?.image || '',
    content: metadata?.generative_uri || campaign.content,
    abi,
  }

  // additional data
  // ----------------------
  let dropStartTime = offChainData.start_at ? parseCETDate(offChainData.start_at) : undefined

  if (onChainData.minted >= 5) {
    dropStartTime = new Date(Date.now() - 1e10) // this is a bad hack to make the drop appear as "live" in the UI
  }

  const drop = {
    ...offChainData,
    ...onChainData,
    isMintedOut: onChainData.minted >= onChainData.max,
    isFree: !Number(offChainData.price),
    dropStartTime,
  }

  return {
    ...drop,
    status: getLocalDropStatus(drop),
  }
}

export async function getDropAttributes(alias: string): Promise<DropItem | undefined> {
  const campaign = await getDropById(alias)

  return getEnrichedDrop(campaign)
}

export const isTBA = (price: unknown) => price === null || price === ''

export async function dropStats(collection?: string) {
  if (!collection || import.meta.server) {
    return {
      floorPrice: 0,
      listedPercentage: '0%',
      ownershipMap: new Map(),
      ownerTokenIds: [],
      collectionStats: {
        uniqueHolders: 0,
        avgPerHolder: '0 NFTs',
        holderRatio: '0%',
      },
    }
  }

  const { $sdk } = useNuxtApp()
  const api = $sdk('ahp').api

  const [queryItems, queryFloor] = await Promise.all([
    api.query.Nfts.Item.getEntries(Number(collection)),
    api.query.Nfts.ItemPriceOf.getEntries(Number(collection)),
  ])

  // Group items by owner
  const ownershipMap = new Map<string, { address: string, items: number }>()
  const ownerTokenIds: Array<{ owner: string, tokenId: number }> = []

  queryItems.forEach(async (item) => {
    const owner = item.value.owner.toString()
    const tokenId = Number(item.keyArgs[1])

    if (!ownershipMap.has(owner)) {
      ownershipMap.set(owner, { address: owner, items: 0 })
    }

    ownershipMap.get(owner)!.items++
    ownerTokenIds.push({ owner, tokenId })
  })

  // Floor price and Listed percentage
  let floorPrice = 0
  if (queryFloor.length) {
    const floorValues = queryFloor
      .filter(item => Number(item.value[0]) > 0)
      .map(item => Number(item.value[0]))
    floorPrice = Math.min(...floorValues)
  }

  const listedPercentage = queryItems.length > 0 && queryFloor.length > 0
    ? `${((queryFloor.length / queryItems.length) * 100).toFixed(1)}%`
    : '0%'

  // Collection stats
  const totalItems = queryItems.length
  const uniqueHolders = ownershipMap.size
  const avgPerHolder = uniqueHolders > 0 ? `${(totalItems / uniqueHolders).toFixed(1)} NFTs` : '0 NFTs'
  const holderRatio = totalItems > 0 && uniqueHolders > 0
    ? `${((uniqueHolders / totalItems) * 100).toFixed(1)}%`
    : '0%'

  return {
    floorPrice,
    listedPercentage,
    ownershipMap,
    ownerTokenIds,
    collectionStats: {
      uniqueHolders,
      avgPerHolder,
      holderRatio,
    },
  }
}
