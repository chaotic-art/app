import type { ChainVM } from '@kodadot1/static'
import type { WalletAccount, WalletExtension, WalletStageType, WalletState } from './types'
import type { SubstrateWalletSource } from '~/utils/wallet/substrate/types'
import { defineStore } from 'pinia'
import { WalletStageTypes, WalletStates } from './types'

const USER_CONNECTED_WALLET_STATES: WalletState[] = [
  WalletStates.Authorized,
  WalletStates.Connecting,
  WalletStates.Connected,
]

export const useWalletStore = defineStore('wallet', () => {
  const wallets = ref<WalletExtension[]>([])
  const selectedAccounts = ref<Record<ChainVM, string | undefined>>({ SUB: '', EVM: '' })
  const stage = ref<WalletStageType>(WalletStageTypes.Loading)

  const getIsEvmConnected = computed(() => Boolean(selectedAccounts.value.EVM))
  const getConnectedEvmAccount = computed(() => selectedAccounts.value.EVM ? getWalletAccount(selectedAccounts.value.EVM) : undefined)
  const getIsSubstrateConnected = computed(() => Boolean(selectedAccounts.value.SUB))
  const getConnectedSubAccount = computed(() => selectedAccounts.value.SUB ? getWalletAccount(selectedAccounts.value.SUB) : undefined)
  const getInstalledWallets = computed(() => wallets.value.filter(wallet => wallet.installed))
  const getUninstalledWallets = computed(() => wallets.value.filter(wallet => !wallet.installed))
  const getConnectedWallets = computed(() => wallets.value.filter(wallet => wallet.state === WalletStates.Connected))
  const getUserConnectedWallets = computed(() => wallets.value.filter(wallet => USER_CONNECTED_WALLET_STATES.includes(wallet.state)))

  function findWallet(id: string): WalletExtension | undefined {
    return wallets.value.find(wallet => wallet.id === id)
  }

  function getWalletAccount(accountId: string): WalletAccount | undefined {
    const [walletId] = accountId.split(':')

    if (!walletId)
      return undefined

    const wallet = findWallet(walletId)

    const account = wallet?.accounts.find(account => account.id === accountId)

    if (!wallet || !account)
      return undefined

    if (account.vm === 'EVM')
      return account

    console.log('getWalletAccount ->getSigner', account)

    const { getSigner, injected } = useSubWalletStore()

    if (!injected) {
      return account
    }

    return {
      ...account,
      signer: getSigner(wallet.source as SubstrateWalletSource, account.address),
    }
  }

  function clear() {
    wallets.value = []
  }

  // TODO unify updateWalletState
  function updateWalletState(id: string, state: WalletState) {
    updateWallet(id, { state })
  }

  function updateWallet(id: string, wallet: Partial<WalletExtension>) {
    const index = wallets.value.findIndex(w => w.id === id)
    if (index !== -1) {
      wallets.value[index] = { ...wallets.value[index], ...wallet } as WalletExtension
    }
  }

  function addWallet(wallet: WalletExtension) {
    const index = wallets.value.findIndex(w => w.id === wallet.id)
    if (index === -1) {
      wallets.value.push(wallet)
    }
  }

  function setStage(payload: WalletStageType) {
    stage.value = payload
  }

  function setSelectedAccount(vm: ChainVM, accountId: string) {
    selectedAccounts.value[vm] = accountId
  }

  function clearSelectedWallets() {
    wallets.value = wallets.value.map(wallet => ({ ...wallet, isSelected: false }))
  }

  return {
    wallets,
    addWallet,
    stage,
    selectedAccounts,
    getIsSubstrateConnected,
    getIsEvmConnected,
    getUninstalledWallets,
    getInstalledWallets,
    getConnectedSubAccount,
    getConnectedEvmAccount,
    getConnectedWallets,
    getUserConnectedWallets,
    clear,
    updateWalletState,
    updateWallet,
    setStage,
    setSelectedAccount,
    clearSelectedWallets,
  }
}, {
  persist: {
    // SSR is disabled because wallet components are mostly available only on client side
    storage: import.meta.client ? localStorage : undefined,
    pick: ['wallets', 'selectedAccounts'],
  },
})
