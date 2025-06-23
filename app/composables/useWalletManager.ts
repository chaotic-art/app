import type { WalletExtension } from '@/stores/wallet/types'
import { useWalletStore } from '@/stores/wallet'
import { WalletStates } from '@/stores/wallet/types'

export default function useWalletManager() {
  const walletStore = useWalletStore()
  const { selectedAccounts } = storeToRefs(walletStore)
  const { disconnect: disconnectReown } = useReown()

  async function disconnectWallet(wallet: WalletExtension) {
    const vm = wallet.vm

    await execByVm({
      EVM: () => disconnectReown(),
    }, { vm })

    walletStore.updateWallet(wallet.id, {
      accounts: [],
      state: WalletStates.Disconnected,
    })

    if (selectedAccounts.value[vm]?.includes(wallet.id)) {
      selectedAccounts.value[vm] = undefined
    }
  }

  return {
    disconnectWallet,
  }
}
