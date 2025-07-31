import { accountsAreSame } from '@/utils/account'

export default function () {
  const accountStore = useAccountStore()

  const accountId = computed(() => accountStore.address || '')
  const isLogIn = computed(() => Boolean(accountId.value))

  const isCurrentAccount = (address?: string) => accountsAreSame(accountId.value, address)

  return {
    accountId,
    isLogIn,
    isCurrentAccount,
  }
}
