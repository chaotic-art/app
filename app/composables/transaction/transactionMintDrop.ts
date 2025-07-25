import type {
  MintDropParams,
  SubstrateMintDropParams,
} from './types'
import type { AssethubApi } from '~/plugins/api.client'
import { Binary } from 'polkadot-api'
import { asBatchAllTransaction } from '@/utils/papi'

// import { AssethubApi } from './evm/utils'
// import { useDrop } from '@/components/drops/useDrops'

function execAssethubMintDrop({
  item,
  api,
  executeTransaction,
  isLoading,
}: SubstrateMintDropParams<AssethubApi>) {
  const { drop } = useDrop()
  const { toMintNFTs } = storeToRefs(useDropStore())
  const { accountId } = useAuth()

  const nftsMetadata = computed(() => {
    return toMintNFTs.value.map((nft) => {
      return {
        chain: drop.value.chain,
        collection: drop.value.collection,
        metadata: nft.metadata,
      }
    })
  })

  const calls = toMintNFTs.value.map((allocatedNft, index) => {
    const sn = (item.availableSerialNumbers || [])[index]

    return api.tx.Nfts.mint({
      collection: Number(item.collectionId),
      item: allocatedNft.nft,
      mint_to: {
        type: 'Id',
        value: accountId.value!,
      },
      witness_data: {
        owned_item: sn ? Number(sn) : undefined,
        mint_price: item.price ? BigInt(item.price) : undefined,
      },
    })
  })

  const transactions = [
    ...calls,
    api.tx.System.remark({
      remark: Binary.fromText(JSON.stringify(nftsMetadata.value)),
    }),
  ]

  isLoading.value = true

  executeTransaction(
    asBatchAllTransaction(api, transactions),
  )
}

// async function execEvmMintDrop({ executeTransaction }: EvmMintDropParams) {
//   const { accountId } = useAuth()
//   const { drop } = useDrop()
//   const { amountToMint } = storeToRefs(useDropStore())
//   const abi = drop.value.abi as Abi

//   const { arg, functionName } = hasBatchMint(abi) && amountToMint.value > 1
//     ? {
//         functionName: 'safeBatchMint',
//         arg: [accountId.value, amountToMint.value],
//       }
//     : {
//         functionName: 'safeMint',
//         arg: [accountId.value],
//       }

//   executeTransaction({
//     address: drop.value.collection,
//     abi,
//     arg,
//     functionName,
//     value: String(Number(drop.value.price) * amountToMint.value),
//   })
// }EvmMintDropParams

export function execMintDrop({ item, ...params }: MintDropParams) {
  if (isAssetHub(item.urlPrefix)) {
    return execAssethubMintDrop({
      item,
      ...params,
    } as SubstrateMintDropParams<AssethubApi>)
  }

  // if (isEvm(item.urlPrefix)) {
  //   return execEvmMintDrop({
  //     item,
  //     ...params,
  //   })
  // }
}
