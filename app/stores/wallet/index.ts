import type { WalletAccount, WalletExtension, WalletStageType, WalletState } from './types'
import { defineStore } from 'pinia'
import { WalletStageTypes, WalletStates } from './types'

export const useWalletStore = defineStore('wallet', () => {
  const wallets = ref<WalletExtension[]>([])
  const stage = ref<WalletStageType>(WalletStageTypes.Loading)

  const getIsEvmConnected = computed(() => wallets.value.find(wallet => wallet.vm === 'EVM')?.state === WalletStates.Connected)
  const getIsSubstrateConnected = computed(() => wallets.value.find(wallet => wallet.vm === 'SUB')?.state === WalletStates.Connected)
  const getInstalledWallets = computed(() => wallets.value.filter(wallet => wallet.installed))
  const getUninstalledWallets = computed(() => wallets.value.filter(wallet => !wallet.installed))

  function findWallet(id: string): WalletExtension | undefined {
    return wallets.value.find(wallet => wallet.id === id)
  }

  // function disconnect(vm: ChainVM) {
  //   const wallet = findWallet(vm)
  //   if (wallet) {
  //     wallet.state = WalletStates.Disconnecting
  //   }
  // }

  function clear() {
    wallets.value = []
  }

  // TODO unify updateWalletState and updateWalletAccounts
  function updateWalletState(id: string, state: WalletState) {
    const wallet = findWallet(id)
    if (wallet) {
      wallet.state = state
    }
  }

  function updateWalletAccounts(id: string, accounts: WalletAccount[]) {
    const wallet = findWallet(id)
    if (wallet) {
      wallet.accounts = accounts
    }
  }

  function addWallet(wallet: WalletExtension) {
    const index = wallets.value.findIndex(w => w.vm === wallet.vm)
    if (index === -1) {
      wallets.value.push(wallet)
    }
    else {
      wallets.value[index] = wallet
    }
  }

  function setStage(payload: WalletStageType) {
    stage.value = payload
  }

  return {
    wallets,
    addWallet,
    stage,
    getIsSubstrateConnected,
    getIsEvmConnected,
    getUninstalledWallets,
    getInstalledWallets,
    // getSubstrateWalletAddress,
    // getEvmWalletAddress,
    // setDisconnecting,
    // setWallet,
    clear,
    updateWalletState,
    updateWalletAccounts,
    setStage,
  }
}, {
  // persist: true,
})
