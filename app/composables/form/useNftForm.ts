import type { Prefix } from '@kodadot1/static'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { pinDirectory, pinJson } from '~/services/storage'

interface Property {
  trait: string
  value: string
}

export function useNftForm() {
  const { mintNft, userCollection } = useNftPallets()
  const { isLoading, status } = useTransactionModal()

  // Wallet connection check
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const isWalletConnected = computed(() => Boolean(getConnectedSubAccount.value?.address))

  // Form state
  const state = reactive({
    name: '',
    description: '',
    collection: '',
    blockchain: 'ahp', // Default to Asset Hub Polkadot
    supply: 1,
    autoNumbering: false,
    properties: [{ trait: '', value: '' }] as Property[],
    listDirectly: false,
    price: 0,
  })

  // Blockchains for select
  const blockchains = [
    { label: 'Asset Hub Polkadot', value: 'ahp' },
    { label: 'Asset Hub Kusama', value: 'ahk' },
  ]

  // Fetch user collections dynamically
  const collections = ref<Array<{ label: string, value: string, name: string, description: string, image: string }>>([])
  const collectionsLoading = ref(false)

  // Fetch collections on component mount
  watchEffect(async () => {
    if (!isWalletConnected.value)
      return

    collectionsLoading.value = true
    try {
      const userCollections = await userCollection(state.blockchain as Prefix)
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

  // Currency mapping based on blockchain
  const blockchainCurrencies: Record<string, string> = {
    ahp: 'DOT',
    ahk: 'KSM',
  }

  // Get currency based on selected blockchain
  const selectedCurrency = computed(() => {
    return blockchainCurrencies[state.blockchain] || 'DOT'
  })

  // File upload state
  const mediaFile = ref<File | null>(null)

  // Property management
  function addProperty() {
    state.properties.push({ trait: '', value: '' })
  }

  function removeProperty(index: number) {
    if (state.properties.length > 1) {
      state.properties.splice(index, 1)
    }
  }

  // Custom validation function
  function validate(state: any): FormError[] {
    const errors: FormError[] = []

    if (!state.name?.trim()) {
      errors.push({ name: 'name', message: 'NFT name is required' })
    }

    if (!state.description?.trim()) {
      errors.push({ name: 'description', message: 'Description is required' })
    }

    if (!state.blockchain?.trim()) {
      errors.push({ name: 'blockchain', message: 'Blockchain selection is required' })
    }

    if (!state.collection?.trim()) {
      errors.push({ name: 'collection', message: 'Collection selection is required' })
    }

    if (state.supply < 1) {
      errors.push({ name: 'supply', message: 'Supply must be at least 1' })
    }

    // File validation
    if (!mediaFile.value) {
      errors.push({ name: 'media', message: 'NFT media file is required' })
    }
    else {
      const maxSize = 50 * 1024 * 1024 // 50MB
      if (mediaFile.value.size > maxSize) {
        errors.push({ name: 'media', message: 'Media file size must be less than 50MB' })
      }
    }

    // Properties validation (only if filled)
    state.properties.forEach((prop: Property, index: number) => {
      if (prop.trait.trim() && !prop.value.trim()) {
        errors.push({
          name: `properties.${index}.value`,
          message: `Property ${index + 1}: Value is required when trait is specified`,
        })
      }
      if (!prop.trait.trim() && prop.value.trim()) {
        errors.push({
          name: `properties.${index}.trait`,
          message: `Property ${index + 1}: Trait name is required when value is specified`,
        })
      }
    })

    // Listing validation
    if (state.listDirectly) {
      if (state.price <= 0) {
        errors.push({ name: 'price', message: 'Price must be greater than 0 when listing for sale' })
      }
    }

    return errors
  }

  // Submit handler
  async function onSubmit(event: FormSubmitEvent<typeof state>) {
    try {
      status.value = 'start'

      // eslint-disable-next-line no-console
      console.log('Creating NFT with data:', {
        ...event.data,
        mediaFile: mediaFile.value,
      })

      // Filter out empty properties
      const validProperties = event.data.properties.filter(
        (prop: Property) => prop.trait.trim() && prop.value.trim(),
      )

      // Upload media file to IPFS
      const cidMedia = await pinDirectory([mediaFile.value!])
      const image = `ipfs://${cidMedia}`

      // Prepare NFT metadata
      const metadata: any = {
        name: event.data.name,
        description: event.data.description,
        image,
        // external_url: 'https://example.com', TODO: add external url
      }

      // Add properties as attributes if they exist
      if (validProperties.length > 0) {
        metadata.attributes = validProperties.map((prop: Property) => ({
          trait_type: prop.trait,
          value: prop.value,
        }))
      }

      // Create metadata for each NFT
      const metadataPromises = Array.from({ length: event.data.supply }, async (_, i) => {
        let name = event.data.name

        if (event.data.autoNumbering) {
          name = `${event.data.name} #${i + 1}`
        }
        const nftMetadata = {
          ...metadata,
          name,
        }
        return await pinJson(nftMetadata)
      })

      const cids = await Promise.all(metadataPromises)
      const metadataUris = event.data.supply === 1
        ? `ipfs://${cids[0]}`
        : cids.map(cid => `ipfs://${cid}`)

      await mintNft({
        chain: event.data.blockchain as Prefix,
        collectionId: Number.parseInt(event.data.collection),
        metadataUri: metadataUris,
        supply: event.data.supply,
        properties: validProperties,
        context: {
          name: event.data.name,
          description: event.data.description,
          image,
          supply: event.data.supply,
        },
      })
    }
    catch (error) {
      console.error('Error creating NFT:', error)
    }
  }

  return {
    // State
    state,
    mediaFile,
    blockchains,
    collections,
    collectionsLoading,
    selectedCurrency,
    selectedCollection,
    isWalletConnected,

    // Functions
    validate,
    onSubmit,
    addProperty,
    removeProperty,

    // Status
    isLoading,
  }
}
