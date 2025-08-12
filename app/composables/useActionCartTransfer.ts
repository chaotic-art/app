export default function () {
  const actionCartStore = useActionCartStore()
  const listingCartStore = useListingCartStore()

  async function transferToListingCart() {
    try {
      listingCartStore.clearListedItems()

      actionCartStore.itemsInChain.forEach((item) => {
        listingCartStore.setItem({
          ...item,
          collection: {
            floor: 1e8, //dev: remove
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
