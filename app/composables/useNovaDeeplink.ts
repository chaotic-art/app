import { SubstrateWalletSources } from '~/utils/wallet/substrate/types'

export default function () {
  const { isLogIn } = useAuth()
  const { wallets } = storeToRefs(useWalletStore())

  const isAvailable = computed(() => !isLogIn.value && isMobileDevice && !wallets.value.find(wallet => wallet.id === SubstrateWalletSources.Nova)?.installed)

  const redirect = (path = window.location.pathname) => {
    window.open(`https://app.novawallet.io/open/dapp?url=https://beta.chaotic.art${path}`, '_blank')
  }

  return { isAvailable, redirect }
}
