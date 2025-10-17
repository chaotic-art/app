import type { AssetHubChain } from '~/plugins/sdk.client'

import { useNftPallets } from '~/composables/onchain/useNftPallets'

export function useMassMintForm() {
  const { userCollection } = useNftPallets()

  // Wallet connection check
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const isWalletConnected = computed(() => Boolean(getConnectedSubAccount.value?.address))

  // Form state
  const state = reactive({
    collection: '',
    blockchain: 'ahp' as AssetHubChain, // Default to Asset Hub Polkadot
  })

  // Fetch user collections dynamically
  const collections = ref<Array<{ label: string, value: string, name: string, description: string, image: string }>>([])
  const collectionsLoading = ref(false)

  // Fetch collections and user balance on component mount
  watchEffect(async () => {
    if (!isWalletConnected.value)
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
