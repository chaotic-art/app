import {
  blake2AsHex,
  encodeAddress,
} from 'dedot/utils'

export interface ImageDataPayload { hash: string, image: string }

export type EntropyRange = [number, number]

export interface GenerativePreviewItem {
  hash: string
  image: string
  entropyRange: EntropyRange
}

export function getEntropyRange(num: number, step = 64): EntropyRange {
  return [
    step * num,
    step * (num + 1),
  ]
}

export function getRandomIntFromRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export async function getCaptureImageFile({
  image,
  data: imageDataPayload,
}: {
  image: string
  data: ImageDataPayload
}) {
  const selectedImageHash = image.split('?hash=')[1]
  const isTheSameImage = selectedImageHash === imageDataPayload?.hash
  if (!imageDataPayload?.image || !isTheSameImage) {
    throw new Error('Failed to load image, please try again later')
  }
  const res = (await fetch(imageDataPayload.image)) as any
  return new File([res], 'image.png', { type: 'image/png' })
}

export function isValidSs58Format(ss58Format: number): boolean {
  return !(ss58Format < 0 || ss58Format > 16383 || [46, 47].includes(ss58Format))
}

function getHash(randomSs58Format: number, accountId: string) {
  const ss58Format = isValidSs58Format(randomSs58Format) ? randomSs58Format : 0

  let initialValue = String(Date.now() << ss58Format)

  if (accountId && isValidSubstrateAddress(accountId)) {
    // https://github.com/paritytech/ss58-registry/blob/30889d6c9d332953a6e3333b30513eef89003f64/ss58-registry.json#L1292C17-L1292C22
    initialValue = encodeAddress(accountId, ss58Format)
  }

  return blake2AsHex(initialValue, 256)
}

function generateHash(range: EntropyRange, accountId: string) {
  return getHash(getRandomIntFromRange(...range), accountId)
}

export function generatePreviewItem({
  entropyRange,
  accountId,
  content,
}: {
  entropyRange: EntropyRange
  accountId: string
  content: string
}): GenerativePreviewItem {
  const hash = generateHash(entropyRange, accountId)
  const image = `${content}/?hash=${hash}`
  return { hash, image, entropyRange }
}
