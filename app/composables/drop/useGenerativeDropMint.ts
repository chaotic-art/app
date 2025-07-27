import type { DoResult } from '@/services/fxart'
import { useSubscriptionGraphql } from '#imports'
import { updateMetadata } from '@/services/fxart'

export type DropMintedNft = DoResult & {
  id: string
  collectionName: string
  name: string
  max: number
}

export interface DropCollectionById {
  collectionEntity: {
    meta: { description: string }
    name: string
    max: number
    nftCount: number
    nfts: { sn: string }[]
  }
}

export async function useUpdateMetadata({ blockNumber }: { blockNumber: Ref<number | undefined> }) {
  const { drop } = useDrop()
  const { toMintNFTs, mintingSession } = storeToRefs(useDropStore())
  const { $consola } = useNuxtApp()
  const { accountId } = useAuth()

  const updateSubstrateMetadata = () => {
    mintingSession.value.items = toMintNFTs.value.map((item) => {
      // trigger update metadata
      updateMetadata({
        chain: drop.value.chain,
        collection: drop.value.collection,
        nft: item.nft,
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
    // subscribeForNftsWithMetadata(
    //   toMintNFTs.value.map(
    //     item => `${drop.value.collection}-${item.nft.toString()}`,
    //   ),
    // )
  }

  // const updateEvmMetadata = () => {
  //   const mintedNfts = [] as MintedNFT[]
  //   useSubscriptionGraphql({
  //     query: `
  //   nfts: nftEntities(
  //     where: {collection: {id_eq: "${drop.value.collection}"}, blockNumber_eq: "${blockNumber.value}", currentOwner_eq: "${isEthereumAddress(accountId.value) ? accountId.value.toLowerCase() : accountId.value}"},
  //     orderBy: [createdAt_ASC, sn_ASC]
  //   ) {
  //     id
  //     blockNumber
  //     currentOwner
  //     metadata
  //     sn
  //   }
  // `,
  //     onChange: async ({ data: { nfts } }) => {
  //       if (!nfts.length) {
  //         return
  //       }

  //       let metadata = { name: '', image: '' }

  //       for (const nft of nfts) {
  //         try {
  //           metadata = await $fetch(nft.metadata || '')
  //         }
  //         catch (error) {
  //           $consola.warn(error)
  //         }

  //         mintedNfts.push({
  //           id: nft.id,
  //           metadata: nft.metadata,
  //           chain: drop.value.chain,
  //           name: metadata.name,
  //           image: metadata.image,
  //           collection: {
  //             id: drop.value.collection,
  //             name: drop.value.collectionName,
  //             max: drop.value.max,
  //           },
  //         })
  //       }

  //       mintingSession.value.items = mintedNfts
  //     },
  //   })
  // }

  execByVm({
    // EVM: updateEvmMetadata,
    SUB: updateSubstrateMetadata,
  })
}

export default () => {
  const dropStore = useDropStore()
  const { drop } = storeToRefs(dropStore)

  const mintCountAvailable = computed(
    () => drop.value.max && drop.value.minted < drop.value.max,
  )

  const subscribeToMintedNft = (id: string, onReady: (data) => void) => {
    useSubscriptionGraphql({
      query: `nftEntityById(id: "${id}") {
      id
    }`,
      onChange: onReady,
    })
  }

  return {
    mintCountAvailable,
    subscribeToMintedNft,
  }
}
