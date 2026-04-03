export function parseAssetHubId(value: string): number | null {
  if (!/^\d+$/.test(value)) {
    return null
  }

  const parsedValue = Number(value)
  return Number.isSafeInteger(parsedValue) ? parsedValue : null
}

export function parseAssetHubTokenId(collectionId: string, tokenId: string) {
  const parsedCollectionId = parseAssetHubId(collectionId)
  const parsedTokenId = parseAssetHubId(tokenId)

  if (parsedCollectionId === null || parsedTokenId === null) {
    return null
  }

  return {
    collectionId: parsedCollectionId,
    tokenId: parsedTokenId,
  }
}
