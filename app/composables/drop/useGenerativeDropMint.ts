export function updateGenartMetadata() {
  const { drop } = useDrop()
  const { toMintNFTs, mintingSession } = storeToRefs(useDropStore())

  mintingSession.value.items = toMintNFTs.value.map((item) => {
    $fetch('/api/genart/update-metadata', {
      method: 'POST',
      body: {
        chain: drop.value.chain,
        collection: drop.value.collection,
        nft: item.nft.toString(),
      },
    })

    return {
      id: item.nft.toString(),
      chain: drop.value.chain,
      name: item.name,
      image: item.image,
      metadata: item.metadata,
      collection: {
        id: drop.value.collection,
        name: item.collectionName,
        max: drop.value.max,
      },
    }
  })
}

export default () => {
  const dropStore = useDropStore()
  const { drop } = storeToRefs(dropStore)

  const mintCountAvailable = computed(
    () => drop.value.max && drop.value.minted < drop.value.max,
  )

  return {
    mintCountAvailable,
  }
}
