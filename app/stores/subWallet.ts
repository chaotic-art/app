import type { InjectedPolkadotAccount } from 'polkadot-api/pjs-signer'
import type {
  SubstrateWallet,
  SubstrateWalletAccount,
  SubstrateWalletSource,
} from '@/utils/wallet/substrate/types'
import { defineStore } from 'pinia'
import { isExtensionInstalled } from '@/utils/wallet/substrate'
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
  const injectionStatus = ref<'checking' | 'injected' | 'not-injected'>('checking')

  const injected = computed(() => injectionStatus.value === 'injected')
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

      const { connectInjectedExtension } = await importPjsSigner()
      const rawExtension = await connectInjectedExtension(walletSource, DAPP_NAME)

      const accounts = rawExtension.getAccounts()
      const walletAccounts = formatAccounts(wallet.source, accounts)

      wallet.accounts = walletAccounts
      wallet.enabled = true
      wallet.extension = rawExtension
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

  async function getSigner(source: SubstrateWalletSource, address: string) {
    const { connectInjectedExtension } = await importPjsSigner()
    const selectedExtension = await connectInjectedExtension(source)
    const account = selectedExtension.getAccounts().find(account => account.address === address)

    return account?.polkadotSigner
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
    injected,
    injectionStatus,

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

async function importPjsSigner() {
  if (!import.meta.client) {
    throw new Error('Polkadot signer is only available on the client')
  }

  return import('polkadot-api/pjs-signer')
}
