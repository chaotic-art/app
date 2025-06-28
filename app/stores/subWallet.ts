import type { Signer } from '@polkadot/api/types'
import type {
  SubstrateWallet,
  SubstrateWalletAccount,
  SubstrateWalletSource,
} from '@/utils/wallet/substrate/types'
import { defineStore } from 'pinia'
import { getAvailableWallets } from '@/utils/wallet/substrate/config'
import { WalletProxyMap } from '@/utils/wallet/substrate/types'

const DAPP_NAME = 'Chaotic'

export const useSubWalletStore = defineStore('subWallet', () => {
  const wallets = ref<SubstrateWallet[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const initialized = ref(false)

  const enabledWallets = computed(() => wallets.value.filter(wallet => wallet.enabled))

  async function init(appName: string = DAPP_NAME): Promise<SubstrateWallet[]> {
    if (initialized.value) {
      return wallets.value
    }

    try {
      isLoading.value = true

      const { web3Enable } = await import('@polkadot/extension-dapp')
      const extensions = await web3Enable(appName)

      const availableWallets = getAvailableWallets()
      wallets.value = availableWallets.map((metadata) => {
        const extension = extensions.find(ext =>
          ext.name === metadata.source
          || WalletProxyMap[ext.name as SubstrateWalletSource] === metadata.source,
        )

        return {
          ...metadata,
          installed: !!extension,
          enabled: false,
          accounts: [],
          extension: extension || undefined,
          signer: extension?.signer || undefined,
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

      const { web3Accounts } = await import('@polkadot/extension-dapp')
      const accounts = await web3Accounts()

      const walletAccounts: SubstrateWalletAccount[] = accounts
        .filter(account => account.meta.source === WalletProxyMap[walletSource] || walletSource)
        .map(account => ({
          address: account.address,
          name: account.meta.name || undefined,
          source: walletSource,
          type: account.type,
          genesisHash: account.meta.genesisHash,
        }))

      wallet.accounts = walletAccounts
      wallet.enabled = true
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
    // State
    wallets,
    enabledWallets,
    isLoading,
    error,
    initialized,

    // Actions
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
