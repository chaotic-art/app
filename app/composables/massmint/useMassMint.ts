import type { NFTToMint } from '~/components/massmint/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { Binary } from 'polkadot-api'
import { MultiAddress } from '~/descriptors/dist'
import { pinDirectory, pinJson } from '~/services/storage'
import { toNative } from '~/utils/format/balance'

interface MassMintParams {
  nfts: NFTToMint[]
  collectionId: string
  collectionName: string
  blockchain: AssetHubChain
}

interface MassMintProgress {
  total: number
  current: number
  stage: 'preparing' | 'uploading' | 'minting' | 'complete' | 'error'
  message: string
}

const BATCH_SIZE = 5
const BATCH_DELAY_MS = 3000

export function useMassMint() {
  const { $sdk } = useNuxtApp()
  const { hash, error, status, result, open } = useTransactionModal()
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())

  const progress = ref<MassMintProgress>({
    total: 0,
    current: 0,
    stage: 'preparing',
    message: 'Preparing...',
  })

  const isLoading = computed(() => {
    return progress.value.total > 0 && progress.value.stage !== 'complete' && progress.value.stage !== 'error'
  })

  async function prepareNftMetadata(nfts: NFTToMint[]) {
    error.value = null
    progress.value = {
      total: nfts.length,
      current: 0,
      stage: 'uploading',
      message: 'Uploading media files...',
    }

    const processNft = async (nft: NFTToMint, index: number) => {
      const imagesCid = await pinDirectory([nft.file]).catch((err) => {
        errorMessage(`Error pinning media files: [${err.message}]. Please try again later.`)
      })
      const imageUrl = `ipfs://${imagesCid}`

      const metadata = {
        name: nft.name,
        description: nft.description || '',
        image: imageUrl,
        external_url: 'https://chaotic.art',
        ...(nft.attributes && nft.attributes.length > 0 && {
          attributes: nft.attributes,
        }),
      }

      const metadataCid = await pinJson(metadata)
        .catch((err) => {
          errorMessage(`Error pinning metadata:[${err.message}]. Please try again later.`)
        })

      progress.value.current = index + 1

      return {
        metadataUri: `ipfs://${metadataCid}`,
        price: nft.price,
        imageUrl,
      }
    }

    const batches = Array.from(
      { length: Math.ceil(nfts.length / BATCH_SIZE) },
      (_, i) => nfts.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE),
    )

    const metadataResults = []

    for (const [batchIndex, batch] of batches.entries()) {
      const batchPromises = batch.map((nft, i) =>
        processNft(nft, batchIndex * BATCH_SIZE + i),
      )

      const batchResults = await Promise.all(batchPromises)
      metadataResults.push(...batchResults)

      // Add delay between batches
      if (batchIndex < batches.length - 1) {
        progress.value.message = `Uploading media files... (${((batchIndex + 1) / batches.length * 100).toFixed(0)}%) `

        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS))
      }
    }

    return metadataResults
  }

  async function massMint({ nfts, collectionId, collectionName, blockchain }: MassMintParams) {
    if (!getConnectedSubAccount.value?.address) {
      throw new Error('No wallet connected')
    }

    const account = getConnectedSubAccount.value
    const signer = await account.signer

    if (!signer) {
      throw new Error('No signer found')
    }

    try {
      const metadataResults = await prepareNftMetadata(nfts)

      progress.value = {
        total: nfts.length,
        current: 0,
        stage: 'minting',
        message: 'Minting NFTs...',
      }

      const api = $sdk(blockchain).api
      await api.compatibilityToken

      // Get next item ID for the collection
      const queryNextItemId = await api.query.Nfts.Item.getEntries(Number.parseInt(collectionId))
      const nextItemId = Math.max(...queryNextItemId.map(item => Number(item.keyArgs[1])), 0) + 1

      const calls = []
      const decimals = chainSpec[blockchain].tokenDecimals

      // Create mint transactions for each NFT
      for (let i = 0; i < nfts.length; i++) {
        const nft = nfts[i]!
        const metadata = metadataResults[i]!

        // Mint NFT
        const _txMint = api.tx.Nfts.mint({
          collection: Number.parseInt(collectionId),
          item: nextItemId + i,
          mint_to: MultiAddress.Id(account.address),
          witness_data: undefined,
        })

        // Set item metadata
        const _txItemMetadata = api.tx.Nfts.set_metadata({
          collection: Number.parseInt(collectionId),
          item: nextItemId + i,
          data: Binary.fromText(metadata.metadataUri),
        })

        calls.push(_txMint.decodedCall, _txItemMetadata.decodedCall)

        // Set price if provided
        if (metadata.price !== undefined && metadata.price > 0) {
          const priceInNative = toNative(metadata.price, decimals)
          const _txSetPrice = api.tx.Nfts.set_price({
            collection: Number.parseInt(collectionId),
            item: nextItemId + i,
            price: BigInt(priceInNative),
            whitelisted_buyer: undefined,
          })
          calls.push(_txSetPrice.decodedCall)
        }

        // Add attributes if provided
        if (nft.attributes && nft.attributes.length > 0) {
          nft.attributes.forEach((attr) => {
            const _txAttribute = api.tx.Nfts.set_attribute({
              collection: Number.parseInt(collectionId),
              maybe_item: nextItemId + i,
              namespace: {
                type: 'CollectionOwner',
                value: undefined,
              },
              key: Binary.fromText(attr.trait_type),
              value: Binary.fromText(attr.value),
            })
            calls.push(_txAttribute.decodedCall)
          })
        }
      }

      // Create batch transaction
      const transaction = api.tx.Utility.batch_all({ calls })

      // Open transaction modal
      open.value = true

      // Submit transaction
      transaction.signSubmitAndWatch(signer).subscribe({
        next: (event) => {
          status.value = event.type

          if (event.type === 'txBestBlocksState' && event.found) {
            hash.value = event.block.hash.toString()

            result.value = {
              type: 'nft',
              collectionId,
              collectionName,
              items: nfts.map((nft, index) => ({
                id: (nextItemId + index).toString(),
                name: nft.name,
                image: metadataResults[index]?.imageUrl || '',
                price: metadataResults[index]?.price || 0,
                metadata: metadataResults[index]?.metadataUri || '',
              })),
              hash: hash.value,
              prefix: blockchain,
            }

            progress.value = {
              total: nfts.length,
              current: nfts.length,
              stage: 'complete',
              message: `Successfully minted ${nfts.length} NFTs!`,
            }
          }
        },
        error: (err) => {
          console.error('Mass mint error:', err)
          error.value = err
          progress.value = {
            total: nfts.length,
            current: 0,
            stage: 'error',
            message: `Error minting NFTs: ${err.message}`,
          }
        },
      })
    }
    catch (err: any) {
      console.error('Mass mint preparation error:', err)
      error.value = err
      progress.value = {
        total: nfts.length,
        current: 0,
        stage: 'error',
        message: `Error preparing NFTs: ${err.message}`,
      }
    }
  }

  return {
    massMint,
    progress,
    isLoading,
    hash,
    error,
    status,
    result,
  }
}
