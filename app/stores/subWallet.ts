import type { Signer } from '@polkadot/api/types'
import type { InjectedExtension } from '@polkadot/extension-inject/types'
import type {
  SubstrateWallet,
  SubstrateWalletAccount,
  SubstrateWalletSource,
} from '@/utils/wallet/substrate/types'
import { defineStore } from 'pinia'
import { getInjectedExtension, isExtensionInstalled } from '@/utils/wallet/substrate'
import { getAvailableWallets } from '@/utils/wallet/substrate/config'

const DAPP_NAME = 'Chaotic'

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
          name: account.name,
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

  async function disconnectWallet(source: SubstrateWalletSource): Promise<void> {
    try {
      isLoading.value = true

      const wallet = wallets.value.find(w => w.source === source)

      if (!wallet) {
        throw new Error(`Wallet ${source} not found`)
      }

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

  function getSigner(source: SubstrateWalletSource): Signer | undefined {
    const wallet = enabledWallets.value.find(w => w.source === source)

    return wallet?.signer
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
    disconnectWallet,
    getSigner,
    getInstalledWallets,
    getEnabledWallets,
    getAllAccounts,
    getAccountsBySource,
  }
})
