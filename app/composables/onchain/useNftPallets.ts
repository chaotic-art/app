import { Binary } from 'polkadot-api'
import { MultiAddress } from '~/descriptors/dist'

interface CreateCollectionParams {
  maxSupply?: number
  metadataUri: string
  royalty: number
}

export function useNftPallets() {
  const { $api } = useNuxtApp()
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const api = $api('pas_asset_hub')

  const { hash, error, status, reset } = useTransactionModal()

  async function createCollection({ maxSupply, metadataUri, royalty }: CreateCollectionParams) {
    reset()

    if (!getConnectedSubAccount.value?.address) {
      throw new Error('No address found')
    }

    const signer = await getConnectedSubAccount.value.signer

    if (!signer) {
      throw new Error('No signer found')
    }

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

    transaction.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        // eslint-disable-next-line no-console
        console.log('event', event)

        status.value = event.type

        if (event.type === 'txBestBlocksState' && event.found) {
          hash.value = event.block.hash.toString()
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
  }
}
