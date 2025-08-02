import type { Prefix } from '@kodadot1/static'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import { Binary } from 'polkadot-api'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { MultiAddress } from '~/descriptors/dist'
import { pinDirectory, pinJson } from '~/services/storage'

export function useCollectionForm() {
  const { createCollection, userBalance } = useNftPallets()
  const { isLoading, status } = useTransactionModal()

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

  // Custom validation function
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
    const image = `ipfs://${cidImages}/${logoFile.value!.name}`
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

  // Fee estimation function
  async function estimateFee() {
    if (!isWalletConnected.value || !logoFile.value || !state.name || !state.description) {
      estimatedFee.value = null
      return
    }

    isEstimatingFee.value = true
    try {
      const { metadataUri, context } = await prepareCollectionData(state)

      const fee = await createCollection({
        chain: state.blockchain as Prefix,
        type: 'estimate',
        maxSupply: state.maxNfts === 'unlimited' ? undefined : state.maxNftsNumber,
        metadataUri,
        royalty: state.royalties,
        context,
      })

      estimatedFee.value = fee || null
    }
    catch (error) {
      console.error('Error estimating fee:', error)
      estimatedFee.value = null
    }
    finally {
      isEstimatingFee.value = false
    }
  }

  // Submit handler
  async function onSubmit(event: FormSubmitEvent<typeof state>) {
    try {
      status.value = 'start'

      // eslint-disable-next-line no-console
      console.log('Creating collection with data:', {
        ...event.data,
        logoFile: logoFile.value,
        bannerFile: bannerFile.value,
      })

      const { metadataUri, context } = await prepareCollectionData(event.data)

      await createCollection({
        chain: event.data.blockchain as Prefix,
        type: 'submit',
        maxSupply: event.data.maxNfts === 'unlimited' ? undefined : event.data.maxNftsNumber,
        metadataUri,
        royalty: event.data.royalties,
        context,
      })
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
    estimateFee,

    // Status
    isLoading,
  }
}
