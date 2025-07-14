export const usePreferencesStore = defineStore('preferences', () => {
  const walletAccountModalOpen = ref(false)
  const walletConnectModalOpen = ref(false)

  return {
    walletAccountModalOpen,
    walletConnectModalOpen,
  }
})
