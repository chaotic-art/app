import type { AssetHubChain } from '~/plugins/sdk.client'

import { useNftPallets } from '~/composables/onchain/useNftPallets'

export function useMassMintForm(options?: { collectionId?: string, chain?: AssetHubChain }) {
  const { userCollection } = useNftPallets()

  // Wallet connection check
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const isWalletConnected = computed(() => Boolean(getConnectedSubAccount.value?.address))

  // Form state — pre-fill from route context if provided
  const state = reactive({
    collection: options?.collectionId ?? '',
    blockchain: options?.chain ?? ('ahp' as AssetHubChain),
  })

  // If collection context is provided, skip fetching
  const hasCollectionContext = Boolean(options?.collectionId && options?.chain)

  // Fetch user collections dynamically
  const collections = ref<Array<{ label: string, value: string, name: string, description: string, image: string }>>([])
  const collectionsLoading = ref(false)

  // Fetch collections and user balance on component mount
  watchEffect(async () => {
    if (hasCollectionContext || !isWalletConnected.value)
      return

    collectionsLoading.value = true
    state.collection = ''

    try {
      // fetch user collections
      const userCollections = await userCollection(state.blockchain)

      collections.value = userCollections
        .filter((collection): collection is NonNullable<typeof collection> => Boolean(collection && collection.id))
        .map(collection => ({
          label: `#${collection.id} - ${collection.name}`,
          value: collection.id,
          name: collection.name,
          description: collection.description,
          image: collection.image,
        }))
    }
    catch (error) {
      console.error('Error fetching collections:', error)
      // Fallback to empty array if fetch fails
      collections.value = []
    }
    finally {
      collectionsLoading.value = false
    }
  })

  // Get selected collection details
  const selectedCollection = computed(() => {
    if (!state.collection)
      return null
    return collections.value.find(collection => collection.value === state.collection) || null
  })

  return {
    // State
    state,

    collections,
    collectionsLoading,
    selectedCollection,

  }
}
