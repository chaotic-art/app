export default defineNuxtPlugin((nuxtApp) => {
  const subWalletStore = useSubWalletStore()
  const { injected } = storeToRefs(subWalletStore)

  const waitForInjection = async (timeout = 3000) => {
    return new Promise((resolve, reject) => {
      if (window.injectedWeb3) {
        resolve(true)
        return
      }

      const startTime = Date.now()
      const checkInterval = setInterval(() => {
        if (window.injectedWeb3) {
          clearInterval(checkInterval)
          resolve(true)
        }
        else if (Date.now() - startTime > timeout) {
          clearInterval(checkInterval)
          reject(new Error('Timeout waiting for injectedWeb3'))
        }
      }, 100)
    })
  }

  nuxtApp.hook('app:mounted', () => {
    waitForInjection()
      .then(() => {
        injected.value = true
        subWalletStore.init()
      })
      .catch(() => {
        console.error('Failed to initialize sub wallet')
      })
  })
})
