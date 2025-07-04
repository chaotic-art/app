import type { AppKit, ConnectedWalletInfo, PublicStateControllerState, UseAppKitAccountReturn } from '@reown/appkit/vue'
import { createAppKit, useAppKit, useDisconnect } from '@reown/appkit/vue'

export interface UseReownOnAccountChangeParams {
  account: UseAppKitAccountReturn
  wallet: ConnectedWalletInfo
}

interface AppKitOptions {
  onAccountChange?: (params: UseReownOnAccountChangeParams) => void
  onModalOpenChange?: (open: boolean) => void
  onWalletChange?: (wallet?: ConnectedWalletInfo) => void
}

const appKit = ref<AppKit>()
const appKitState = ref<PublicStateControllerState>()
const connectedWalletInfo = ref<ConnectedWalletInfo>()
const accountState = ref<UseAppKitAccountReturn>()
const currentKey = ref<string>()

export default ({ onAccountChange, onModalOpenChange, onWalletChange }: AppKitOptions = {}) => {
  const { $wagmi } = useNuxtApp()
  const { disconnect } = useDisconnect()

  const isReady = computed(() => Boolean(appKit.value))
  const isModalOpen = computed(() => Boolean(appKitState.value?.open))
  const isConnected = computed(() => Boolean(accountState.value?.isConnected))

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
    })

    appKit.value.subscribeAccount((account) => {
      accountState.value = account
    })

    appKit.value.subscribeState((state) => {
      appKitState.value = state
    })
  }

  if (import.meta.client) {
    if (!appKit.value) {
      initAppKit()
    }
  }

  async function openModal() {
    if (isModalOpen.value)
      return

    try {
      useAppKit().open()
    }
    catch (error) {
      console.error('Failed to connect EVM wallet:', error)
    }
  }

  watch(connectedWalletInfo, (walletInfo) => {
    if (!walletInfo) {
      accountState.value = undefined
    }

    onWalletChange?.(walletInfo)
  })

  watch([accountState, connectedWalletInfo], ([account, walletInfo]) => {
    if (!walletInfo || !account) {
      return
    }

    const key = `${walletInfo.rdns}:${account.allAccounts.map(({ address }) => address).join(', ')}`

    if (currentKey.value === key) {
      return
    }

    currentKey.value = key

    onAccountChange?.({ account, wallet: walletInfo })
  })

  watch(isModalOpen, (isOpen) => {
    onModalOpenChange?.(isOpen)
  })

  return {
    openModal,
    disconnect,
    isReady,
    isModalOpen,
    isConnected,
    accounts: accountState,
    walletInfo: connectedWalletInfo,
  }
}
