type ShoppingCartMode = 'shopping-cart' | 'buy-now'
export type ExploreFilterScope = 'explore' | 'collection'

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
  const exploreSidebarCollapsed = ref<Record<ExploreFilterScope, boolean>>({
    explore: false,
    collection: false,
  })

  return {
    walletConnectModalOpen,
    listingCartModalOpen,
    shoppingCartModalOpen,
    completePurchaseModal,
    makeOfferModalOpen,
    artViewFilter,
    exploreSidebarCollapsed,
  }
}, {
  persist: {
    pick: ['exploreSidebarCollapsed'],
  },
})
