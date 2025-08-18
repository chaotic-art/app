import type { SupportedChain } from '~/plugins/sdk.client'

export function shortenAddress(address: string): string {
  if (!address || address.length < 10)
    return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Generate Subscan URL for a given address and chain prefix
 */
const chainMapping: Record<SupportedChain, string> = {
  dot: 'polkadot',
  ksm: 'kusama',
  ahp: 'assethub-polkadot',
  ahk: 'assethub-kusama',
  ahpas: 'assethub-paseo',
}

export function getSubscanAccountUrl(address: string, prefix: SupportedChain) {
  return `https://${chainMapping[prefix]}.subscan.io/account/${address}`
}

export function getSubscanExtrinsicUrl(hash: string, prefix: SupportedChain) {
  return `https://${chainMapping[prefix]}.subscan.io/extrinsic/${hash}`
}

export function getSubscanNftUrl(id: string, prefix: SupportedChain) {
  return `https://${chainMapping[prefix]}.subscan.io/nft_collection/${id}?tab=tokens`
}

/**
 * Copy address to clipboard with toast notification
 */
export async function copyAddress(address = '') {
  if (!address) {
    return
  }

  try {
    await navigator.clipboard.writeText(address)
    const toast = useToast()
    toast.add({
      title: 'Address copied',
      description: `Address ${shortenAddress(address)} copied to clipboard`,
      color: 'success',
    })
  }
  catch (err) {
    console.error('Failed to copy address:', err)
    const toast = useToast()
    toast.add({
      title: 'Copy failed',
      description: 'Failed to copy address to clipboard',
      color: 'error',
    })
  }
}
