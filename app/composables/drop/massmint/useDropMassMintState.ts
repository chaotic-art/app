export default () => {
  const { toMintNFTs } = storeToRefs(useDropStore())

  const canMint = computed(() => Boolean(toMintNFTs.value.length))

  return {
    canMint,
  }
}
