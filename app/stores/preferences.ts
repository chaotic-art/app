type ShoppingCartMode = 'shopping-cart' | 'buy-now'

interface ConfirmPurchaseModal {
  open: boolean
  mode: ShoppingCartMode
}

export const usePreferencesStore = defineStore('preferences', () => {
  const walletConnectModalOpen = ref(false)
  const listingCartModalOpen = ref(false)
  const shoppingCartModalOpen = ref(false)
  const completePurchaseModal = ref<ConfirmPurchaseModal>({ open: false, mode: 'shopping-cart' })
  const makeOfferModalOpen = ref(false)
  const artViewFilter = ref(false)

  return {
    walletConnectModalOpen,
    listingCartModalOpen,
    shoppingCartModalOpen,
    completePurchaseModal,
    makeOfferModalOpen,
    artViewFilter,
  }
})
