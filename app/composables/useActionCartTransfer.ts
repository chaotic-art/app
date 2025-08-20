import { fetchOdaCollection } from '~/services/oda'

export default function () {
  const actionCartStore = useActionCartStore()
  const listingCartStore = useListingCartStore()

  async function transferToListingCart() {
    try {
      listingCartStore.clearListedItems()

      const items = actionCartStore.itemsInChain

      const metadatas = await Promise.all(
        items.map(item => fetchOdaCollection('ahp', String(item.collectionId))), // TODO: handle asset hub chains. get chain from item
      )

      items.forEach((item, index) => {
        listingCartStore.setItem({
          ...item,
          collection: {
            floor: undefined,
            name: String(metadatas[index]?.metadata?.name),
          },
        })
      })
    }
    catch { }
  }

  return {
    transferToListingCart,
  }
}
