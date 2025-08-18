<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import type { OdaToken } from '~/services/oda'

const props = defineProps<{
  tokenId: number
  collectionId: number
  chain: Prefix
  image?: string | null
  name?: string | null
}>()

const {
  token,
  owner,
  isLoading,
  error,
  mimeType,
  price,
  usdPrice,
  mediaIcon,
  nativePrice,
} = useToken(props)

const actionCartStore = useActionCartStore()
const route = useRoute()
const { isCurrentAccount } = useAuth()

const id = computed(() => `${props.collectionId}-${props.tokenId}`)
const isItemInActionCart = computed(() => actionCartStore.isItemInCart(id.value))
const isItemInCart = computed(() => isItemInActionCart.value)

const isProfileRoute = computed(() => route.name?.toString().includes('chain-u-id'))
const canAddToActionCart = computed(() => isProfileRoute.value && owner.value && isCurrentAccount(owner.value))

function createActionCartItem({ token, owner }: { token: OdaToken, owner: string }): BaseActionCartItem {
  return {
    id: id.value,
    sn: props.tokenId,
    collectionId: props.collectionId,
    name: token.metadata?.name || '',
    chain: props.chain,
    price: Number(nativePrice.value),
    currentOwner: owner,
    metadata: token.metadata!,
    metadata_uri: token.metadata_uri || '',
  }
}

function addToActionCart() {
  if (!token.value || !owner.value) {
    return
  }

  if (isItemInActionCart.value) {
    actionCartStore.removeItem(id.value)
  }
  else {
    actionCartStore.setItem(createActionCartItem({ token: token.value, owner: owner.value }))
  }
}

watchEffect(() => {
  if (token.value && owner.value && canAddToActionCart.value) {
    actionCartStore.setOwnedItem(createActionCartItem({ token: token.value, owner: owner.value }))
  }
})
</script>

<template>
  <div
    class="relative border rounded-xl overflow-hidden hover:shadow-lg transition-shadow hover-card-effect group"
    :class="{
      '!border-blue-500 dark:!border-blue-400': isItemInCart,
      'border-gray-300 dark:border-neutral-700': !isItemInCart,
    }"
  >
    <!-- Loading State -->
    <template v-if="isLoading">
      <!-- Image Skeleton -->
      <div class="aspect-square bg-gray-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center">
        <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
      </div>

      <!-- Content Skeleton -->
      <div class="p-3 md:p-4 space-y-3">
        <!-- Title Skeleton -->
        <div class="h-4 bg-gray-200 dark:bg-neutral-800 rounded animate-pulse w-3/4" />

        <!-- Price Skeleton -->
        <div class="flex items-center justify-between">
          <div class="h-3 bg-gray-100 dark:bg-neutral-700 rounded animate-pulse w-1/3" />
        </div>
      </div>
    </template>

    <!-- Error State -->
    <template v-else-if="error">
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
      <NuxtLink :to="`/${chain}/gallery/${collectionId}-${tokenId}`" class="block">
        <!-- NFT Media -->
        <div class="aspect-square bg-gray-200 dark:bg-neutral-800 overflow-hidden relative">
          <video
            v-if="mimeType?.includes('video') && (token?.metadata?.animation_url || token?.metadata?.image)"
            :src="sanitizeIpfsUrl(token?.metadata?.animation_url || token?.metadata?.image)"
            class="w-full h-full object-cover"
            muted
            @error="($event.target as HTMLVideoElement).style.display = 'none'"
          />
          <div
            v-else-if="mimeType?.includes('audio') && (token?.metadata?.animation_url || token?.metadata?.image)"
            class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-700 dark:to-gray-900 relative"
          >
            <UIcon name="i-heroicons-musical-note" class="w-16 h-16 text-gray-700 dark:text-gray-200 mb-4" />
            <audio
              :src="sanitizeIpfsUrl(token?.metadata?.animation_url || token?.metadata?.image)"
              controls
              class="w-4/5 max-w-xs"
              @error="($event.target as HTMLAudioElement).style.display = 'none'"
            />
          </div>
          <img
            v-else-if="image || token?.metadata?.image"
            :src="sanitizeIpfsUrl(image || token?.metadata?.image)"
            :alt="token?.metadata?.name || 'NFT'"
            class="w-full h-full object-contain"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
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

          <div v-if="canAddToActionCart" class="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-center">
            <UButton
              :icon="isItemInActionCart ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-check-20-solid'"
              size="sm"
              variant="solid"
              color="primary"
              class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border border-white/30 text-gray-900 dark:text-white"
              @click.prevent.stop="addToActionCart"
            >
              {{ isItemInActionCart ? 'Remove' : 'Select' }}
            </UButton>
          </div>
        </div>

        <!-- Card Content -->
        <div class="p-3 md:p-4">
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
                <div v-if="price" class="flex items-baseline gap-1">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">{{ price }}</span>
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
                <div v-if="price" class="flex items-baseline gap-1">
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
                v-if="owner"
                :address="owner"
                :avatar-size="20"
                :transparent-background="true"
                class="!p-0"
              />
              <span v-else class="text-xs text-gray-600 dark:text-gray-300">N/A</span>
            </div>
          </div>
        </div>
      </NuxtLink>
    </template>
  </div>
</template>
