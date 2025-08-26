<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OdaToken } from '~/services/oda'
import type { ShoppingCartItem } from '~/stores/shoppingCart'
import { useShoppingCartStore } from '~/stores/shoppingCart'

const props = defineProps<{
  tokenId: number
  collectionId: number
  chain: AssetHubChain
  image?: string | null
  name?: string | null
  price?: string | null
  currentOwner?: string | null
}>()

const {
  token,
  owner,
  collection,
  isLoading,
  error,
  mimeType,
  price,
  usdPrice,
  mediaIcon,
  nativePrice,
  canBuy,
} = useToken(props)

const actionCartStore = useActionCartStore()
const route = useRoute()
const { isCurrentAccount } = useAuth()
const shoppingCartStore = useShoppingCartStore()
const { completePurchaseModal } = storeToRefs(usePreferencesStore())
const { itemToBuy } = storeToRefs(shoppingCartStore)

const imageStatus = ref<'normal' | 'fallback'>('normal')
const dataOwner = computed(() => owner.value || props.currentOwner)

const id = computed(() => `${props.collectionId}-${props.tokenId}`)
const isItemInActionCart = computed(() => actionCartStore.isItemInCart(id.value))
const isItemInShoppingCart = computed(() => shoppingCartStore.isItemInCart(id.value))
const isItemInCart = computed(() => isItemInActionCart.value || isItemInShoppingCart.value)

const isProfileRoute = computed(() => route.name?.toString().includes('chain-u-id'))
const canAddToActionCart = computed(() => isProfileRoute.value && dataOwner.value && isCurrentAccount(dataOwner.value))

function createActionCartItem({ token, owner }: { token: OdaToken, owner: string }): BaseActionCartItem {
  return {
    id: id.value,
    sn: props.tokenId,
    name: token.metadata?.name || '',
    chain: props.chain,
    price: Number(nativePrice.value),
    currentOwner: owner,
    metadata: token.metadata!,
    metadata_uri: token.metadata_uri || '',
    collection: {
      id: props.collectionId,
      name: collection.value?.metadata?.name || '',
    },
  }
}

function addToActionCart() {
  if (!token.value || !dataOwner.value) {
    return
  }

  if (isItemInActionCart.value) {
    actionCartStore.removeItem(id.value)
  }
  else {
    actionCartStore.setItem(createActionCartItem({ token: token.value, owner: dataOwner.value }))
  }
}

function createShoppingCartItem({ token, owner }: { token: OdaToken, owner: string }): ShoppingCartItem {
  return {
    id: id.value,
    sn: props.tokenId,
    name: token.metadata?.name || '',
    price: Number(nativePrice.value),
    currentOwner: owner,
    metadata: token.metadata!,
    metadata_uri: token.metadata_uri || '',
    chain: props.chain,
    collection: {
      id: props.collectionId,
      name: collection.value?.metadata?.name || '',
    },
  }
}

function handleAddToShoppingCart() {
  if (!token.value || !owner.value) {
    return
  }

  if (isItemInShoppingCart.value) {
    shoppingCartStore.removeItem(id.value)
  }
  else {
    shoppingCartStore.setItem(createShoppingCartItem({ token: token.value, owner: owner.value }))
  }
}

function handleBuyNow() {
  if (!token.value || !owner.value) {
    return
  }

  itemToBuy.value = createShoppingCartItem({ token: token.value, owner: owner.value })
  completePurchaseModal.value = { open: true, mode: 'buy-now' }
}

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
      '!border-blue-500 dark:!border-blue-400': isItemInCart,
      'border-gray-300 dark:border-neutral-700': !isItemInCart,
    }"
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

          <div v-if="canAddToActionCart || canBuy" class="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex justify-center">
            <UButton
              v-if="canAddToActionCart"
              :icon="isItemInActionCart ? 'i-heroicons-x-mark-20-solid' : 'i-heroicons-check-20-solid'"
              variant="solid"
              color="primary"
              class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-xl border border-white/30 text-gray-900 dark:text-white"
              @click.prevent.stop="addToActionCart"
            >
              {{ isItemInActionCart ? 'Remove' : 'Select' }}
            </UButton>
            <div v-else-if="canBuy" class="flex">
              <UButton
                class="rounded-r-none"
                color="primary"
                :label="$t('shoppingCart.buyNow')"
                @click.prevent.stop="handleBuyNow"
              />
              <UButton
                class="rounded-l-none pr-3"
                :icon="isItemInShoppingCart ? 'ic:outline-remove-shopping-cart' : 'ic:outline-shopping-cart'"
                @click.prevent.stop="handleAddToShoppingCart"
              />
            </div>
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
                <div v-if="isLoading" class="flex items-baseline gap-1">
                  <USkeleton class="h-4 w-16" />
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
                <div v-if="isLoading" class="flex items-baseline gap-1">
                  <USkeleton class="h-4 w-12" />
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
