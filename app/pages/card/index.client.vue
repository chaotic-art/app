<script setup lang="ts">
import type { NftEntity } from '@/composables/useInfiniteNfts'
import { exploreNfts } from '@/graphql/queries/explore'
import { mintXCard } from '@/services/card'
import { generateMixedImageByFalAi, waitForXRoastGenerationComplete } from '@/services/generate'

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

const existingCard = ref<NftEntity | null>(null)
const isMinted = computed(() => !!existingCard.value)

async function fetchExistingCard() {
  if (!getConnectedSubAccount.value?.address) {
    existingCard.value = null
    return
  }
  const { $apolloClient } = useNuxtApp()

  const { data } = await $apolloClient.query({
    query: exploreNfts,
    variables: {
      first: 1,
      offset: 0,
      owner: getss58AddressByPrefix(getConnectedSubAccount.value?.address, CHAOTIC_CARD_PREFIX),
      collections: [CHAOTIC_CARD_COLLECTION_ID],
    },
    context: {
      endpoint: CHAOTIC_CARD_PREFIX,
    },
  })
  existingCard.value = data?.tokenEntities[0] || null
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
        const description = textResult.analysis.description

        if (!imageUrl || !description) {
          throw new Error('Image or description not found')
        }

        // eslint-disable-next-line no-console
        console.log('generate card result:', textResult, imageResult, { description, imageUrl, username, magic, address })
        const mintedResult = await mintXCard({ description, imageUrl, magic, address })

        if (mintedResult?.mintContext) {
          await fetchExistingCard()
          isSuccessModalOpen.value = true
        }
      }
      catch (error) {
        console.error('Error:', error)
        errorMessage(`Something went wrong. Please try again later. ERROR: ${JSON.stringify(error)}`)
      }
      finally {
        isLoading.value = false
      }
    },
  })
}

function handleViewCardClick() {
  if (existingCard.value) {
    window.open(`/ahp/gallery/${existingCard.value.id}`, '_blank')
  }
}

function handleShareClick() {
  shareOnX($i18n.t('card.mintSuccess', [existingCard.value?.id]), window.location.href, null)
}

// only dark mode for this page
watch(currentMode, () => {
  setColorMode('dark')
}, { immediate: true })

watch(getConnectedSubAccount, () => {
  fetchExistingCard()
}, {
  immediate: true,
})

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
    <MintCard :minted="isMinted" @claim="handleClaimClick" @share="handleShareClick" @view-card="handleViewCardClick" />
    <MintCardLoadingModal v-model:open="isLoading" />
    <MintCardSuccessModal :id="existingCard?.id || ''" v-model:open="isSuccessModalOpen" :image-url="sanitizeIpfsUrl(existingCard?.image || '')" :name="existingCard?.name || ''" />
    <LazyFooter />
  </div>
</template>
