type ShoppingCartMode = 'shopping-cart' | 'buy-now'

interface ConfirmPurchaseModal {
  open: boolean
  mode: ShoppingCartMode
}

export const usePreferencesStore = defineStore('preferences', () => {
  const walletAccountModalOpen = ref(false)
  const walletConnectModalOpen = ref(false)
  const listingCartModalOpen = ref(false)
  const shoppingCartModalOpen = ref(false)
  const completePurchaseModal = ref<ConfirmPurchaseModal>({ open: false, mode: 'shopping-cart' })

  return {
    walletAccountModalOpen,
    walletConnectModalOpen,
    listingCartModalOpen,
    shoppingCartModalOpen,
    completePurchaseModal,
  }
})
