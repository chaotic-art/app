import { MobileWalletList } from '~/utils/wallet/substrate/config'

export default function () {
  const { isLogIn } = useAuth()
  const { wallets } = storeToRefs(useWalletStore())

  const isInMobileWalletBrowser = computed(() => wallets.value
    .filter(wallet => (MobileWalletList as string[]).includes(wallet.id))
    .some(wallet => wallet.installed))

  const isAvailable = computed(() => !isLogIn.value && isMobileDevice && !isInMobileWalletBrowser.value)

  const redirect = (path = window.location.pathname) => {
    window.open(`https://app.novawallet.io/open/dapp?url=https://chaotic.art${path}`, '_blank')
  }

  return { isAvailable, redirect }
}
