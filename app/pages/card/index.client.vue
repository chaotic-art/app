<script setup lang="ts">
import type { NftEntity } from '@/composables/useInfiniteNfts'
import { exploreNfts } from '@/graphql/queries/explore'

definePageMeta({
  title: 'Chaotic Card',
  layout: 'empty',
})

const CHAOTIC_CARD_COLLECTION_ID = '578'

const { setColorMode, currentMode } = useTheme()
const { doAfterLogin } = useDoAfterlogin()
const { shareOnX } = useSocialShare()
const { getConnectedSubAccount } = storeToRefs(useWalletStore())
const { $i18n } = useNuxtApp()
const isLoading = ref(false)
const isSuccessModalOpen = ref(false)

const collectionIdForTesting = ref(window.location.search.includes('test') ? '9999' : CHAOTIC_CARD_COLLECTION_ID)
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

      setTimeout(() => {
        isLoading.value = false
        collectionIdForTesting.value = CHAOTIC_CARD_COLLECTION_ID
        checkExistingCard()
        isSuccessModalOpen.value = true
      }, 3000)
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
