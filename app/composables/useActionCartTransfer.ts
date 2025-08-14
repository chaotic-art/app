import { fetchOdaCollection } from '~/services/oda'

export default function () {
  const { prefix } = usePrefix()
  const actionCartStore = useActionCartStore()
  const listingCartStore = useListingCartStore()

  async function transferToListingCart() {
    try {
      listingCartStore.clearListedItems()

      const items = actionCartStore.itemsInChain

      const metadatas = await Promise.all(
        items.map(item => fetchOdaCollection(prefix.value, String(item.collectionId))),
      )

      items.forEach((item, index) => {
        listingCartStore.setItem({
          ...item,
          collection: {
            floor: 1e8, // dev: remove,
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
