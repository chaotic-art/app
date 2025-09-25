<script setup lang="ts">
import type { NftEntity } from '@/composables/useInfiniteNfts'
import { exploreNfts } from '@/graphql/queries/explore'
import { waitForXRoastGenerationComplete } from '@/services/generate'

definePageMeta({
  title: 'Chaotic Card',
  layout: 'empty',
})

// const CHAOTIC_CARD_COLLECTION_ID = '578'

const { setColorMode, currentMode } = useTheme()
const { doAfterLogin } = useDoAfterlogin()
const { shareOnX } = useSocialShare()
const { getConnectedSubAccount } = storeToRefs(useWalletStore())
const { $i18n } = useNuxtApp()
const isLoading = ref(false)
const isSuccessModalOpen = ref(false)

const urlParams = new URLSearchParams(window.location.search)

const hasXAuthInfo = computed(() => urlParams.get('username') && urlParams.get('profile_image_url') && urlParams.get('magic'))

const collectionIdForTesting = ref('9999')
const existingCard = ref<NftEntity | null>(null)
const isMinted = computed(() => !!existingCard.value)

async function checkExistingCard() {
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
      owner: getss58AddressByPrefix(getConnectedSubAccount.value?.address, 'ahp'),
      collections: [collectionIdForTesting.value],
    },
  })
  existingCard.value = data?.tokenEntities[0] || null
}

function handleClaimClick() {
  doAfterLogin({
    onLoginSuccess: async () => {
      await checkExistingCard()
      if (existingCard.value) {
        return
      }
      isLoading.value = true

      if (!hasXAuthInfo.value) {
        window.open(`https://sign-in-with-x.dotlab.workers.dev/auth/x`, '_self')
        return
      }

      // eslint-disable-next-line no-console
      console.log('X Auth Info:', urlParams)
      const username = urlParams.get('username')!

      const { text } = await waitForXRoastGenerationComplete(username)
      // eslint-disable-next-line no-console
      console.log('text generate result:', text)

      // setTimeout(() => {
      //   isLoading.value = false
      //   collectionIdForTesting.value = CHAOTIC_CARD_COLLECTION_ID
      //   checkExistingCard()
      //   isSuccessModalOpen.value = true
      // }, 3000)
      // TODO: Implement claim functionality
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
  checkExistingCard()
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
