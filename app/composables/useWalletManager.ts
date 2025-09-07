import { LazyWalletAssetModal } from '#components'
import { createEventHook, whenever } from '@vueuse/core'

const overlay = useOverlay()
const walletAssetModal = overlay.create(LazyWalletAssetModal)

export function useWalletSidebar() {
  const route = useRoute()

  // Auto-close slide over when navigating to different pages
  watch(
    () => route.path,
    (newPath, oldPath) => {
      if (oldPath && newPath !== oldPath) {
        walletAssetModal.close()
      }
    },
  )

  return {
    walletAssetModal,
  }
}

export default function useWalletManager() {
  const walletStore = useWalletStore()
  const { accountId } = useAuth()
  const { selectedAccounts } = storeToRefs(walletStore)
  const accountStore = useAccountStore()
  const disconnectEvent = createEventHook<void>()

  async function disconnectWallet(wallet: WalletExtension) {
    const vm = wallet.vm

    if (vm === 'EVM') {
      if (import.meta.client) {
        const { disconnect: disconnectReown } = useReown()

        return disconnectReown()
      }

      return Promise.resolve()
    }

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
