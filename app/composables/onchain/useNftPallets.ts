import type { ActionAirdrop } from '~/components/airdrop/types'
import type { AssetHubChain, SupportedChain } from '~/plugins/sdk.client'
import type { NFTMetadata } from '~/services/oda'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { encodeAddress } from 'dedot/utils'
import { Binary, Enum } from 'polkadot-api'
import { generateAirdropTxs } from '@/components/airdrop/utils'
import { generateIdAssethub } from '@/services/dyndata'
import { MultiAddress } from '~/descriptors/dist'
import { refreshOdaTokenMetadata } from '~/services/oda'
import { BLOCKS_PER_DAY, getOfferCollectionId, OFFER_MINT_PRICE } from './utils'

export type TxType = 'submit' | 'estimate'

interface CollectionRoyalty {
  amount: number
  recipient: string
}

interface CreateCollectionParams {
  chain: AssetHubChain
  type: TxType
  maxSupply?: number
  metadataUri: string
  royalty: number
  context: {
    name: string
    description: string
    image: string
  }
}

export interface Property {
  trait: string
  value: string
}

interface CreateNftParams {
  chain: AssetHubChain
  type: TxType
  collectionId: number
  collectionName: string
  metadataUri: string | string[]
  supply: number
  properties: Property[]
  price?: number
  context: {
    name: string
    description: string
    image: string
    supply: number
  }
}

interface ListNftsParams {
  chain: AssetHubChain
  type: TxType
  nfts: {
    id: string
    sn: number
    price: number
    metadata: NFTMetadata
    metadata_uri: string
    collection: {
      id: number
      name: string
    }
  }[]
}

interface BuyNftItem {
  id: string
  sn: number
  price: number
  metadata: NFTMetadata
  metadata_uri: string
  collection: {
    id: number
    name: string
  }
}

interface BuyNftsParams {
  chain: AssetHubChain
  type?: TxType
  nfts: BuyNftItem[]
}
interface AirdropNftsParams {
  chain: AssetHubChain
  items: ActionAirdrop
  type?: TxType

}

interface TransferNftsParams {
  items: BaseActionCartItem[]
  chain: AssetHubChain
  targetAddress: string
  type?: TxType
}

interface CreateOfferParams {
  items: {
    price: string
    offeredItem: number | undefined
    desiredItem: number | undefined
    desiredCollectionId: number
    duration: number
  }[]
  chain: AssetHubChain
  type?: TxType
}

interface CancelOfferParams {
  offeredItemId: number
  chain: AssetHubChain
  type?: TxType
}

interface AcceptOfferParams {
  sendCollection: number
  sendItem: number
  receiveItem: number
  price: number
  chain: AssetHubChain
  type?: TxType
}

interface CancelSwapParams {
  offeredCollectionId: number
  offeredItemId: number
  chain: AssetHubChain
  type?: TxType
}

interface AcceptSwapParams {
  sendCollection: number
  sendItem: number
  receiveCollection: number
  receiveItem: number
  price: number
  surcharge: SwapSurchargeDirection | null
  chain: AssetHubChain
  type?: TxType
}

export type SwapSurchargeDirection = 'Send' | 'Receive'

export interface SwapSurcharge { amount: string, direction: SwapSurchargeDirection }

export function useNftPallets() {
  const { $sdk } = useNuxtApp()
  const { hash, error, status, result, open } = useTransactionModal()

  const { getConnectedSubAccount } = storeToRefs(useWalletStore())

  async function createCollection({
    chain,
    type,
    maxSupply,
    metadataUri,
    royalty,
    context: collectionData,
  }: CreateCollectionParams) {
    if (!getConnectedSubAccount.value?.address) {
      throw new Error('No address found')
    }

    const api = $sdk(chain).api
    await api.compatibilityToken

    // next collection id
    const queryNextId = await api.query.Nfts.NextCollectionId.getValue()
    const nextId = Number(queryNextId?.toString())

    // create collection
    const _txCreate = api.tx.Nfts.create({
      admin: MultiAddress.Id(getConnectedSubAccount.value.address),
      config: {
        settings: 0n,
        max_supply: maxSupply,
        mint_settings: {
          mint_type: { type: 'Issuer', value: undefined },
          price: undefined,
          start_block: undefined,
          end_block: undefined,
          default_item_settings: 0n,
        },
      },
    })

    // set collection metadata
    const _txCollectionMetadata = api.tx.Nfts.set_collection_metadata({
      collection: nextId,
      data: Binary.fromText(metadataUri),
    })

    // set royalty
    const _txRoyalty = api.tx.Nfts.set_attribute({
      collection: nextId,
      maybe_item: undefined,
      namespace: {
        type: 'CollectionOwner',
        value: undefined,
      },
      key: Binary.fromText('royalty'),
      value: Binary.fromText(royalty.toString()),
    })

    // set royalty recipient
    const _txRecipient = api.tx.Nfts.set_attribute({
      collection: nextId,
      maybe_item: undefined,
      namespace: {
        type: 'CollectionOwner',
        value: undefined,
      },
      key: Binary.fromText('recipient'),
      value: Binary.fromText(getConnectedSubAccount.value.address),
    })

    const transaction = api.tx.Utility.batch_all({
      calls: [
        _txCreate.decodedCall,
        _txCollectionMetadata.decodedCall,
        _txRoyalty.decodedCall,
        _txRecipient.decodedCall,
      ],
    })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(getConnectedSubAccount.value.address)
      return estimatedFees
    }

    const signer = await getConnectedSubAccount.value.signer

    if (!signer) {
      throw new Error('No signer found')
    }

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()

          result.value = {
            type: 'collection',
            id: nextId.toString(),
            name: collectionData.name,
            description: collectionData.description,
            image: collectionData.image,
            hash: hash.value,
            prefix: chain,
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function userBalance(chain: SupportedChain) {
    if (!getConnectedSubAccount.value?.address) {
      // throw new Error('No address found')
      return 0n
    }

    const api = $sdk(chain).api
    const query = await api.query.System.Account.getValue(getConnectedSubAccount.value.address)
    return query?.data.free ?? 0n
  }

  async function userCollection(chain: AssetHubChain) {
    if (!getConnectedSubAccount.value?.address) {
      // throw new Error('No address found')
      return []
    }

    const api = $sdk(chain).api
    const query = await api.query.Nfts.CollectionAccount.getEntries(getConnectedSubAccount.value.address)
    const collections = query.map(item => item.keyArgs[1])
    const collectionsData = await Promise.all(collections.map(async (collection) => {
      const query = await api.query.Nfts.CollectionMetadataOf.getValue(collection)

      if (query?.data.asText().length) {
        const metadataData = await $fetch<{
          name?: string
          description?: string
          image?: string
        }>(sanitizeIpfsUrl(query?.data.asText()))

        return {
          id: collection.toString(),
          name: metadataData?.name || 'Untitled',
          description: metadataData?.description || 'No description',
          image: metadataData?.image || 'https://placehold.co/600x400',
        }
      }

      return null
    }))

    return collectionsData.filter(Boolean)
  }

  async function mintNft({
    chain,
    type,
    collectionId,
    collectionName,
    metadataUri,
    supply,
    properties,
    price,
    context: nftData,
  }: CreateNftParams) {
    const { signer, address } = await getAccountSigner()

    const api = $sdk(chain).api
    await api.compatibilityToken

    // Get next item ID for the collection
    const queryNextItemId = await api.query.Nfts.Item.getEntries(collectionId)
    const nextItemId = Math.max(...queryNextItemId.map(item => Number(item.keyArgs[1])), 0) + 1

    const calls = []

    // Mint multiple NFTs if supply > 1
    for (let i = 0; i < supply; i++) {
      // Mint NFT
      const _txMint = api.tx.Nfts.mint({
        collection: collectionId,
        item: nextItemId + i,
        mint_to: MultiAddress.Id(address),
        witness_data: undefined,
      })

      // Set item metadata - use appropriate CID for each NFT
      let itemMetadata: string
      if (Array.isArray(metadataUri)) {
        // Use the corresponding CID for each NFT, fallback to first if not enough CIDs
        if (metadataUri.length === 0) {
          throw new Error('No metadata URIs provided')
        }
        itemMetadata = metadataUri[i] ?? metadataUri[0]!
      }
      else {
        // Single metadata URI for all NFTs
        itemMetadata = metadataUri
      }

      const _txItemMetadata = api.tx.Nfts.set_metadata({
        collection: collectionId,
        item: nextItemId + i,
        data: Binary.fromText(itemMetadata),
      })

      calls.push(_txMint.decodedCall, _txItemMetadata.decodedCall)

      // Set price if provided
      if (price !== undefined) {
        const _txSetPrice = api.tx.Nfts.set_price({
          collection: collectionId,
          item: nextItemId + i,
          price: BigInt(price),
          whitelisted_buyer: undefined,
        })
        calls.push(_txSetPrice.decodedCall)
      }

      // Add properties as attributes
      properties.forEach((property) => {
        const _txAttribute = api.tx.Nfts.set_attribute({
          collection: collectionId,
          maybe_item: nextItemId + i,
          namespace: {
            type: 'CollectionOwner',
            value: undefined,
          },
          key: Binary.fromText(property.trait),
          value: Binary.fromText(property.value),
        })
        calls.push(_txAttribute.decodedCall)
      })
    }

    const transaction = api.tx.Utility.batch_all({ calls })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()

          result.value = {
            type: 'nft',
            collectionId: collectionId.toString(),
            collectionName,
            items: Array.from({ length: supply }, (_, i) => ({
              id: (nextItemId + i).toString(),
              name: nftData.name,
              image: nftData.image,
              price: price ?? 0,
              metadata: Array.isArray(metadataUri) ? metadataUri[i]! : metadataUri,
            })),
            hash: hash.value,
            prefix: chain,
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function getAccountSigner(type?: TxType) {
    if (type === 'estimate') {
      return {
        signer: null as any,
        address: getConnectedSubAccount.value?.address || CHAOTIC_MINTER,
      }
    }

    const account = getConnectedSubAccount.value

    if (!account?.address) {
      throw new Error('No address found')
    }

    const signer = await account.signer

    if (!signer) {
      throw new Error('No signer found')
    }

    return {
      signer,
      address: account.address,
    }
  }

  async function listNfts({
    nfts,
    chain,
    type,
  }: ListNftsParams) {
    const { signer, address } = await getAccountSigner()
    const api = $sdk(chain).api

    const txs = nfts.map(({ price, collection, sn }) => {
      return api.tx.Nfts.set_price({
        collection: Number(collection.id),
        item: Number(sn),
        price: BigInt(price),
        whitelisted_buyer: undefined,
      })
    })

    const transaction = api.tx.Utility.batch_all({
      calls: txs.map(tx => tx.decodedCall),
    })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.txHash.toString()

          result.value = {
            type: 'listing',
            items: nfts.map(nft => ({
              id: nft.id,
              sn: nft.sn,
              price: nft.price,
              collection: nft.collection,
              metadata_uri: nft.metadata_uri,
              metadata: nft.metadata,
            })),
            hash: hash.value,
            prefix: chain,
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function collectionAttributes(chain: AssetHubChain, collectionId: number) {
    const attributes = await $sdk(chain).api.query.Nfts.Attribute.getEntries(collectionId)

    return attributes.map((item) => {
      return {
        key: item.keyArgs[3].asText(),
        value: item.value[0],
      }
    })
  }

  async function collectionRoyalties(chain: AssetHubChain, collectionId: number): Promise<CollectionRoyalty | null> {
    const attributes = await collectionAttributes(chain, collectionId)

    const recipient = attributes.find(attr => attr.key === 'recipient')
    const royalty = attributes.find(attr => attr.key === 'royalty')

    // if !recipient should default to the collection owner?
    if (!(royalty && recipient)) {
      return null
    }

    return {
      recipient: encodeAddress(recipient.value.asText(), chainSpec[chain].ss58Format),
      amount: Number(royalty.value.asText()),
    }
  }

  async function buyNfts({
    nfts,
    chain,
    type = 'submit',
  }: BuyNftsParams) {
    const { signer, address } = await getAccountSigner()
    const api = $sdk(chain).api

    const totalPrice = sum(nfts.map(nft => Number(nft.price)))

    const buyTxs = nfts.map(({ price, collection, sn }) => {
      return api.tx.Nfts.buy_item({
        collection: Number(collection.id),
        item: Number(sn),
        bid_price: BigInt(price),
      })
    })

    const supportTx = api.tx.Balances.transfer_keep_alive({
      dest: MultiAddress.Id(CHAOTIC_MINTER),
      value: BigInt(getPercentSupportFee(totalPrice)),
    })

    const royalties = await Promise.all(nfts.map(async (item) => {
      const royalty = await collectionRoyalties(chain, item.collection.id)
      return {
        royalty,
        item,
      }
    }))

    const itemsWithRoyalties = royalties.filter((i): i is { item: BuyNftItem, royalty: CollectionRoyalty } => i.royalty !== null)

    const txs = [
      ...buyTxs,
      supportTx,
      itemsWithRoyalties.length
        ? api.tx.Nfts.pay_tips({
            tips: itemsWithRoyalties.map(({ item, royalty }) => ({
              collection: Number(item.collection.id),
              item: Number(item.sn),
              receiver: royalty.recipient,
              amount: BigInt(item.price * (Number(royalty.amount) / 100)),
            })),
          })
        : undefined,
    ].filter(Boolean)

    const transaction = api.tx.Utility.batch_all({
      calls: txs.map(tx => tx!.decodedCall),
    })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.txHash.toString()
        }

        result.value = {
          type: 'buy',
          hash: hash.value,
          prefix: chain,
          items: nfts.map(nft => ({
            id: nft.id,
            sn: nft.sn,
            price: nft.price,
            collection: nft.collection,
            metadata_uri: nft.metadata_uri,
            metadata: nft.metadata,
          })),
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function airdropNfts({
    items,
    chain,
    type = 'submit',
  }: AirdropNftsParams) {
    const { signer, address } = await getAccountSigner()
    const transaction = generateAirdropTxs(items, chain)!

    if (type === 'estimate') {
      const estimatedFees = await transaction!.getEstimatedFees(address)
      return estimatedFees
    }

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.txHash.toString()
        }

        result.value = {
          type: 'airdrop',
          hash: hash.value,
          prefix: chain,
          items: items.nfts.map(nft => ({
            id: nft.id,
            sn: nft.sn,
            price: Number(nft.price),
            collection: nft.collection,
            metadata_uri: nft.metadata_uri,
            metadata: nft.metadata,
          })),
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function burnNfts({ items, chain, type = 'submit' }: { items: BaseActionCartItem[], chain: AssetHubChain, type: TxType }) {
    const { signer, address } = await getAccountSigner()

    const api = $sdk(chain).api
    await api.compatibilityToken

    const calls = []
    const itemsToBurn = items.filter(item => !item.mimeType?.includes('html'))

    for (const item of itemsToBurn) {
      const _txBurn = api.tx.Nfts.burn({
        collection: item.collection.id,
        item: item.sn,
      })

      calls.push(_txBurn.decodedCall)
    }

    const transaction = api.tx.Utility.batch_all({ calls })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    open.value = true

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()

          result.value = {
            type: 'burn',
            hash: hash.value,
            prefix: chain,
            items: itemsToBurn.map(nft => ({
              id: nft.id,
              sn: nft.sn,
              price: 0,
              collection: nft.collection,
              metadata_uri: nft.metadata_uri,
              metadata: nft.metadata,
            })),
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function transferNfts({
    items,
    chain,
    targetAddress,
    type = 'submit',
  }: TransferNftsParams) {
    await cryptoWaitReady()
    const { signer, address } = await getAccountSigner()
    const api = $sdk(chain).api
    await api.compatibilityToken

    const calls = items.map((item) => {
      return api.tx.Nfts.transfer({
        collection: item.collection.id,
        item: item.sn,
        dest: MultiAddress.Id(targetAddress),
      })
    })

    const transaction = api.tx.Utility.batch_all({
      calls: calls.map(call => call.decodedCall),
    })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    // purge metadata
    const purgeMetadata = items.map(item => (refreshOdaTokenMetadata(chain, item.collection.id.toString(), item.sn.toString())))
    await Promise.all(purgeMetadata)

    open.value = true

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()

          result.value = {
            type: 'token_transfer',
            hash: hash.value,
            prefix: chain,
            items: items.map(nft => ({
              id: nft.id,
              sn: nft.sn,
              price: 0,
              collection: nft.collection,
              metadata_uri: nft.metadata_uri,
              metadata: nft.metadata,
            })),
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function createOffer({
    items: tokens,
    chain,
    type = 'submit',
  }: CreateOfferParams) {
    const { signer, address } = await getAccountSigner()
    const api = $sdk(chain).api

    const txGroups = await Promise.all(
      tokens.map(async ({ price, desiredItem, desiredCollectionId, duration, offeredItem: offeredSn }) => {
        const offeredCollectionId = getOfferCollectionId(chain)
        let offeredItem = offeredSn

        const transactions: Array<
          ReturnType<typeof api.tx.Nfts.mint> | ReturnType<typeof api.tx.Nfts.create_swap>
        > = []

        if (!offeredItem && type === 'submit') {
          offeredItem = await generateIdAssethub(Number(offeredCollectionId), chain)
          const create = api.tx.Nfts.mint(
            {
              collection: offeredCollectionId,
              item: offeredItem,
              mint_to: MultiAddress.Id(address),
              witness_data: {
                mint_price: BigInt(OFFER_MINT_PRICE),
              },
            },
          )
          transactions.push(create)
        }

        const offer = api.tx.Nfts.create_swap(
          {
            offered_collection: offeredCollectionId,
            offered_item: offeredItem as number,
            desired_collection: desiredCollectionId,
            maybe_desired_item: !desiredItem ? undefined : desiredItem,
            maybe_price: {
              amount: BigInt(price),
              direction: Enum('Send'),
            },
            duration: BLOCKS_PER_DAY * duration,
          },
        )

        transactions.push(offer)

        return transactions
      }),
    )

    const calls = txGroups.flat()

    const transaction = api.tx.Utility.batch_all({
      calls: calls.map(tx => tx.decodedCall),
    })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    open.value = true

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()

          result.value = {
            type: 'create_offer',
            hash: hash.value,
            prefix: chain,
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function cancelOffer({
    offeredItemId,
    chain,
    type = 'submit',
  }: CancelOfferParams) {
    const { signer, address } = await getAccountSigner()
    const api = $sdk(chain).api

    const transaction = api.tx.Nfts.cancel_swap({
      offered_collection: getOfferCollectionId(chain),
      offered_item: offeredItemId,
    })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    open.value = true

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()

          result.value = {
            type: 'cancel_offer',
            hash: hash.value,
            prefix: chain,
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function acceptOffer({
    sendCollection,
    sendItem,
    receiveItem,
    chain,
    price,
    type = 'submit',
  }: AcceptOfferParams) {
    const { signer, address } = await getAccountSigner()
    const api = $sdk(chain).api

    const transaction = api.tx.Nfts.claim_swap({
      send_collection: sendCollection,
      send_item: sendItem,
      receive_collection: getOfferCollectionId(chain),
      receive_item: receiveItem,
      witness_price: {
        amount: BigInt(price),
        direction: Enum('Send'),
      },
    })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    open.value = true

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()

          result.value = {
            type: 'accept_offer',
            hash: hash.value,
            prefix: chain,
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function cancelSwap({
    offeredCollectionId,
    offeredItemId,
    chain,
    type = 'submit',
  }: CancelSwapParams) {
    const { signer, address } = await getAccountSigner()
    const api = $sdk(chain).api

    const transaction = api.tx.Nfts.cancel_swap({
      offered_collection: offeredCollectionId,
      offered_item: offeredItemId,
    })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    open.value = true

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()

          result.value = {
            type: 'cancel_swap',
            hash: hash.value,
            prefix: chain,
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  async function acceptSwap({
    sendCollection,
    sendItem,
    receiveCollection,
    receiveItem,
    price,
    surcharge,
    chain,
    type = 'submit',
  }: AcceptSwapParams) {
    const { signer, address } = await getAccountSigner()
    const api = $sdk(chain).api

    const transaction = api.tx.Nfts.claim_swap({
      send_collection: sendCollection,
      send_item: sendItem,
      receive_collection: receiveCollection,
      receive_item: receiveItem,
      witness_price: surcharge
        ? {
            amount: BigInt(price),
            direction: Enum(surcharge),
          }
        : undefined,
    })

    if (type === 'estimate') {
      const estimatedFees = await transaction.getEstimatedFees(address)
      return estimatedFees
    }

    open.value = true

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()

          result.value = {
            type: 'accept_swap',
            hash: hash.value,
            prefix: chain,
          }
        }
      },
      error: (err) => {
        console.error('error', err)
        error.value = err
      },
    })
  }

  return {
    createCollection,
    mintNft,
    listNfts,
    userCollection,
    userBalance,
    buyNfts,
    burnNfts,
    collectionRoyalties,
    createOffer,
    cancelOffer,
    acceptOffer,
    cancelSwap,
    acceptSwap,
    // TODO move else where
    getAccountSigner,
    airdropNfts,
    transferNfts,
  }
}
