import type { ChainVM } from '@kodadot1/static'

export default defineNuxtPlugin(() => {
  const walletStore = useWalletStore()
  const accountStore = useAccountStore()
  const { accounts } = storeToRefs(accountStore)
  const { selectedAccounts } = storeToRefs(walletStore)

  // on mobile wallets like nova wallet cookies are cleared when app is closed
  // so we cant rely on cookies based store persistence, sync account store from wallet store
  // alternatively we can use localStorage to store selected accounts but we loose ssr
  const syncAccountStore = () => {
    Object.keys(selectedAccounts.value).forEach((vm) => {
      try {
        if (!selectedAccounts.value?.[vm as ChainVM]) {
          return
        }

        const walletAddress = walletStore.getSelectedAccountAddress(vm as ChainVM)

        if (!walletAddress || (accounts.value[vm as ChainVM].address && accounts.value[vm as ChainVM].address === walletAddress)) {
          return
        }

        accountStore.setAuth({ vm: vm as ChainVM, address: walletAddress })
      }
      catch (error) {
        console.error('Error syncing account store:', error)
      }
    })
  }

  syncAccountStore()
})
