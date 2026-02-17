<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { isNsfwNft } from '~/utils/mint'

const props = defineProps<{
  tokenId: number
  collectionId: number
  chain: AssetHubChain
  image?: string | null
  name?: string | null
  price?: string | null
  currentOwner?: string | null
  hideHoverAction?: boolean
  selectionMode?: boolean
  isSelected?: boolean
  studioMode?: boolean
}>()

const emit = defineEmits<{
  select: [tokenId: number, collectionId: number]
  itemClick: [tokenId: number, collectionId: number]
}>()

const {
  token,
  owner,
  collection,
  error,
  mimeType,
  price,
  usdPrice,
  mediaIcon,
  nativePrice,
  isPriceLoading,
} = useToken(props)

const isNsfw = computed(() => isNsfwNft(token.value?.metadata?.attributes))
const isBlurred = ref(true)

function toggleNsfwContent() {
  isBlurred.value = !isBlurred.value
}

const {
  addToActionCart,
  addToShoppingCart,
  buyNow,
  createActionCartItem,
  isItemInActionCart,
  isItemInShoppingCart,
  isItemInCart,
  canBuy,
} = useCartActions({
  tokenId: props.tokenId,
  collectionId: props.collectionId,
  chain: props.chain,
  token,
  collection,
  owner,
  price: computed(() => BigInt(nativePrice.value ?? '0')),
  mimeType: computed(() => mimeType.value || ''),
})

const {
  onAtomicSwapSelect,
  showAtomicSwapAction,
  isItemSelected: isAtomicSwapItemSelected,
} = useAtomicSwapAction({
  tokenId: props.tokenId,
  collectionId: props.collectionId,
  chain: props.chain,
  token,
  collection,
  owner,
})

const actionCartStore = useActionCartStore()
const route = useRoute()
const { isCurrentAccount } = useAuth()
const { artViewFilter } = storeToRefs(usePreferencesStore())

const imageStatus = ref<'card' | 'normal' | 'fallback'>('card')
const dataOwner = computed(() => owner.value || props.currentOwner)

const isProfileRoute = computed(() => route.name?.toString().includes('chain-u-id'))
const isAirdropRoute = computed(() => route.name?.toString().includes('airdrop-select'))
const isCollectionRoute = computed(() => route.name?.toString().includes('chain-collection-collection_id'))
const canAddToActionCart = computed(() => (isProfileRoute.value || isAirdropRoute.value) && dataOwner.value && isCurrentAccount(dataOwner.value) && mimeType.value?.length)

const isArtViewEnabled = computed(() => route.query.art_view?.toString() === 'true' || artViewFilter.value)
const hideMediaInfo = computed(() => isArtViewEnabled.value && isCollectionRoute.value)

watchEffect(() => {
  if (token.value && dataOwner.value && canAddToActionCart.value) {
    actionCartStore.setOwnedItem(createActionCartItem({ token: token.value, owner: dataOwner.value }))
  }
})
</script>

<template>
  <div
    class="relative border rounded-xl overflow-hidden hover:shadow-lg transition-shadow hover-card-effect group"
    :class="{
      'border-blue-500! dark:border-blue-400!': isItemInCart || isAtomicSwapItemSelected || isSelected,
      'border-gray-300 dark:border-neutral-700': !isItemInCart && !isAtomicSwapItemSelected && !isSelected,
      'cursor-pointer': selectionMode,
    }"
    @click="selectionMode ? emit('select', tokenId, collectionId) : (studioMode ? emit('itemClick', tokenId, collectionId) : undefined)"
  >
    <!-- Error State -->
    <template v-if="error">
      <div class="aspect-square bg-red-50 dark:bg-red-900 flex items-center justify-center">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-16 h-16 text-red-400 dark:text-red-300" />
      </div>
      <div class="p-3 md:p-4">
        <p class="text-red-600 dark:text-red-300 text-sm font-medium">
          Failed to load NFT
        </p>
      </div>
    </template>

    <!-- Loaded State -->
    <template v-else>
      <!-- Selection checkbox overlay -->
      <div
        v-if="selectionMode"
        class="absolute top-2 left-2 z-20"
        @click.stop="emit('select', tokenId, collectionId)"
      >
        <UCheckbox :model-value="!!isSelected" />
      </div>

      <component :is="selectionMode || studioMode ? 'div' : 'NuxtLink'" :to="selectionMode || studioMode ? undefined : `/${chain}/gallery/${collectionId}-${tokenId}`" class="block" :class="{ 'pointer-events-none': selectionMode }">
        <!-- NFT Media -->
        <div class="aspect-square bg-gray-200 dark:bg-neutral-800 overflow-hidden relative group/media">
          <video
            v-if="mimeType?.includes('video') && (token?.metadata?.animation_url || token?.metadata?.image)"
            :src="sanitizeIpfsUrl(token?.metadata?.animation_url || token?.metadata?.image)"
            class="w-full h-full object-cover"
            muted
            @error="($event.target as HTMLVideoElement).style.display = 'none'"
          />
          <div
            v-else-if="mimeType?.includes('audio') && (token?.metadata?.animation_url || token?.metadata?.image)"
            class="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-900 relative"
          >
            <UIcon name="i-heroicons-musical-note" class="w-16 h-16 text-gray-700 dark:text-gray-200 mb-4" />
            <audio
              :src="sanitizeIpfsUrl(token?.metadata?.animation_url || token?.metadata?.image)"
              controls
              class="w-4/5 max-w-xs"
              @error="($event.target as HTMLAudioElement).style.display = 'none'"
            />
          </div>

          <!-- Card Image -->
          <!-- 1. Image from cloudflare image delivery -->
          <!-- 2. Image from bucket.chaotic.art ipfs -->
          <!-- 3. Image from collection metadata -->
          <img
            v-else-if="imageStatus === 'card' && (image || token?.metadata?.image)"
            :src="ipfsToCfImageUrl(image || token?.metadata?.image, 'card')"
            :alt="token?.metadata?.name || 'NFT'"
            class="w-full h-full object-contain"
            @error="imageStatus = 'normal'"
          >
          <img
            v-else-if="imageStatus === 'normal' && (image || token?.metadata?.image)"
            :src="sanitizeIpfsUrl(image || token?.metadata?.image)"
            :alt="token?.metadata?.name || 'NFT'"
            class="w-full h-full object-contain"
            @error="imageStatus = 'fallback'"
          >
          <img
            v-else-if="imageStatus === 'fallback' && collection?.metadata?.image"
            :src="sanitizeIpfsUrl(collection?.metadata?.image)"
            :alt="token?.metadata?.name || 'NFT'"
            class="w-full h-full object-contain"
          >

          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-neutral-700"
          >
            <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
          </div>

          <!-- Media type icon overlay -->
          <div
            v-if="mimeType && (token?.metadata?.animation_url || token?.metadata?.image || image)"
            class="absolute top-2 right-2 w-6 h-6 bg-black/70 rounded-full shadow-md flex items-center justify-center"
          >
            <UIcon :name="mediaIcon" class="w-3 h-3 text-white" />
          </div>

          <!-- NSFW Blur Overlay -->
          <div
            v-if="isNsfw && isBlurred"
            class="absolute inset-0 backdrop-blur-[60px] bg-black/50 flex flex-col items-center justify-center text-white z-10"
            @click.prevent.stop="toggleNsfwContent"
          >
            <UIcon name="i-heroicons-eye-slash" class="w-10 h-10 mb-2" />
            <span class="font-bold text-sm mb-1">Explicit content</span>
            <span class="text-center text-xs max-w-[200px] px-4 mb-3">
              Click to view
            </span>
          </div>

          <div v-if="token && !hideHoverAction && (canAddToActionCart || canBuy || showAtomicSwapAction)" class="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-center">
            <UButton
              v-if="showAtomicSwapAction"
              :icon="isAtomicSwapItemSelected ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-check-20-solid'"
              variant="solid"
              @click.prevent.stop="onAtomicSwapSelect"
            >
              {{ isAtomicSwapItemSelected ? 'Remove' : 'Select' }}
            </UButton>
            <UButton
              v-else-if="canAddToActionCart"
              :icon="isItemInActionCart ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-check-20-solid'"
              variant="solid"
              @click.prevent.stop="addToActionCart"
            >
              {{ isItemInActionCart ? 'Remove' : 'Select' }}
            </UButton>
            <div v-else-if="canBuy" class="flex">
              <UButton
                class="rounded-r-none"
                color="primary"
                :label="$t('shoppingCart.buyNow')"
                @click.prevent.stop="buyNow"
              />
              <UButton
                class="rounded-l-none pr-3"
                :icon="isItemInShoppingCart ? 'ic:outline-remove-shopping-cart' : 'ic:outline-shopping-cart'"
                @click.prevent.stop="addToShoppingCart"
              />
            </div>
          </div>
        </div>

        <!-- Card Content -->
        <div v-if="!hideMediaInfo" class="p-3 md:p-4">
          <h3 class="font-bold text-base md:text-lg mb-2 text-gray-900 dark:text-white line-clamp-1" :title="name || token?.metadata?.name || 'Untitled NFT'">
            {{ name || token?.metadata?.name || 'Untitled NFT' }}
          </h3>

          <!-- Price Section -->
          <div class="flex items-center justify-between mt-3">
            <div class="flex flex-col gap-1">
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Price
              </div>
              <div class="text-right">
                <div v-if="isPriceLoading" class="h-5 flex items-center">
                  <USkeleton class="h-4 w-20 rounded" />
                </div>
                <div v-else-if="price" class="flex items-baseline gap-1">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">{{ price }}</span>
                </div>
                <div v-else>
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">No price set</span>
                </div>
              </div>
            </div>

            <!-- USD Price -->
            <div class="flex flex-col items-end gap-1">
              <div class="text-xs text-gray-500 dark:text-gray-400 font-medium">
                USD
              </div>
              <div class="text-right">
                <div v-if="isPriceLoading" class="h-5 flex items-center">
                  <USkeleton class="h-4 w-14 rounded" />
                </div>
                <div v-else-if="price" class="flex items-baseline gap-1">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ usdPrice || '$0.00' }}</span>
                </div>
                <div v-else>
                  <span class="text-xs font-medium text-gray-600 dark:text-gray-300">--</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Owner Section -->
          <div class="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500 dark:text-gray-400 font-medium">Owner</span>
              <UserInfo
                v-if="dataOwner"
                :address="dataOwner || ''"
                :avatar-size="20"
                :transparent-background="true"
                class="p-0!"
              />
              <span v-else class="text-xs text-gray-600 dark:text-gray-300">N/A</span>
            </div>
          </div>
        </div>
      </component>
    </template>
  </div>
</template>
