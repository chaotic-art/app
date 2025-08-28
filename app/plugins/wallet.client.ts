export default defineNuxtPlugin((nuxtApp) => {
  const subWalletStore = useSubWalletStore()

  console.log('wallet.client.ts')

  const waitForInjection = async (timeout = 10000) => {
    consoe.log('waitForInjection started')
    return new Promise((resolve, reject) => {
      if (window.injectedWeb3) {
        console.log('waitForInjection found immediatedly', window.injectedWeb3)
        resolve(true)
        return
      }

      const startTime = Date.now()
      const checkInterval = setInterval(() => {
        if (window.injectedWeb3) {
          console.log('waitForInjection found interval', window.injectedWeb3)
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

  nuxtApp.hook('app:beforeMount', () => {
    console.log('app:beforeMount')
    waitForInjection()
      .then(subWalletStore.init)
      .catch(() => {
        console.error('Failed to initialize sub wallet')
      })
  })
})
