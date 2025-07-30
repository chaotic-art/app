import { accountsAreSame } from '@/utils/account'

export default function () {
  const accountStore = useAccountStore()

  const accountId = computed(() => accountStore.address || '')

  const isCurrentAccount = (address?: string) => accountsAreSame(accountId.value, address)

  return {
    accountId,
    isCurrentAccount,
  }
}
