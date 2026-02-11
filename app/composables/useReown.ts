import type { AppKitNetwork } from '@reown/appkit/networks'
import type { AppKit, ConnectedWalletInfo, PublicStateControllerState, UseAppKitAccountReturn } from '@reown/appkit/vue'
import { createAppKit, useAppKit, useDisconnect } from '@reown/appkit/vue'

export interface UseReownOnAccountChangeParams {
  accounts: Account[]
  wallet: ConnectedWalletInfo
}

interface AppKitOptions {
  onAccountChange?: (params: UseReownOnAccountChangeParams) => void
  onModalOpenChange?: (open: boolean) => void
  onWalletChange?: (wallet?: ConnectedWalletInfo) => void
}

interface Account {
  address: string
}

const appKit = ref<AppKit>()
const appKitState = ref<PublicStateControllerState>()
const connectedWallet = ref<ConnectedWalletInfo>()
const accountState = ref<UseAppKitAccountReturn>()
const accounts = ref<Account[]>([])
const currentKey = ref<string>()

export default ({ onAccountChange, onModalOpenChange, onWalletChange }: AppKitOptions = {}) => {
  const { $wagmi } = useNuxtApp() as unknown as { $wagmi: import('~/plugins/wagmi.client').WagmiPluginProvide }
  const { disconnect } = useDisconnect()

  const isReady = computed(() => Boolean(appKit.value))
  const isModalOpen = computed(() => Boolean(appKitState.value?.open))
  const isConnected = computed(() => Boolean(accountState.value?.isConnected))

  const initAppKit = () => {
    appKit.value = createAppKit({
      adapters: [$wagmi.adapter] as never,
      networks: $wagmi.networks as unknown as [AppKitNetwork, ...AppKitNetwork[]],
      projectId: $wagmi.projectId,
      metadata: $wagmi.metadata,
      themeMode: 'light',
      features: {
        email: false,
        socials: false,
        swaps: false,
      },
    })

    appKit.value.subscribeWalletInfo((wallet) => {
      connectedWallet.value = wallet
    })

    appKit.value.subscribeAccount((account) => {
      accountState.value = account
    })

    appKit.value.subscribeState((state) => {
      // Create a defensive copy to break references and ensure Vue reactivity works properly
      // The original state object may be mutated by AppKit, causing reactivity issues
      appKitState.value = { ...state }
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

  watch(connectedWallet, (wallet) => {
    if (!wallet) {
      accountState.value = undefined
    }

    onWalletChange?.(wallet)
  })

  watch([accountState, connectedWallet], ([account, wallet]) => {
    if (!wallet || !account) {
      return
    }

    const addresses = unique([...account.allAccounts.map(({ address }) => address), account.address].filter(Boolean) as string[])

    const key = `${wallet.rdns}:${addresses.join(', ')}`

    if (currentKey.value === key) {
      return
    }

    currentKey.value = key

    const newAccounts = addresses.map(address => ({ address }))

    accounts.value = newAccounts

    onAccountChange?.({ accounts: newAccounts, wallet })
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
    accounts,
    wallet: connectedWallet,
  }
}
