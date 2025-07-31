export default function () {
  const accountStore = useAccountStore()

  const accountId = computed(() => accountStore.address || '')
  const isLogIn = computed(() => Boolean(accountId.value))

  return {
    accountId,
    isLogIn,
  }
}
