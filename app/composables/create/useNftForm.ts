import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { LazyConfirmationModal } from '#components'
import { formatBalance } from 'dedot/utils'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { pinDirectory, pinJson } from '~/services/storage'
import { getChainSpec } from '~/utils/api/substrate'

interface Property {
  trait: string
  value: string
}

export function useNftForm() {
  const { mintNft, userCollection, userBalance } = useNftPallets()
  const { open } = useTransactionModal()

  // Programmatic modal setup
  const overlay = useOverlay()
  const modalConfirmation = overlay.create(LazyConfirmationModal)

  // Wallet connection check
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const isWalletConnected = computed(() => Boolean(getConnectedSubAccount.value?.address))

  // Form state
  const state = reactive({
    name: '',
    description: '',
    collection: '',
    blockchain: 'ahp' as AssetHubChain, // Default to Asset Hub Polkadot
    supply: 1,
    autoNumbering: false,
    properties: [{ trait: '', value: '' }] as Property[],
    listDirectly: false,
    price: 0,
  })

  // Blockchains for select
  const blockchains: { label: string, value: AssetHubChain }[] = [
    { label: 'Asset Hub Polkadot', value: 'ahp' },
    { label: 'Asset Hub Kusama', value: 'ahk' },
    { label: 'Asset Hub Paseo - (testnet)', value: 'ahpas' },
  ]

  // Fetch user collections dynamically
  const collections = ref<Array<{ label: string, value: string, name: string, description: string, image: string }>>([])
  const collectionsLoading = ref(false)

  const balance = reactive({
    userBalance: 0n,
    userBalanceFormatted: '0',
    estimatedFee: 0n,
    estimatedFeeFormatted: '0',
    symbol: 'DOT',
    decimals: 12,
    name: '',
  })
  const isEstimatingFee = ref(false)

  // Fetch collections and user balance on component mount
  watchEffect(async () => {
    if (!isWalletConnected.value)
      return

    collectionsLoading.value = true
    state.collection = ''

    try {
      const { symbol, decimals, name } = await getChainSpec(state.blockchain)
      balance.symbol = symbol
      balance.decimals = decimals
      balance.name = name

      // fetch user balance
      balance.userBalance = await userBalance(state.blockchain)
      balance.userBalanceFormatted = formatBalance(balance.userBalance, { decimals, symbol })

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

  // Shared function to prepare NFT data
  async function prepareNftData(formData: typeof state) {
    // Filter out empty properties
    const validProperties = formData.properties.filter(
      (prop: Property) => prop.trait.trim() && prop.value.trim(),
    )

    // Upload media file to IPFS
    const cidMedia = await pinDirectory([mediaFile.value!])
    const image = `ipfs://${cidMedia}`

    // Prepare NFT metadata
    const metadata: any = {
      name: formData.name,
      description: formData.description,
      image,
      external_url: 'https://chaotic.art',
    }

    // Add properties as attributes if they exist
    if (validProperties.length > 0) {
      metadata.attributes = validProperties.map((prop: Property) => ({
        trait_type: prop.trait,
        value: prop.value,
      }))
    }

    // Create metadata for each NFT
    const metadataPromises = Array.from({ length: formData.supply }, async (_, i) => {
      let name = formData.name

      if (formData.autoNumbering) {
        name = `${formData.name} #${i + 1}`
      }
      const nftMetadata = {
        ...metadata,
        name,
      }
      return await pinJson(nftMetadata)
    })

    const cids = await Promise.all(metadataPromises)
    const metadataUris = formData.supply === 1
      ? `ipfs://${cids[0]}`
      : cids.map(cid => `ipfs://${cid}`)

    return {
      validProperties,
      image,
      metadataUris,
      context: {
        name: formData.name,
        description: formData.description,
        image,
        supply: formData.supply,
      },
    }
  }

  // Combined function to handle both fee estimation and NFT creation
  async function handleNftOperation(formData: typeof state, type: 'estimate' | 'submit') {
    if (!isWalletConnected.value || !mediaFile.value || !formData.collection || !formData.name || !formData.description) {
      if (type === 'estimate') {
        balance.estimatedFee = 0n
        balance.estimatedFeeFormatted = '0'
      }
      return
    }

    if (type === 'estimate') {
      isEstimatingFee.value = true
    }

    try {
      const { validProperties, metadataUris, context } = await prepareNftData(formData)

      const result = await mintNft({
        chain: state.blockchain,
        type,
        collectionId: Number.parseInt(formData.collection),
        metadataUri: metadataUris,
        supply: formData.supply,
        properties: validProperties,
        context,
      })

      if (type === 'estimate') {
        balance.estimatedFee = result || 0n
        balance.estimatedFeeFormatted = formatBalance(result, { decimals: balance.decimals, symbol: balance.symbol })
      }
    }
    catch (error) {
      console.error(`Error ${type === 'estimate' ? 'estimating fee' : 'creating NFT'}:`, error)
      if (type === 'estimate') {
        balance.estimatedFee = 0n
        balance.estimatedFeeFormatted = '0'
      }
    }
    finally {
      if (type === 'estimate') {
        isEstimatingFee.value = false
      }
    }
  }

  // Submit handler with confirmation modal
  async function onSubmit(event: FormSubmitEvent<typeof state>) {
    // Check wallet connection first
    if (!isWalletConnected.value) {
      return
    }

    // Check if user has insufficient funds
    if (balance.estimatedFee !== 0n && balance.userBalance !== 0n && balance.userBalance < balance.estimatedFee) {
      return
    }

    // Get actual wallet data
    const connectedAccount = getConnectedSubAccount.value
    const actualWalletAddress = connectedAccount?.address || ''

    // Open modal programmatically
    try {
      const instance = modalConfirmation.open({
        chain: balance.name,
        estimatedFee: balance.estimatedFeeFormatted,
        walletAddress: actualWalletAddress,
        walletBalance: balance.userBalanceFormatted,
        remainsBalance: formatBalance(balance.userBalance - balance.estimatedFee, { decimals: balance.decimals, symbol: balance.symbol }),
        title: 'Create NFT',
        items: Array.from({ length: event.data.supply }, () => ({
          name: event.data.name,
          image: mediaFile.value ? URL.createObjectURL(mediaFile.value) : '',
        })),
      })

      const confirmed = await instance.result

      if (confirmed) {
        await submitAfterConfirmation()
      }
    }
    catch (error) {
      console.error('Error opening modal:', error)
    }
  }

  // Actual submission after confirmation
  async function submitAfterConfirmation() {
    try {
      open.value = true

      // eslint-disable-next-line no-console
      console.log('Creating NFT with data:', {
        ...state,
        mediaFile: mediaFile.value,
      })

      await handleNftOperation(state, 'submit')
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
    selectedCollection,
    isWalletConnected,
    balance,
    isEstimatingFee,

    // Functions
    validate,
    onSubmit,
    addProperty,
    removeProperty,
    handleNftOperation,
  }
}
