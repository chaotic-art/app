import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { LazyConfirmationModal } from '#components'
import { formatBalance } from 'dedot/utils'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { pinDirectory, pinJson } from '~/services/storage'
import { getChainSpec } from '~/utils/api/substrate'

// Blockchains for select
export const blockchains: { label: string, value: AssetHubChain }[] = [
  { label: 'Asset Hub Polkadot', value: 'ahp' },
  { label: 'Asset Hub Kusama', value: 'ahk' },
  { label: 'Asset Hub Paseo - (testnet)', value: 'ahpas' },
]

export function useCollectionForm() {
  const { createCollection, userBalance } = useNftPallets()
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
    blockchain: 'ahp' as AssetHubChain, // Default to Asset Hub Polkadot
    royalties: 0,
    maxNfts: 'unlimited' as 'unlimited' | 'limited',
    maxNftsNumber: 1000,
  })

  // File upload states
  const logoFile = ref<File | null>(null)
  const bannerFile = ref<File | null>(null)

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

  // Fetch user balance on component mount
  watchEffect(async () => {
    if (!isWalletConnected.value)
      return

    try {
      const { symbol, decimals, name } = await getChainSpec(state.blockchain)
      balance.symbol = symbol
      balance.decimals = decimals
      balance.name = name

      balance.userBalance = await userBalance(state.blockchain)
      balance.userBalanceFormatted = formatBalance(balance.userBalance, { decimals, symbol })
    }
    catch (error) {
      console.error('Error fetching balance:', error)
      balance.userBalance = 0n
      balance.userBalanceFormatted = '0'
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
    const image = `ipfs://${cidImages}/${logoFile.value?.name}`
    const banner = bannerFile.value ? `ipfs://${cidImages}/${bannerFile.value.name}` : undefined

    const metadata: any = {
      name: formData.name,
      description: formData.description,
      image,
      external_url: 'https://chaotic.art',
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
        balance.estimatedFee = 0n
        balance.estimatedFeeFormatted = '0'
      }
      return
    }

    if (type === 'estimate') {
      isEstimatingFee.value = true
    }

    try {
      const { metadataUri, context } = await prepareCollectionData(formData)

      const result = await createCollection({
        chain: formData.blockchain,
        type,
        maxSupply: formData.maxNfts === 'unlimited' ? undefined : formData.maxNftsNumber,
        metadataUri,
        royalty: formData.royalties,
        context,
      })

      if (type === 'estimate') {
        balance.estimatedFee = result || 0n
        balance.estimatedFeeFormatted = formatBalance(result, { decimals: balance.decimals, symbol: balance.symbol })
      }
    }
    catch (error) {
      console.error(`Error ${type === 'estimate' ? 'estimating fee' : 'creating collection'}:`, error)
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
      open.value = true

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
    isWalletConnected,
    isEstimatingFee,
    balance,

    // Functions
    validate,
    onSubmit,
    handleCollectionOperation,
  }
}
