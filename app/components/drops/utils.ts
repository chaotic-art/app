import type { DropItem } from '@/types'
import { getDropById } from '@/services/fxart'
import { fetchOdaCollection, fetchOdaCollectionAbi } from '@/services/oda'
import { DropStatus } from '@/types/drop'
import { formatDuration, intervalToDuration, intlFormat } from 'date-fns'

export const FALLBACK_DROP_COLLECTION_MAX = 64

export function toDropScheduledDurationString(startTime: Date, short: boolean = false) {
  const duration = intervalToDuration({
    start: startTime,
    end: new Date(),
  })

  const options = {
    format: ['hours', 'minutes'],
  }

  if (short) {
    Object.assign(options, {
      locale: {
        formatDistance: (token: string, count: string) => {
          return {
            xHours: '{{count}}h',
            xMinutes: '{{count}}m',
            xSeconds: '{{count}}s',
          }?.[token]?.replace('{{count}}', count)
        },
      } as Locale,
    })
  }

  return formatDuration(duration, options)
}

export function formatDropStartTime(
  startTime: Date,
  locale: string,
  withTime = false,
) {
  const options = {
    day: '2-digit',
    month: withTime ? '2-digit' : 'long',
    hour12: withTime,
  } as const

  if (withTime) {
    Object.assign(options, {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return intlFormat(startTime, options, { locale })
}

export function formatCETDate(date: string, time: string): Date {
  return new Date(`${date}T${time}+02:00`)
}

export function parseCETDate(datetime: string): Date {
  const [date, time] = datetime.split(' ')
  return formatCETDate(date!, time!)
}

export const dateHasTime = (datetime: string): boolean => /:/.test(datetime)

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

export async function getDropAttributes(alias: string): Promise<DropItem | undefined> {
  // get some offchain data
  // ----------------------
  const campaign = await getDropById(alias)
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
    isEvm(campaign.chain) ? fetchOdaCollectionAbi(campaign.chain, address) : Promise.resolve(null),
  ])

  const onChainData = {
    max: Number(supply) || FALLBACK_DROP_COLLECTION_MAX,
    minted: Number(minted),
    name: metadata.name,
    collectionName: metadata.name,
    collectionDescription: metadata.description,
    image: metadata.image,
    banner: metadata.banner || metadata.image,
    content: metadata.generative_uri || campaign.content,
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

export const isTBA = (price: unknown) => price === null || price === ''
