<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { mintXCard } from '@/services/card'
import { generateMixedImageByFalAi, waitForXRoastGenerationComplete } from '@/services/generate'
import { accountTokenEntries } from '~/utils/api/substrate.nft-pallets'

definePageMeta({
  title: 'Chaotic Card',
  layout: 'empty',
})

const CHAOTIC_CARD_COLLECTION_ID = '625'
const CHAOTIC_CARD_PREFIX = 'ahk'

const { setColorMode, currentMode } = useTheme()
const { doAfterLogin } = useDoAfterlogin()
const { shareOnX } = useSocialShare()
const { getConnectedSubAccount } = storeToRefs(useWalletStore())
const { $i18n } = useNuxtApp()
const isLoading = ref(false)
const isSuccessModalOpen = ref(false)

const urlParams = new URLSearchParams(window.location.search)

const hasXAuthInfo = computed(() => Boolean(urlParams.get('username') && urlParams.get('profile_image_url') && urlParams.get('magic')))

interface ExistingCard {
  id: string
  name: string
  image: string
}
const existingCard = ref<ExistingCard | null>(null)
const mintedCard = ref<ExistingCard | null>(null)
const isMinted = computed(() => !!existingCard.value)

async function fetchOwnedCardNft() {
  const owner = getss58AddressByPrefix(getConnectedSubAccount.value?.address as string, CHAOTIC_CARD_PREFIX)

  const ownedCardNfts = await accountTokenEntries({
    prefix: CHAOTIC_CARD_PREFIX,
    account: owner,
    collectionId: Number(CHAOTIC_CARD_COLLECTION_ID),
  })

  const cardNft = ownedCardNfts[0]
  // eslint-disable-next-line no-console
  console.log('fetching owned card nft:', cardNft)
  return cardNft
    ? {
        id: `${cardNft.keyArgs[1]}-${cardNft.keyArgs[2]}`,
        name: cardNft.metadata?.name || '',
        image: cardNft.metadata?.animation_url || '',
      }
    : null
}

async function fetchExistingCard() {
  if (!getConnectedSubAccount.value?.address) {
    existingCard.value = null
    mintedCard.value = null
    return
  }

  const nft = await fetchOwnedCardNft()

  if (nft) {
    existingCard.value = nft
  }
}

function handleClaimClick() {
  doAfterLogin({
    onLoginSuccess: async () => {
      await fetchExistingCard()
      if (existingCard.value) {
        return
      }
      isLoading.value = true
      try {
        const address = formatAddress ({ address: getConnectedSubAccount.value?.address as string, prefix: CHAOTIC_CARD_PREFIX })

        window.history.replaceState({}, '', window.location.pathname)

        if (!hasXAuthInfo.value) {
          window.open(`https://sign-in-with-x.dotlab.workers.dev/auth/x`, '_self')
          return
        }

        // eslint-disable-next-line no-console
        console.log('X Auth Info:', urlParams)
        const username = urlParams.get('username')!
        const magic = urlParams.get('magic')!
        const profileImageUrl = urlParams.get('profile_image_url')!

        const [textResult, imageResult] = await Promise.all([
          waitForXRoastGenerationComplete(username),
          generateMixedImageByFalAi(profileImageUrl),
        ])

        const imageUrl = imageResult.data.images[0]?.url
        const description = textResult.analysis.lifeMotto?.replace(/\*/g, '')
        if (!imageUrl || !description) {
          throw new Error('Image or description not found')
        }

        // eslint-disable-next-line no-console
        console.log('generate card result:', textResult, imageResult, { description, imageUrl, username, magic, address })
        const mintedResult = await mintXCard({ description, imageUrl, magic, address })

        if (mintedResult?.mintContext) {
          const { metadata, sn, collection } = mintedResult?.mintContext

          const metadataData = await $fetch<{
            name?: string
            description?: string
            image?: string
            animation_url?: string
          }>(sanitizeIpfsUrl(metadata))

          mintedCard.value = {
            id: `${collection}-${sn}`,
            name: metadataData?.name || '',
            image: metadataData?.animation_url || '',
          }

          isSuccessModalOpen.value = true
          pollRequestMintedCard()
        }
      }
      catch (error) {
        console.error('Error:', error)
        errorMessage(`Something went wrong. ERROR: ${(error as Error)?.message}`)
      }
      finally {
        isLoading.value = false
      }
    },
  })
}

function pollRequestMintedCard() {
  setTimeout(() => {
    fetchExistingCard()
    if (existingCard.value) {
      return
    }
    pollRequestMintedCard()
  }, 10000)
}

function handleViewCardClick() {
  if (existingCard.value) {
    window.open(`/${CHAOTIC_CARD_PREFIX}/gallery/${existingCard.value.id}`, '_blank')
  }
}

function handleShareClick() {
  shareOnX($i18n.t('card.mintSuccess', [mintedCard.value?.id || existingCard.value?.id, `${window.location.origin}${window.location.pathname}`]), '', null)
}

// only dark mode for this page
watch(currentMode, () => {
  setColorMode('dark')
}, { immediate: true })

watchDebounced(getConnectedSubAccount, () => {
  fetchExistingCard()
}, { debounce: 1000, maxWait: 5000, immediate: true })

onMounted(() => {
  if (hasXAuthInfo.value) {
    handleClaimClick()
  }
})

onUnmounted(() => {
  setColorMode('system')
})
</script>

<template>
  <div class="min-h-full flex flex-col overflow-hidden bg-black">
    <LazyNavbar />
    <MintCard :minted="isMinted" :preview-url="existingCard?.image" @claim="handleClaimClick" @share="handleShareClick" @view-card="handleViewCardClick" />
    <MintCardLoadingModal v-model:open="isLoading" />
    <MintCardSuccessModal :id="mintedCard?.id || ''" v-model:open="isSuccessModalOpen" :prefix="CHAOTIC_CARD_PREFIX" :is-on-chain="Boolean(existingCard?.id)" :preview-url="mintedCard?.image" :name="mintedCard?.name || ''" @share="handleShareClick" />
    <LazyFooter />
  </div>
</template>
