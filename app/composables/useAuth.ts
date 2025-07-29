export default function () {
  const accountStore = useAccountStore()

  const accountId = computed(() => accountStore.address || '')

  return {
    accountId,
  }
}
