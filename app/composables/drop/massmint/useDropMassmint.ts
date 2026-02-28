import type { ToMassmintNFT } from './types'
import { setDyndataUrl } from '@/services/dyndata'
import { createLogger } from '@/utils/logger'
import { useNextItemId } from '~/composables/onchain/useNextItemId'

export default () => {
  const { currentChain } = useChain()
  const { getNextItemId, isChaoticOwner } = useNextItemId()
  const dropStore = useDropStore()
  const { drop, amountToMint, toMintNFTs, loading } = storeToRefs(dropStore)
  const logger = createLogger('massmint')

  const tokenIds = ref<number[]>([])
  const populateTokenIds = async () => {
    const collectionId = Number.parseInt(drop.value.collection)
    const nextId = await getNextItemId(currentChain.value, collectionId)
    tokenIds.value = Array.from(
      { length: amountToMint.value },
      (_, i) => nextId + i,
    )
  }

  const clearMassMint = () => {
    dropStore.resetMassmint()
    tokenIds.value = []
  }

  const massGenerate = async () => {
    try {
      clearMassMint()
      await populateTokenIds()

      toMintNFTs.value = Array.from({ length: amountToMint.value }).map(
        (_, index) => {
          const { image, metadata } = setDyndataUrl({
            chain: drop.value.chain,
            collection: drop.value.collection,
            nft: tokenIds.value[index]!,
          })

          return {
            name: drop.value.name,
            collectionName: drop.value.collectionName,
            price: drop.value.price?.toString() || '',
            nft: tokenIds.value[index],
            metadata,
            image,
          } as ToMassmintNFT
        },
      )

      logger.log('Generated', toRaw(toMintNFTs.value))
    }
    catch (error) {
      errorMessage(`Error encountered, please retry. ${error?.toString()}`)
      logger.log('Failed generating', error)
      loading.value = false
      throw error
    }
  }

  onBeforeUnmount(clearMassMint)

  return {
    massGenerate,
    clearMassMint,
    isChaoticOwner,
  }
}
