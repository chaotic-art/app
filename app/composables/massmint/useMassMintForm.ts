import type { AssetHubChain } from '~/plugins/sdk.client'

import { useNftPallets } from '~/composables/onchain/useNftPallets'

export interface UseMassMintFormOptions {
  collectionId?: string
  blockchain?: AssetHubChain
}

export function useMassMintForm(options?: Ref<UseMassMintFormOptions | undefined> | UseMassMintFormOptions) {
  const optionsRef = computed(() => unref(options))
  const isStudioContext = computed(() => Boolean(optionsRef.value?.collectionId && optionsRef.value?.blockchain))

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

  // Sync initial collection/chain when in studio context
  watchEffect(() => {
    const opts = optionsRef.value
    if (opts?.collectionId && opts?.blockchain) {
      state.collection = opts.collectionId
      state.blockchain = opts.blockchain
    }
  })

  // Fetch collections and user balance on component mount
  watchEffect(async () => {
    if (!isWalletConnected.value)
      return

    collectionsLoading.value = true
    if (!isStudioContext.value) {
      state.collection = ''
    }

    try {
      const blockchain = state.blockchain
      // fetch user collections
      const userCollections = await userCollection(blockchain)

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
    state,
    collections,
    collectionsLoading,
    selectedCollection,
    isStudioContext,
  }
}
