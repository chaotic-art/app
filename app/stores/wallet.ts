import type { ChainVM } from '@kodadot1/static'
import type { SubstrateWalletSource } from '@/utils/wallet/substrate/types'
import { defineStore } from 'pinia'

export interface WalletAccount {
  address: string
  name?: string
  extension?: SubstrateWalletSource
}

export interface VmWalletState {
  account?: WalletAccount
  disconnecting: boolean
  connected: boolean
}

export interface SetWalletParams {
  vm: ChainVM
  account: WalletAccount
}

function getDefaultWalletState(): VmWalletState {
  return {
    account: undefined,
    disconnecting: false,
    connected: false,
  }
}

function getDefaultWallets() {
  return {
    SUB: getDefaultWalletState(),
    EVM: getDefaultWalletState(),
  }
}

export const useWalletStore = defineStore('wallet', () => {
  const { vm } = useChain()

  const wallets = ref<Record<ChainVM, VmWalletState>>(getDefaultWallets())
  const getWalletVM = computed(() => wallets.value[vm.value])
  const getIsEvmConnected = computed(() => wallets.value.EVM.connected)
  const getIsSubstrateConnected = computed(() => wallets.value.SUB.connected)
  const getEvmWalletAddress = computed(() => wallets.value.EVM.account?.address)
  const getSubstrateWalletAddress = computed(() => wallets.value.SUB.account?.address)

  function setDisconnecting(vm: ChainVM, payload: boolean) {
    wallets.value[vm].disconnecting = payload
  }

  function setWallet({ vm, account }: SetWalletParams) {
    wallets.value[vm] = {
      account,
      disconnecting: false,
      connected: true,
    }
  }

  function disconnect(vm: ChainVM) {
    wallets.value[vm] = getDefaultWalletState()
  }

  function clear() {
    wallets.value = getDefaultWallets()
  }

  return {
    wallets,
    getWalletVM,
    getIsSubstrateConnected,
    getIsEvmConnected,
    getSubstrateWalletAddress,
    getEvmWalletAddress,
    setDisconnecting,
    setWallet,
    clear,
    disconnect,
  }
}, {
  persist: true,
})
