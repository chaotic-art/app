type ShoppingCartMode = 'shopping-cart' | 'buy-now'
export type ExploreFilterScope = 'explore' | 'collection'
export type NftViewMode = 'grid' | 'compact' | 'art'
export type NftViewModeScope = ExploreFilterScope | 'profile'

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
  const exploreSidebarCollapsed = ref<Record<ExploreFilterScope, boolean>>({
    explore: false,
    collection: false,
  })
  const nftViewModeByScope = ref<Record<NftViewModeScope, NftViewMode>>({
    explore: 'grid',
    collection: 'grid',
    profile: 'grid',
  })

  return {
    walletConnectModalOpen,
    listingCartModalOpen,
    shoppingCartModalOpen,
    completePurchaseModal,
    makeOfferModalOpen,
    exploreSidebarCollapsed,
    nftViewModeByScope,
  }
}, {
  persist: {
    pick: ['exploreSidebarCollapsed', 'nftViewModeByScope'],
  },
})
