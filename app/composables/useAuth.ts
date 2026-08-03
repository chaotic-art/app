import { accountsAreSame } from '@/utils/account'

export default function () {
  const accountStore = useAccountStore()
  const walletStore = useWalletStore()

  const accountId = computed(() => accountStore.address || '')
  const isLogIn = computed(() => Boolean(accountId.value))

  const defaultAccount = computed(() => {
    return accountId.value || walletStore.getSelectedAccountAddress('EVM')
  })

  const isCurrentAccount = (address?: string) => accountsAreSame(accountId.value, address)

  return {
    accountId,
    isLogIn,
    isCurrentAccount,
    defaultAccount,
  }
}
