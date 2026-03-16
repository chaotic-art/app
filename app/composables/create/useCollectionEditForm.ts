import type { FormError, FormSubmitEvent } from '@nuxt/ui'
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OnchainCollection } from '~/services/oda'
import { useQueryClient } from '@tanstack/vue-query'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { refreshOdaCollection } from '~/services/oda'
import { pinDirectory, pinJson } from '~/services/storage'

export function useCollectionEditForm(
  collectionId: Ref<string>,
  collection: Ref<OnchainCollection | null | undefined>,
) {
  const { currentChain } = useChain()
  const { updateCollection, collectionRoyalties } = useNftPallets()
  const { open, onSuccess } = useTransactionModal()
  const queryClient = useQueryClient()

  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const isWalletConnected = computed(() => Boolean(getConnectedSubAccount.value?.address))

  const state = reactive({
    name: '',
    description: '',
    royalties: 0,
  })

  const logoFile = ref<File | null>(null)
  const bannerFile = ref<File | null>(null)

  const currentRoyalty = ref<number | null>(null)
  const isInitialized = ref(false)

  const chain = computed(() => currentChain.value as AssetHubChain)

  watch(
    () => collectionId.value,
    () => {
      isInitialized.value = false
    },
  )

  watch(
    [collection, () => collectionId.value],
    async ([col]) => {
      const c = col as OnchainCollection | null | undefined
      if (!c?.metadata || !collectionId.value || isInitialized.value) {
        return
      }

      state.name = c.metadata.name ?? ''
      state.description = c.metadata.description ?? ''

      try {
        const royalty = await collectionRoyalties(chain.value, Number(collectionId.value))
        currentRoyalty.value = royalty?.amount ?? null
        state.royalties = royalty?.amount ?? 0
      }
      catch {
        state.royalties = 0
        currentRoyalty.value = null
      }

      isInitialized.value = true
    },
    { immediate: true },
  )

  function validate(formState: Partial<unknown>): FormError[] {
    const state = formState as { name: string, description: string, royalties: number }
    const errors: FormError[] = []
    if (!state.name?.trim()) {
      errors.push({ name: 'name', message: 'Collection name is required' })
    }
    if (!state.description?.trim()) {
      errors.push({ name: 'description', message: 'Description is required' })
    }
    if (Number(state.royalties) < 0) {
      errors.push({ name: 'royalties', message: 'Royalties must be 0% or higher' })
    }
    if (Number(state.royalties) > 100) {
      errors.push({ name: 'royalties', message: 'Royalties cannot exceed 100%' })
    }
    if (logoFile.value) {
      const maxLogoSize = 5 * 1024 * 1024
      if (logoFile.value.size > maxLogoSize) {
        errors.push({ name: 'logo', message: 'Logo file size must be less than 5MB' })
      }
      if (!logoFile.value.type.startsWith('image/')) {
        errors.push({ name: 'logo', message: 'Logo must be an image file' })
      }
    }
    if (bannerFile.value) {
      const maxBannerSize = 10 * 1024 * 1024
      if (bannerFile.value.size > maxBannerSize) {
        errors.push({ name: 'banner', message: 'Banner file size must be less than 10MB' })
      }
      if (!bannerFile.value.type.startsWith('image/')) {
        errors.push({ name: 'banner', message: 'Banner must be an image file' })
      }
    }
    return errors
  }

  async function prepareMetadata(): Promise<string> {
    const c = collection.value
    const existingImage = c?.metadata?.image
    const existingBanner = c?.metadata?.banner

    let image: string
    let banner: string | undefined

    const filesToPin: File[] = []
    if (logoFile.value) {
      filesToPin.push(logoFile.value)
    }
    if (bannerFile.value) {
      filesToPin.push(bannerFile.value)
    }

    if (filesToPin.length > 0) {
      const cidImages = await pinDirectory(filesToPin)
      image = logoFile.value
        ? `ipfs://${cidImages}/${logoFile.value.name}`
        : (existingImage ?? '')
      banner = bannerFile.value
        ? `ipfs://${cidImages}/${bannerFile.value.name}`
        : existingBanner
    }
    else {
      image = existingImage ?? ''
      banner = existingBanner
    }

    const metadata: Record<string, string> = {
      name: state.name,
      description: state.description,
      image,
      external_url: 'https://chaotic.art',
    }
    if (banner) {
      metadata.banner = banner
    }

    const cid = await pinJson(metadata)
    return `ipfs://${cid}`
  }

  onSuccess('collection', () => {
    successMessage('Collection updated successfully')
    refreshOdaCollection(chain.value, collectionId.value)
    queryClient.invalidateQueries({ queryKey: ['odaCollection', collectionId] })
  })

  async function onSubmit(_event: FormSubmitEvent<typeof state>) {
    if (!isWalletConnected.value) {
      return
    }

    const id = Number(collectionId.value)
    if (Number.isNaN(id)) {
      return
    }

    try {
      open.value = true
      const metadataUri = await prepareMetadata()
      const royaltyPayload = state.royalties !== (currentRoyalty.value ?? 0) ? state.royalties : undefined

      updateCollection({
        chain: chain.value,
        collectionId: id,
        type: 'submit',
        metadataUri,
        royalty: royaltyPayload,
      })
    }
    catch (err) {
      console.error('Error updating collection:', err)
    }
  }

  return {
    state,
    logoFile,
    bannerFile,
    isWalletConnected,
    isInitialized,
    validate,
    onSubmit,
  }
}
