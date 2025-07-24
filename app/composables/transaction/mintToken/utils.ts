export async function getLastIndexUsedOnChain(api, collectionId) {
  const collectionItems = await api.query.Nfts.Item.getEntries(collectionId)
  const itemIds = collectionItems.map(([key]) => key.args[1].toNumber())
  return Math.max(...itemIds)
}
