import type { SubstrateWalletSource } from '@/utils/wallet/substrate/types'
import type { ChainVM, Prefix } from '@kodadot1/static'
import { formatAddress } from '@/utils/account'
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
  const getIsEvmConnected = computed(() => wallets.value[vm.value].connected)
  const getIsSubstrateConnected = computed(() => wallets.value[vm.value].connected)

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

  function setCorrectAddressFormat(prefix: Prefix) {
    const vm = vmOf(prefix)
    const account = wallets.value[vm].account

    if (!account) {
      return
    }

    if (getIsSubstrateConnected.value && isSub(prefix)) {
      const address = formatAddress({
        address: account.address,
        ss58: ss58Of(prefix),
        vm: 'SUB',
      })

      if (address === account.address) {
        return
      }

      setWallet({ vm, account: { ...account, address } })
      // useIdentityStore().setAuth({ address })
    }
  }

  function switchChain(prefix: Prefix) {
    setCorrectAddressFormat(prefix)
  }

  return {
    wallets,
    getWalletVM,
    getIsSubstrateConnected,
    getIsEvmConnected,
    setDisconnecting,
    setWallet,
    clear,
    setCorrectAddressFormat,
    switchChain,
    disconnect,
  }
}, {
  persist: true,
})
