import type { TokenMetadata } from '@kodadot1/hyperdata'

export function getCollectionImage(metadata: TokenMetadata) {
  return metadata.image || metadata.thumbnailUri || metadata.mediaUri
}
