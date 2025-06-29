import type { Signer } from '@polkadot/api/types'
import type { InjectedExtension, InjectedWindow, InjectedWindowProvider } from '@polkadot/extension-inject/types'
import type {
  SubstrateWallet,
  SubstrateWalletAccount,
  SubstrateWalletSource,
} from '@/utils/wallet/substrate/types'
import { defineStore } from 'pinia'
import { getAvailableWallets } from '@/utils/wallet/substrate/config'

const DAPP_NAME = 'Chaotic'

function getInjectedExtension(source: SubstrateWalletSource): InjectedWindowProvider | undefined {
  const injectedWindow = window as Window & InjectedWindow
  return injectedWindow?.injectedWeb3?.[source]
}

function isExtensionInstalled(source: SubstrateWalletSource): boolean {
  return Boolean(getInjectedExtension(source))
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
          signer: undefined,
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

  async function connectWallet(walletSource: SubstrateWalletSource): Promise<SubstrateWalletAccount[]> {
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

      const injectedExtension = getInjectedExtension(walletSource)

      if (!injectedExtension) {
        throw new Error(`Injected extension not found for ${walletSource}`)
      }

      const rawExtension = await injectedExtension.enable?.(DAPP_NAME)

      if (!rawExtension) {
        throw new Error(`Failed to enable ${walletSource}`)
      }

      const accounts = await rawExtension.accounts.get()

      const walletAccounts: SubstrateWalletAccount[] = accounts
        .map(account => ({
          address: account.address,
          name: account.name || undefined,
          source: walletSource,
          type: account.type,
          genesisHash: account.genesisHash,
        }))

      const extension: InjectedExtension = {
        ...rawExtension,
        // Manually add `InjectedExtensionInfo` so as to have a consistent response.
        name: wallet.name,
        version: injectedExtension.version || '',
      } as const

      wallet.accounts = walletAccounts
      wallet.enabled = true
      wallet.extension = extension
      error.value = null

      return walletAccounts
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

  async function disconnectWallet(walletSource: string): Promise<void> {
    try {
      isLoading.value = true

      const walletIndex = enabledWallets.value.findIndex(w => w.source === walletSource)

      if (enabledWallets.value[walletIndex]) {
        enabledWallets.value[walletIndex].enabled = false
      }

      error.value = null
    }
    catch (err) {
      console.error(`Failed to disconnect wallet ${walletSource}:`, err)
      error.value = err instanceof Error ? err : new Error(`Failed to disconnect ${walletSource}`)
      throw error.value
    }
    finally {
      isLoading.value = false
    }
  }

  // TODO: get signer from spefic ocnnected wallet/extension
  async function getSigner(address: string): Promise<Signer | undefined> {
    for (const wallet of enabledWallets.value) {
      const account = wallet.accounts.find(acc => acc.address === address)
      if (account) {
        try {
          const { web3FromSource } = await import('@polkadot/extension-dapp')
          const injected = await web3FromSource(wallet.source)
          return injected.signer
        }
        catch (err) {
          console.error(`Failed to get signer for ${address}:`, err)
          return undefined
        }
      }
    }
    return undefined
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

  return {
    wallets,
    enabledWallets,
    isLoading,
    error,
    initialized,

    init,
    connectWallet,
    disconnectWallet,
    getSigner,
    getInstalledWallets,
    getEnabledWallets,
    getAllAccounts,
    getAccountsBySource,
  }
})
