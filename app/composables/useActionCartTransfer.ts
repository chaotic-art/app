export default function () {
  const actionCartStore = useActionCartStore()
  const listingCartStore = useListingCartStore()

  function transferToListingCart() {
    try {
      listingCartStore.clearListedItems()

      actionCartStore.itemsInChain.forEach((item) => {
        listingCartStore.setItem({
          ...item,
          collection: {
            floor: 1e8, // dev: remove,
            name: 'Collection Name', // dev: remove
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
