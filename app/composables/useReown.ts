import type { AppKit, ConnectedWalletInfo, UseAppKitAccountReturn } from '@reown/appkit/vue'
import { createAppKit, useAppKit, useDisconnect } from '@reown/appkit/vue'
import { useAppKitState } from '@reown/appkit/vue'

export interface UseReownOnAccountChangeParams {
  account: UseAppKitAccountReturn
  wallet: ConnectedWalletInfo
}

interface AppKitOptions {
  onAccountChange?: (params: UseReownOnAccountChangeParams) => void
  onModalOpenChange?: (open: boolean) => void
  onWalletChange?: (wallet?: ConnectedWalletInfo) => void
}

export default ({ onAccountChange, onModalOpenChange, onWalletChange }: AppKitOptions = {}) => {
  const { $wagmi } = useNuxtApp()
  const { disconnect } = useDisconnect()

  const isModalOpen = ref(false)
  const isConnecting = ref(false)
  const connectedWalletInfo = ref<ConnectedWalletInfo>()
  const currentKey = ref<string>()
  const appKit = ref<AppKit>() // TODO: nake it a singelton

  const initAppKit = () => {
    appKit.value = createAppKit({
      adapters: [$wagmi.adapter],
      // @ts-expect-error different types each network
      networks: [$wagmi.defaultNetwork, ...$wagmi.networks],
      projectId: $wagmi.projectId,
      metadata: $wagmi.metadata,
      themeMode: 'light',
      features: {
        email: false,
        socials: false,
        swaps: false,
      },
    })

    appKit.value.subscribeWalletInfo((walletInfo) => {
      connectedWalletInfo.value = walletInfo

      onWalletChange?.(walletInfo)
    })

    appKit.value.subscribeAccount((account) => {
      if (!connectedWalletInfo.value) {
        return
      }

      const key = `${connectedWalletInfo.value?.rdns}:${account.allAccounts.map(({ address }) => address).join(', ')}`

      if (currentKey.value === key) {
        return
      }

      currentKey.value = key

      onAccountChange?.({ account, wallet: connectedWalletInfo.value })
    })

    const state = useAppKitState()

    watch(() => state.open, (open) => {
      setTimeout(() => {
        isModalOpen.value = open
        onModalOpenChange?.(open)
      }, 300) // Delay to not trigger modal change before account change event
    })
  }

  if (import.meta.client && !appKit.value) {
    initAppKit()
  }

  async function openModal() {
    if (isConnecting.value)
      return

    isConnecting.value = true

    try {
      useAppKit().open()
    }
    catch (error) {
      console.error('Failed to connect EVM wallet:', error)
    }
    finally {
      isConnecting.value = false
    }
  }

  return {
    openModal,
    disconnect,
  }
}
