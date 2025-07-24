import type { PolkadotSigner } from 'polkadot-api/pjs-signer'

export async function getWalletSigner(address: string): Promise<PolkadotSigner | null> {
  try {
    const subWalletStore = useSubWalletStore()
    const walletStore = useWalletStore()

    subWalletStore.init()

    await subWalletStore.connectWallet('talisman')

    const signer = subWalletStore.getSigner('talisman', address)

    if (signer) {
      return signer
    }

    throw new Error('Wallet not found')
  }
  catch (e) {
    console.warn(`[EXTENSION] No Addr ${address}`)
    return null
  }
}
