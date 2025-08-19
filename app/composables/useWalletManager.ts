export default function useWalletManager() {
  const walletStore = useWalletStore()
  const { selectedAccounts } = storeToRefs(walletStore)
  const accountStore = useAccountStore()

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

  return {
    disconnectWallet,
  }
}
