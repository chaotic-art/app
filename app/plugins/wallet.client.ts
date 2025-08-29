import type { SubstrateWalletSource } from '~/utils/wallet/substrate/types'
import { isExtensionInstalled } from '~/utils/wallet/substrate'

export default defineNuxtPlugin((nuxtApp) => {
  const subWalletStore = useSubWalletStore()
  const { getInstalledWallets } = storeToRefs(useWalletStore())
  const { injectionStatus } = storeToRefs(subWalletStore)

  const isInjectedWeb3FullyLoaded = () => {
    const isFullyLoaded = getInstalledWallets.value
      .filter(wallet => wallet.vm === 'SUB')
      .map(wallet => isExtensionInstalled(wallet.source as SubstrateWalletSource))
      .every(Boolean)

    return Boolean(window.injectedWeb3) && isFullyLoaded
  }

  const waitForInjection = async (timeout = 3000) => {
    return new Promise((resolve, reject) => {
      if (isInjectedWeb3FullyLoaded()) {
        resolve(true)
        return
      }

      const startTime = Date.now()
      const checkInterval = setInterval(() => {
        if (isInjectedWeb3FullyLoaded()) {
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
        injectionStatus.value = 'injected'
        subWalletStore.init()
      })
      .catch(() => {
        injectionStatus.value = 'not-injected'
        console.error('Failed to initialize sub wallet')
      })
  })
})
