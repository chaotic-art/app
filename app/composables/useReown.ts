import type { AppKit, ConnectedWalletInfo, UseAppKitAccountReturn } from '@reown/appkit/vue'
import { createAppKit, useAppKit, useDisconnect } from '@reown/appkit/vue'

export default ({ onAccountChange }: { onAccountChange?: (params: { account: UseAppKitAccountReturn, wallet: ConnectedWalletInfo }) => void } = {}) => {
  const { $wagmi } = useNuxtApp()
  const { disconnect } = useDisconnect()

  const isConnecting = ref(false)
  const connectedWalletInfo = ref<ConnectedWalletInfo>()
  const currentKey = ref<string | undefined>()
  const appKit = ref<AppKit>()

  const initModal = () => {
    appKit.value = createAppKit({
      adapters: [$wagmi.adapter],
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
  }

  async function openModal() {
    if (isConnecting.value)
      return

    isConnecting.value = true

    try {
      if (!appKit.value) {
        initModal()
      }

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
