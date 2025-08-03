import type { Prefix } from '@kodadot1/static'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { formatBalance } from 'dedot/utils'
import SignConfirmationModal from '~/components/common/modal/SignConfirmationModal.vue'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { pinDirectory, pinJson } from '~/services/storage'

export function useCollectionForm() {
  const { createCollection, userBalance } = useNftPallets()
  const { status } = useTransactionModal()

  // Programmatic modal setup
  const overlay = useOverlay()
  const modalConfirmation = overlay.create(SignConfirmationModal)

  // Wallet connection check
  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const isWalletConnected = computed(() => Boolean(getConnectedSubAccount.value?.address))

  // Form state
  const state = reactive({
    name: '',
    description: '',
    blockchain: 'ahp', // Default to Asset Hub Polkadot
    royalties: 0,
    maxNfts: 'unlimited' as 'unlimited' | 'limited',
    maxNftsNumber: 1000,
  })

  // Blockchains for select
  const blockchains = [
    { label: 'Asset Hub Polkadot', value: 'ahp' },
    { label: 'Asset Hub Kusama', value: 'ahk' },
  ]

  // File upload states
  const logoFile = ref<File | null>(null)
  const bannerFile = ref<File | null>(null)

  // Fee estimation state
  const estimatedFee = ref<bigint | null>(null)
  const isEstimatingFee = ref(false)
  const balance = ref(0n)

  // Currency mapping based on blockchain
  const blockchainCurrencies: Record<string, string> = {
    ahp: 'DOT',
    ahk: 'KSM',
  }

  // Get currency based on selected blockchain
  const selectedCurrency = computed(() => {
    return blockchainCurrencies[state.blockchain] || 'DOT'
  })

  // Fetch user balance on component mount
  watchEffect(async () => {
    if (!isWalletConnected.value)
      return

    try {
      balance.value = await userBalance(state.blockchain as Prefix)
    }
    catch (error) {
      console.error('Error fetching balance:', error)
      balance.value = 0n
    }
  })

  // Custom validation function. TODO: use valibot/zod
  function validate(state: any): FormError[] {
    const errors: FormError[] = []

    if (!state.name?.trim()) {
      errors.push({ name: 'name', message: 'Collection name is required' })
    }

    if (!state.description?.trim()) {
      errors.push({ name: 'description', message: 'Description is required' })
    }

    if (!state.blockchain?.trim()) {
      errors.push({ name: 'blockchain', message: 'Blockchain selection is required' })
    }

    if (state.royalties < 0) {
      errors.push({ name: 'royalties', message: 'Royalties must be 0% or higher' })
    }

    if (state.royalties > 100) {
      errors.push({ name: 'royalties', message: 'Royalties cannot exceed 100%' })
    }

    if (state.maxNfts === 'limited' && (!state.maxNftsNumber || state.maxNftsNumber < 1)) {
      errors.push({ name: 'maxNftsNumber', message: 'Maximum NFTs must be at least 1 when limited' })
    }

    // File validation
    if (!logoFile.value) {
      errors.push({ name: 'logo', message: 'Collection logo is required' })
    }
    else {
      const maxLogoSize = 5 * 1024 * 1024 // 5MB
      if (logoFile.value.size > maxLogoSize) {
        errors.push({ name: 'logo', message: 'Logo file size must be less than 5MB' })
      }
      if (!logoFile.value.type.startsWith('image/')) {
        errors.push({ name: 'logo', message: 'Logo must be an image file' })
      }
    }

    if (bannerFile.value) {
      const maxBannerSize = 10 * 1024 * 1024 // 10MB
      if (bannerFile.value.size > maxBannerSize) {
        errors.push({ name: 'banner', message: 'Banner file size must be less than 10MB' })
      }
      if (!bannerFile.value.type.startsWith('image/')) {
        errors.push({ name: 'banner', message: 'Banner must be an image file' })
      }
    }

    return errors
  }

  // Shared function to prepare collection data
  async function prepareCollectionData(formData: typeof state) {
    const filesToPin = [logoFile.value!]
    if (bannerFile.value) {
      filesToPin.push(bannerFile.value)
    }

    const cidImages = await pinDirectory(filesToPin)
    const image = `ipfs://${cidImages}`
    const banner = bannerFile.value ? `ipfs://${cidImages}/${bannerFile.value.name}` : undefined

    const metadata: any = {
      name: formData.name,
      description: formData.description,
      image,
      // external_url: 'https://example.com', TODO: add external url
    }

    if (banner) {
      metadata.banner = banner
    }

    const cid = await pinJson(metadata)
    const metadataUri = `ipfs://${cid}`

    return {
      image,
      metadataUri,
      context: {
        name: formData.name,
        description: formData.description,
        image,
      },
    }
  }

  // Combined function to handle both fee estimation and collection creation
  async function handleCollectionOperation(formData: typeof state, type: 'estimate' | 'submit') {
    if (!isWalletConnected.value || !logoFile.value || !formData.name || !formData.description) {
      if (type === 'estimate') {
        estimatedFee.value = null
      }
      return
    }

    if (type === 'estimate') {
      isEstimatingFee.value = true
    }

    try {
      const { metadataUri, context } = await prepareCollectionData(formData)

      const result = await createCollection({
        chain: formData.blockchain as Prefix,
        type,
        maxSupply: formData.maxNfts === 'unlimited' ? undefined : formData.maxNftsNumber,
        metadataUri,
        royalty: formData.royalties,
        context,
      })

      if (type === 'estimate') {
        estimatedFee.value = result || null
      }
    }
    catch (error) {
      console.error(`Error ${type === 'estimate' ? 'estimating fee' : 'creating collection'}:`, error)
      if (type === 'estimate') {
        estimatedFee.value = null
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
    if (estimatedFee.value !== null && balance.value !== null && balance.value < estimatedFee.value) {
      return
    }

    // Get actual wallet data
    const connectedAccount = getConnectedSubAccount.value
    const actualWalletAddress = connectedAccount?.address || ''
    // TODO: select chains
    const selectedChain = event.data.blockchain === 'ahp' ? 'Asset Hub Polkadot' : 'Asset Hub Kusama'
    const selectedCurrency = event.data.blockchain === 'ahp' ? 'DOT' : 'KSM'

    // Open modal programmatically
    try {
      const instance = modalConfirmation.open({
        chain: selectedChain,
        estimatedFee: formatBalance(estimatedFee.value || 0, { decimals: 10, symbol: selectedCurrency }),
        walletAddress: actualWalletAddress,
        walletBalance: formatBalance(balance.value || 0, { decimals: 10, symbol: selectedCurrency }),
        title: 'Create Collection',
        items: [
          {
            name: event.data.name,
            image: logoFile.value ? URL.createObjectURL(logoFile.value) : '',
          },
        ],
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
      status.value = 'start'

      // eslint-disable-next-line no-console
      console.log('Creating collection with data:', {
        ...state,
        logoFile: logoFile.value,
        bannerFile: bannerFile.value,
      })

      await handleCollectionOperation(state, 'submit')
    }
    catch (error) {
      console.error('Error creating collection:', error)
    }
  }

  return {
    // State
    state,
    logoFile,
    bannerFile,
    blockchains,
    selectedCurrency,
    isWalletConnected,
    estimatedFee,
    isEstimatingFee,
    balance,

    // Functions
    validate,
    onSubmit,
    handleCollectionOperation,
  }
}
