export default defineNuxtPlugin(() => {
  const subWalletStore = useSubWalletStore()

  if (import.meta.client) {
    subWalletStore.init()
  }
})
