import { SubstrateWalletSources } from '~/utils/wallet/substrate/types'

export default function () {
  const { isLogIn } = useAuth()
  const { wallets } = storeToRefs(useWalletStore())

  const isAvailable = computed(() => !isLogIn.value && isMobileDevice && !wallets.value.find(wallet => wallet.id === SubstrateWalletSources.Nova)?.installed)

  const redirect = (url = window.location.href) => {
    const deepinkUrl = `https://app.novawallet.io/open/dapp?url=${url}`
    window.open(deepinkUrl, '_blank')
  }

  return { isAvailable, redirect }
}
