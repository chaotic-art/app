import { createEventHook, whenever } from '@vueuse/core'

export default function useWalletManager() {
  const walletStore = useWalletStore()
  const { accountId } = useAuth()
  const { selectedAccounts } = storeToRefs(walletStore)
  const accountStore = useAccountStore()
  const disconnectEvent = createEventHook<void>()

  async function disconnectWallet(wallet: WalletExtension) {
    const vm = wallet.vm

    await execByVm({
      EVM: () => {
        if (import.meta.client) {
          const { disconnect: disconnectReown } = useReown()

          return disconnectReown()
        }

        return Promise.resolve()
      },
    }, { vm })

    walletStore.updateWallet(wallet.id, {
      accounts: [],
      state: WalletStates.Disconnected,
    })

    if (selectedAccounts.value[vm]?.includes(wallet.id)) {
      selectedAccounts.value[vm] = undefined
      accountStore.clearAuth(vm)
    }
  }

  whenever(
    () => !accountId.value,
    () => disconnectEvent.trigger(),
    { flush: 'sync' },
  )

  return {
    disconnectWallet,
    onDisconnect: disconnectEvent.on,
  }
}
