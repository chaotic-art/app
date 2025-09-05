import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OdaToken, OnchainCollection } from '~/services/oda'
import { LazyBurnModal, LazyTransferModal } from '#components'

interface UseCartActionsParams {
  tokenId: number
  collectionId: number
  token: Ref<OdaToken | null>
  collection: Ref<OnchainCollection | null>
  owner: Ref<string | null>
  price: Ref<bigint | null>
  chain: AssetHubChain
  mimeType?: ComputedRef<string>
}

export function useCartActions({ collection, price, chain, owner, token, collectionId, tokenId, mimeType }: UseCartActionsParams) {
  const { isCurrentAccount } = useAuth()

  const actionCartStore = useActionCartStore()
  const shoppingCartStore = useShoppingCartStore()
  const listingCartStore = useListingCartStore()

  const { itemToBuy } = storeToRefs(shoppingCartStore)
  const { completePurchaseModal, listingCartModalOpen } = storeToRefs(usePreferencesStore())

  const id = computed(() => `${collectionId}-${tokenId}`)
  const isItemInActionCart = computed(() => actionCartStore.isItemInCart(id.value))
  const isItemInShoppingCart = computed(() => shoppingCartStore.isItemInCart(id.value))
  const isItemInCart = computed(() => isItemInActionCart.value || isItemInShoppingCart.value)

  const canBuy = computed(() => Boolean(price.value) && Boolean(owner.value && !isCurrentAccount(owner.value)))
  const canList = computed(() => Boolean(owner.value && isCurrentAccount(owner.value)))
  const canBurn = computed(() => Boolean(owner.value && isCurrentAccount(owner.value)) && !mimeType?.value?.includes('html'))
  const canTransfer = computed(() => Boolean(owner.value && isCurrentAccount(owner.value)))

  const overlay = useOverlay()
  const burnModal = overlay.create(LazyBurnModal)
  const transferModal = overlay.create(LazyTransferModal)

  function createActionCartItem({ token, owner, mimeType }: { token: OdaToken, owner: string, mimeType?: string }): BaseActionCartItem {
    return {
      id: id.value,
      sn: tokenId,
      name: token.metadata?.name || '',
      chain,
      price: Number(price.value),
      currentOwner: owner,
      mimeType,
      metadata: token.metadata!,
      metadata_uri: token.metadata_uri || '',
      collection: {
        id: collectionId,
        name: collection.value?.metadata?.name || '',
        floor: Number(collection.value?.floor) || 0,
      },
    }
  }

  function addToActionCart() {
    if (!token.value || !owner.value) {
      return
    }

    if (isItemInActionCart.value) {
      actionCartStore.removeItem(id.value)
    }
    else {
      actionCartStore.setItem(createActionCartItem({ token: token.value, owner: owner.value, mimeType: mimeType?.value || '' }))
    }
  }

  function createShoppingCartItem({ token, owner }: { token: OdaToken, owner: string }): ShoppingCartItem {
    return createActionCartItem({ token, owner })
  }

  function addToShoppingCart() {
    if (!token.value || !owner.value) {
      return
    }

    if (isItemInShoppingCart.value) {
      shoppingCartStore.removeItem(id.value)
    }
    else {
      shoppingCartStore.setItem(createShoppingCartItem({ token: token.value, owner: owner.value }))
    }
  }

  function buyNow() {
    if (!token.value || !owner.value) {
      return
    }

    itemToBuy.value = createShoppingCartItem({ token: token.value, owner: owner.value })
    completePurchaseModal.value = { open: true, mode: 'buy-now' }
  }

  function createListingCartItem({ token, owner }: { token: OdaToken, owner: string }): ListingCartItem {
    const baseCartItem = createActionCartItem({ token, owner })
    return {
      ...baseCartItem,
      collection: {
        ...baseCartItem.collection,
      },
    }
  }

  function listNow() {
    if (!token.value || !owner.value) {
      return
    }

    listingCartStore.setItem(createListingCartItem({ token: token.value, owner: owner.value }))
    listingCartModalOpen.value = true
  }

  function burnNow() {
    if (!token.value || !owner.value) {
      return
    }

    if (canBurn.value) {
      actionCartStore.setItem(createActionCartItem({ token: token.value, owner: owner.value, mimeType: mimeType?.value || '' }))
      burnModal.open()
    }
  }

  function transferNow() {
    if (!token.value || !owner.value) {
      return
    }

    if (canTransfer.value) {
      actionCartStore.setItem(createActionCartItem({ token: token.value, owner: owner.value, mimeType: mimeType?.value || '' }))
      transferModal.open()
    }
  }

  return {
    // actions
    addToActionCart,
    addToShoppingCart,
    buyNow,
    listNow,
    burnNow,
    transferNow,
    createActionCartItem,

    // computed
    isItemInActionCart,
    isItemInShoppingCart,
    isItemInCart,
    canBuy,
    canList,
    canBurn,
    canTransfer,
  }
}
