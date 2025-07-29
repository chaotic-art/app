export async function getLastIndexUsedOnChain(api: any, collectionId: number) {
  const collectionItems = await api.query.Nfts.Item.getEntries(collectionId)
  const itemIds = collectionItems.map(([key]: [any, any]) => key.args[1].toNumber())
  return Math.max(...itemIds)
}
