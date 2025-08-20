export const usePreferencesStore = defineStore('preferences', () => {
  const walletAccountModalOpen = ref(false)
  const walletConnectModalOpen = ref(false)
  const listingCartModalOpen = ref(false)
  const shoppingCartModalOpen = ref(false)

  return {
    walletAccountModalOpen,
    walletConnectModalOpen,
    listingCartModalOpen,
    shoppingCartModalOpen,
  }
})
