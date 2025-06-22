<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { formatBalance } from '@polkadot/util'
import { useFullscreen } from '@vueuse/core'
import { fetchMimeType } from '@/services/oda'
import { MediaType, resolveMedia } from '@/utils/gallery/media'

export interface TokenDetail {
  owner: string
  price: string
  metadata: {
    name: string
    description: string
    image: string
    animation_url: string
    mime_type: string
    animation_mime_type: string
  }
}

const CONTAINER_ID = 'nft-img-container'

const { token, chain } = useRoute().params
const [collectionId, tokenId] = token?.toString().split('-') ?? []

const { $api } = useNuxtApp()

const loading = ref(true)
const fullScreenDisabled = ref(false)

const mediaItemRef = ref<HTMLDivElement & { toggleFullscreen: () => void } | null>(null)
const { toggle, isFullscreen, isSupported } = useFullscreen(mediaItemRef)

const tokenDetail = reactive<TokenDetail>({
  owner: '',
  price: '',
  metadata: {
    name: '',
    description: '',
    image: '',
    animation_url: '',
    mime_type: '',
    animation_mime_type: '',
  },
})

const formattedPrice = computed(() => {
  if (!tokenDetail.price)
    return ''

  const pricesString = formatBalance(tokenDetail.price, { decimals: 10, withSi: false })
  let float = Number.parseFloat(pricesString)
  float = float > 1 ? Number(float.toFixed(0)) : Number(float.toFixed(4))

  return `${float} DOT`
})

function toggleMediaFullscreen() {
  if (!isSupported.value || fullScreenDisabled.value) {
    return
  }
  toggle().catch(() => {
    fullScreenDisabled.value = true
  })
}

function toggleFullscreen() {
  const mediaType = resolveMedia(tokenDetail.metadata.animation_mime_type)
  if ([MediaType.VIDEO].includes(mediaType)) {
    mediaItemRef.value?.toggleFullscreen()
  }
  else {
    toggleMediaFullscreen()
  }
}

onMounted(async () => {
  try {
    const api = $api(chain as Prefix)

    const [queryItem, queryMetadata, queryPrice] = await Promise.all([
      api.query.Nfts.Item.getValue(Number(collectionId), Number(tokenId)),
      api.query.Nfts.ItemMetadataOf.getValue(Number(collectionId), Number(tokenId)),
      api.query.Nfts.ItemPriceOf.getValue(Number(collectionId), Number(tokenId)),
    ])

    tokenDetail.owner = queryItem?.owner.toString() ?? ''
    tokenDetail.price = queryPrice?.[0].toString() ?? ''

    if (queryMetadata?.data.asText()) {
      const metadata = await $fetch(sanitizeIpfsUrl(queryMetadata.data.asText())) as {
        name: string
        description: string
        image: string
        animation_url: string
      }

      tokenDetail.metadata.name = metadata.name
      tokenDetail.metadata.description = metadata.description
      tokenDetail.metadata.image = metadata.image
      tokenDetail.metadata.animation_url = metadata.animation_url

      getTokenMimeType()
    }
  }
  catch (error) {
    console.error('Error fetching token data:', error)
  }
  finally {
    loading.value = false
  }
})

async function getTokenMimeType() {
  const metadata = tokenDetail.metadata
  const mimeTypeAnimation = tokenDetail.metadata.animation_url ? await fetchMimeType(tokenDetail.metadata.animation_url) : null
  tokenDetail.metadata.animation_mime_type = mimeTypeAnimation?.mime_type || ''

  const mimeType = metadata.image ? await fetchMimeType(metadata.image) : null
  tokenDetail.metadata.mime_type = mimeType?.mime_type || ''
}
</script>

<template>
  <UContainer class="max-w-7xl px-4 md:px-6">
    <!-- Loading Skeleton -->
    <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <!-- left side skeleton - image -->
      <div class="order-2 lg:order-1">
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100">
          <USkeleton class="aspect-square w-full rounded-xl" />
        </div>
      </div>

      <!-- right side skeleton - details -->
      <div class="order-1 lg:order-2">
        <!-- badge skeleton -->
        <div class="flex gap-2 mb-4 justify-center lg:justify-start">
          <USkeleton class="h-6 w-16 rounded-full" />
          <USkeleton class="h-6 w-20 rounded-full" />
        </div>

        <!-- title skeleton -->
        <USkeleton class="h-12 md:h-16 lg:h-20 w-full mb-6 lg:mb-8" />

        <!-- owner section skeleton -->
        <div class="flex justify-between items-center gap-4 my-6 lg:my-10">
          <div class="flex items-center gap-3">
            <USkeleton class="w-12 h-12 rounded-full" />
            <USkeleton class="h-4 w-32" />
          </div>
          <USkeleton class="h-10 w-24 rounded-full" />
        </div>

        <!-- description skeleton -->
        <div class="text-sm md:text-base mb-6 lg:mb-8 space-y-2">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4" />
          <USkeleton class="h-4 w-1/2" />
        </div>

        <!-- price and actions skeleton -->
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <USkeleton class="h-8 md:h-10 w-32 mb-2" />
              <USkeleton class="h-4 w-20" />
            </div>

            <div class="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <USkeleton class="h-10 w-full sm:w-24 rounded-full" />
              <USkeleton class="h-10 w-full sm:w-24 rounded-full" />
            </div>
          </div>
        </div>

        <!-- token info skeleton -->
        <div class="mt-6 space-y-3">
          <div class="flex justify-between items-center">
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-4 w-16" />
          </div>
          <div class="flex justify-between items-center">
            <USkeleton class="h-4 w-20" />
            <USkeleton class="h-4 w-12" />
          </div>
          <div class="flex justify-between items-center">
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-4 w-20" />
          </div>
        </div>
      </div>
    </div>

    <!-- Actual Content -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <!-- left side - image -->
      <div class="order-2 lg:order-1">
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100">
          <div
            :id="CONTAINER_ID"
            ref="mediaItemRef"
          >
            <iframe
              v-if="tokenDetail.metadata.animation_url"
              :src="sanitizeIpfsUrl(tokenDetail.metadata.animation_url)"
              :alt="tokenDetail.metadata.name"
              class="aspect-square w-full object-cover rounded-xl"
            />
            <img
              v-else
              :src="sanitizeIpfsUrl(tokenDetail.metadata.image)"
              :alt="tokenDetail.metadata.name"
              class="aspect-square w-full object-cover rounded-xl"
            >

            <ButtonConfig
              v-if="isFullscreen"
              :button="{
                label: 'Go Back',
                icon: 'i-heroicons-chevron-left',
                variant: 'ghost',
                classes: 'z-20 fixed top-4 left-4',
                onClick: toggleFullscreen,
              }"
            />
          </div>
        </div>

        <GalleryItemToolBar :nft="tokenDetail" :container-id="CONTAINER_ID" @toggle-fullscreen="toggleFullscreen" />
      </div>

      <!-- right side - details -->
      <div class="order-1 lg:order-2">
        <!-- badge section -->
        <div class="flex gap-2 mb-4 justify-center lg:justify-start">
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-heroicons-star">
            NFT
          </UBadge>
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-token-polkadot">
            Polkadot
          </UBadge>
        </div>

        <!-- title -->
        <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center lg:text-left mb-6 lg:mb-8">
          {{ tokenDetail.metadata.name || '---' }}
        </h1>

        <!-- owner section -->
        <div class="flex justify-between items-center gap-4 my-6 lg:my-10">
          <div class="p-1 bg-gray-100 inline-block rounded-full">
            <UserInfo :avatar-size="40" :address="tokenDetail.owner" />
          </div>

          <FollowButton
            v-if="tokenDetail.owner"
            :target="tokenDetail.owner"
            class="px-4 py-2 w-full sm:w-auto"
          />
        </div>

        <!-- description section -->
        <div class="text-sm md:text-base mb-6 lg:mb-8">
          <p class="text-gray-600">
            {{ tokenDetail.metadata.description || '---' }}
          </p>
        </div>

        <!-- price and actions section -->
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <p class="font-serif font-bold text-2xl md:text-3xl italic">
                {{ formattedPrice || 'Not for sale' }}
              </p>
              <p v-if="formattedPrice" class="text-sm text-gray-500">
                Current Price
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <UButton
                v-if="formattedPrice"
                class="rounded-full px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto"
                color="primary"
              >
                Buy Now
              </UButton>
              <UButton
                class="rounded-full px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto"
                variant="outline"
              >
                Make Offer
              </UButton>
            </div>
          </div>
        </div>

        <!-- token info -->
        <div class="mt-6 space-y-3">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">Collection ID</span>
            <NuxtLink
              :to="`/${chain}/collection/${collectionId}`"
              class="font-medium text-primary-600 hover:text-primary-500 transition-colors cursor-pointer"
            >
              {{ collectionId }}
            </NuxtLink>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">Token ID</span>
            <span class="font-medium">{{ tokenId }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">Chain</span>
            <span class="font-medium capitalize">{{ chain }}</span>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
