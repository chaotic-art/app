export function shortenAddress(address: string): string {
  if (!address || address.length < 10)
    return ''
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

/**
 * Generate Subscan URL for a given address and chain prefix
 */
export function getSubscanUrl(address: string, prefix: string) {
  const chainMapping: Record<string, string> = {
    dot: 'polkadot',
    ksm: 'kusama',
    ahp: 'assethub-polkadot',
    ahk: 'assethub-kusama',
    ahw: 'assethub-westend',
  }

  const chain = chainMapping[prefix] || 'polkadot'
  return `https://${chain}.subscan.io/account/${address}`
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
