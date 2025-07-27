export default defineNuxtPlugin(() => {
  const subWalletStore = useSubWalletStore()

  subWalletStore.init()
})
