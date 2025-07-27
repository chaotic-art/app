import type { InjectedPolkadotAccount, PolkadotSigner } from 'polkadot-api/pjs-signer'
import type {
  SubstrateWallet,
  SubstrateWalletAccount,
  SubstrateWalletSource,
} from '@/utils/wallet/substrate/types'
import { defineStore } from 'pinia'
import { connectInjectedExtension } from 'polkadot-api/pjs-signer'
import { getInjectedExtension, isExtensionInstalled } from '@/utils/wallet/substrate'
import { getAvailableWallets } from '@/utils/wallet/substrate/config'

const DAPP_NAME = 'Chaotic'

function formatAccounts(source: SubstrateWalletSource, accounts: InjectedPolkadotAccount[]): SubstrateWalletAccount[] {
  return accounts.map(account => ({
    address: account.address,
    name: account.name,
    source,
    type: account.type,
    genesisHash: account.genesisHash,
    signer: account.polkadotSigner,
  }))
}

export const useSubWalletStore = defineStore('subWallet', () => {
  const wallets = ref<SubstrateWallet[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const initialized = ref(false)

  const enabledWallets = computed(() => wallets.value.filter(wallet => wallet.enabled))

  function init(): SubstrateWallet[] {
    if (initialized.value) {
      return wallets.value
    }

    try {
      isLoading.value = true

      const availableWallets = getAvailableWallets()

      wallets.value = availableWallets.map((metadata) => {
        return {
          ...metadata,
          installed: isExtensionInstalled(metadata.source),
          enabled: false,
          accounts: [],
          extension: undefined,
        }
      })

      initialized.value = true
      error.value = null
      return wallets.value
    }
    catch (err) {
      console.error('Failed to initialize wallet connections:', err)
      error.value = err instanceof Error ? err : new Error('Unknown error during wallet initialization')
      return []
    }
    finally {
      isLoading.value = false
    }
  }

  function isWalletInitialized(walletId: string): boolean {
    return Boolean(wallets.value.find(w => w.id === walletId)?.extension)
  }

  function subscribeAccounts(walletId: string) {
    const wallet = wallets.value.find(w => w.id === walletId)

    if (!wallet) {
      return
    }

    const extension = wallet.extension

    if (!extension) {
      return
    }

    wallet.unsub?.()

    const unsub = extension.subscribe((accounts) => {
      wallet.accounts = formatAccounts(wallet.source, accounts)
    })

    wallet.unsub = unsub
  }

  async function connectWallet(walletSource: SubstrateWalletSource): Promise<SubstrateWallet> {
    const wallet = wallets.value.find(w => w.source === walletSource)

    if (!wallet) {
      const err = new Error(`Wallet ${walletSource} not found or not installed`)
      error.value = err
      throw err
    }

    if (!wallet.installed) {
      const err = new Error(`Please install ${wallet.name} to continue`)
      error.value = err
      throw err
    }

    try {
      isLoading.value = true

      if (!getInjectedExtension(walletSource)) {
        throw new Error(`Injected extension not found for ${walletSource}`)
      }

      const injectedExtension = await connectInjectedExtension(walletSource, DAPP_NAME)

      if (!injectedExtension) {
        throw new Error(`Failed to enable ${walletSource}`)
      }

      const accounts = injectedExtension.getAccounts()

      const walletAccounts = formatAccounts(wallet.source, accounts)

      wallet.accounts = walletAccounts
      wallet.enabled = true
      wallet.extension = injectedExtension
      error.value = null

      return wallet
    }
    catch (err) {
      console.error(`Failed to connect to wallet ${walletSource}:`, err)
      error.value = err instanceof Error ? err : new Error(`Failed to connect to ${walletSource}`)
      throw error.value
    }
    finally {
      isLoading.value = false
    }
  }

  async function disconnectWallet(source: SubstrateWalletSource): Promise<void> {
    try {
      isLoading.value = true

      const wallet = wallets.value.find(w => w.source === source)

      if (!wallet) {
        throw new Error(`Wallet ${source} not found`)
      }

      wallet.extension?.disconnect()

      updateWallet(wallet.source, { enabled: false })

      error.value = null
    }
    catch (err) {
      console.error(`Failed to disconnect wallet ${source}:`, err)
      error.value = err instanceof Error ? err : new Error(`Failed to disconnect ${source}`)
      throw error.value
    }
    finally {
      isLoading.value = false
    }
  }

  async function getSigner(source: SubstrateWalletSource, address: string): Promise<PolkadotSigner | undefined> {
    const wallet = await connectWallet(source)

    return wallet?.accounts.find(account => account.address === address)?.signer
  }

  function getInstalledWallets(): SubstrateWallet[] {
    return wallets.value
  }

  function getEnabledWallets(): SubstrateWallet[] {
    return enabledWallets.value
  }

  function getAllAccounts(): SubstrateWalletAccount[] {
    return enabledWallets.value.flatMap(wallet => wallet.accounts)
  }

  function getAccountsBySource(source: SubstrateWalletSource): SubstrateWalletAccount[] {
    const wallet = enabledWallets.value.find(w => w.source === source)
    return wallet ? wallet.accounts : []
  }

  function updateWallet(source: SubstrateWalletSource, wallet: Partial<SubstrateWallet>): void {
    const walletIndex = wallets.value.findIndex(w => w.source === source)

    if (walletIndex !== -1) {
      wallets.value[walletIndex] = {
        ...wallets.value[walletIndex],
        ...wallet,
      } as SubstrateWallet
    }
  }

  return {
    wallets,
    enabledWallets,
    isLoading,
    error,
    initialized,

    init,
    connectWallet,
    isWalletInitialized,
    subscribeAccounts,
    disconnectWallet,
    getSigner,
    getInstalledWallets,
    getEnabledWallets,
    getAllAccounts,
    getAccountsBySource,
  }
})
