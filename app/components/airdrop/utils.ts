import type { ActionAirdrop } from '@/components/airdrop/types'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { isAddress } from '@polkadot/util-crypto'
import { DistributionMode } from '@/components/airdrop/types'
import { MultiAddress } from '@/descriptors/dist'
import { warningMessage } from '@/utils/notification'

function checkTxsAirdrop(item: ActionAirdrop) {
  const addresses = item.addresses

  if (!addresses.length || !item.nfts.length) {
    warningMessage('No addresses or NFTs')
    return false
  }

  return addresses.every((address) => {
    if (!isAddress(address)) {
      warningMessage('Invalid address')
      return false
    }

    return true
  })
}

export function generateAirdropTxs(item: ActionAirdrop, chain: AssetHubChain) {
  if (!checkTxsAirdrop(item)) {
    return
  }

  const { $sdk } = useNuxtApp()
  const api = $sdk(chain).api
  const argGenerator = item.distributionMode === DistributionMode.ONE_PER_ADDRESS ? generateOnePerAddressDistribution : generateRandomDistribution
  const args = argGenerator(item)

  const transaction = api.tx.Utility.batch_all({
    calls: args.map(tx => tx!.decodedCall),
  })

  return transaction

  function generateTransferTx(collection: number, item: number, dest: string) {
    return api.tx.Nfts.transfer({
      collection: Number(collection),
      item: Number(item),
      dest: MultiAddress.Id(dest),
    })
  }

  function generateOnePerAddressDistribution(item: ActionAirdrop) {
    const randomNfts = Array.from(item.nfts).sort(() => Math.random() - 0.5)

    if (randomNfts.length < item.addresses.length) {
      warningMessage('Not enough NFTs for one-per-address distribution')
      return []
    }

    return item.addresses.map((address, index) => {
      const nft = randomNfts[index]
      return generateTransferTx(nft!.collectionId, nft!.sn, address)
    })
  }

  function generateRandomDistribution(item: ActionAirdrop) {
    const { nfts, addresses } = item

    if (!addresses.length || !nfts.length) {
      return []
    }
    const randomNfts = Array.from(nfts).sort(() => Math.random() - 0.5)
    const randomAddresses = Array.from(addresses).sort(() => Math.random() - 0.5)

    if (randomAddresses.length < randomNfts.length) {
      // address count less than nfts count

      return randomNfts.map((nft, index) => {
        const addressIndex = index % randomAddresses.length
        const targetAddress = randomAddresses[addressIndex]
        return generateTransferTx(nft!.collectionId, nft!.sn, targetAddress as string)
      })
    }
    else {
      // address count greater than or equal to nfts count
      return randomNfts.map((nft, index) => {
        return generateTransferTx(nft!.collectionId, nft!.sn, randomAddresses[index] as string)
      })
    }
  }
}

export function downloadAirdropTemplate() {
  try {
    const templateContent = `${CHAOTIC_MINTER}\n${CHAOTIC_MINTER}`
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'airdrop-template.csv'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  catch (error) {
    console.error('Error downloading template:', error)
    // Fallback: try to open in new tab
    const templateContent = `${CHAOTIC_MINTER}\n${CHAOTIC_MINTER}`
    const dataUri = `data:text/csv;charset=utf-8,${encodeURIComponent(templateContent)}`
    window.open(dataUri, '_blank')
  }
}
