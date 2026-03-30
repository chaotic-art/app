<script setup lang="ts">
import type { AssetHubChain } from '~/types/chain'
import { fetchOdaCollection } from '~/services/oda'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

type ActionVariant = 'link' | 'studio-mode'

interface Props {
  item: ReturnType<typeof useInfiniteCollections>['collections']['value'][number]
  chain?: AssetHubChain
  volume?: string
  actionVariant?: ActionVariant
}

const props = withDefaults(defineProps<Props>(), {
  chain: 'ahp',
  volume: '',
  actionVariant: 'link',
})

const collectionData = reactive({
  items: 0,
  floor: 0,
  uniqueOwners: 0,
})

const imageStatus = ref<'normal' | 'placeholder'>('normal')

const isPlaceholder = computed(() => imageStatus.value === 'placeholder' || !props.item.image)

onMounted(async () => {
  const collection = await fetchOdaCollection(props.chain, props.item.id)
  collectionData.floor = collection.floor ?? 0
  collectionData.items = Number(collection.claimed)
  collectionData.uniqueOwners = collection.uniqueOwnersCount ?? 0
})
</script>

<template>
  <article
    class="group relative rounded-xl shadow-xs hover:shadow-sm border border-border overflow-hidden transition-all duration-300 hover:-translate-y-1"
  >
    <NuxtLink
      v-if="actionVariant === 'link'"
      :to="`/${chain}/collection/${item.id}`"
      class="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
    >
      <!-- Hero Banner Section -->
      <div class="relative h-48 bg-gradient-to-br from-gray-100 dark:from-neutral-800 to-gray-200 dark:to-neutral-900 overflow-hidden">
        <!-- Banner Background Image -->
        <div class="absolute inset-0">
          <img
            v-if="item.image && !isPlaceholder"
            :src="sanitizeIpfsUrl(item.image)"
            :alt="`${item.name} collection banner`"
            class="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            @error="imageStatus = 'placeholder'"
          >
          <img v-else-if="isPlaceholder" src="/placeholder.jpg" alt="placeholder" class="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105">
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        </div>

        <!-- Collection Thumbnail & Title Overlay -->
        <div class="absolute inset-0 p-4 flex flex-col justify-end">
          <div class="flex items-end space-x-4">
            <!-- Collection Thumbnail -->
            <div class="flex-shrink-0 w-16 h-16 rounded-xl bg-white dark:bg-neutral-800 shadow-lg p-1 border-2 border-white/20">
              <img
                v-if="item.image && !isPlaceholder"
                :src="sanitizeIpfsUrl(item.image)"
                :alt="`${item.name} collection`"
                class="w-full h-full rounded-lg object-cover"
                loading="lazy"
                @error="imageStatus = 'placeholder'"
              >
              <img v-else-if="isPlaceholder" src="/placeholder.jpg" alt="placeholder" class="w-full h-full rounded-lg object-cover">
              <div
                v-else
                class="w-full h-full rounded-lg bg-gradient-to-br from-gray-100 dark:from-neutral-700 to-gray-200 dark:to-neutral-800 flex items-center justify-center"
              >
                <UIcon
                  name="i-heroicons-photo"
                  class="w-6 h-6 text-gray-400"
                />
              </div>
            </div>

            <!-- Collection Title -->
            <div class="flex-1 min-w-0 pb-1">
              <h3 class="font-bold text-lg text-white leading-tight line-clamp-3 drop-shadow-lg">
                {{ item.name }}
              </h3>

              <p class="text-sm text-white/80 mt-1 truncate">
                Collection #{{ item.id }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="p-4">
        <!-- Stats Data -->
        <div class="grid grid-cols-3 gap-4">
          <!-- Volume or Items -->
          <div class="text-center">
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {{ volume ? 'Volume' : 'Items' }}
            </div>
            <div class="text-sm font-bold text-gray-900 dark:text-white">
              <Money v-if="volume" :value="volume" :round="0" inline />
              <span v-else>{{ collectionData.items || '0' }}</span>
            </div>
          </div>

          <!-- Floor Price -->
          <div class="text-center">
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Floor
            </div>
            <div class="text-sm font-bold text-gray-900 dark:text-white">
              <Money v-if="collectionData.floor" :value="collectionData.floor" :round="2" inline class="truncate" />
              <span v-else class="text-gray-400 dark:text-gray-500">–</span>
            </div>
          </div>

          <!-- Owners -->
          <div class="text-center">
            <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              Owners
            </div>
            <div class="text-sm font-bold text-gray-900 dark:text-white">
              {{ collectionData.uniqueOwners || '–' }}
            </div>
          </div>
        </div>
      </div>
    </NuxtLink>
    <template v-else>
      <div class="block rounded-xl">
        <div class="relative h-48 bg-linear-to-br from-gray-100 dark:from-neutral-800 to-gray-200 dark:to-neutral-900 overflow-hidden">
          <div class="absolute inset-0">
            <img
              v-if="item.image && !isPlaceholder"
              :src="sanitizeIpfsUrl(item.image)"
              :alt="`${item.name} collection banner`"
              class="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              @error="imageStatus = 'placeholder'"
            >
            <img v-else-if="isPlaceholder" src="/placeholder.jpg" alt="placeholder" class="w-full h-full object-cover opacity-80 transition-transform duration-300 group-hover:scale-105">
            <div class="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
          </div>
          <div class="absolute inset-0 p-4 flex flex-col justify-end">
            <div class="flex items-end space-x-4">
              <div class="shrink-0 w-16 h-16 rounded-xl bg-white dark:bg-neutral-800 shadow-lg p-1 border-2 border-white/20">
                <img
                  v-if="item.image && !isPlaceholder"
                  :src="sanitizeIpfsUrl(item.image)"
                  :alt="`${item.name} collection`"
                  class="w-full h-full rounded-lg object-cover"
                  loading="lazy"
                  @error="imageStatus = 'placeholder'"
                >
                <img v-else-if="isPlaceholder" src="/placeholder.jpg" alt="placeholder" class="w-full h-full rounded-lg object-cover">
                <div
                  v-else
                  class="w-full h-full rounded-lg bg-linear-to-br from-gray-100 dark:from-neutral-700 to-gray-200 dark:to-neutral-800 flex items-center justify-center"
                >
                  <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
                </div>
              </div>
              <div class="flex-1 min-w-0 pb-1">
                <h3 class="font-bold text-lg text-white leading-tight line-clamp-3 drop-shadow-lg">
                  {{ item.name }}
                </h3>
                <p class="text-sm text-white/80 mt-1 truncate">
                  Collection #{{ item.id }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="p-4">
          <div class="grid grid-cols-3 gap-4">
            <div class="text-center">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                {{ volume ? 'Volume' : 'Items' }}
              </div>
              <div class="text-sm font-bold text-gray-900 dark:text-white">
                <Money v-if="volume" :value="volume" :round="0" inline />
                <span v-else>{{ collectionData.items || '0' }}</span>
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Floor
              </div>
              <div class="text-sm font-bold text-gray-900 dark:text-white">
                <Money v-if="collectionData.floor" :value="collectionData.floor" :round="2" inline class="truncate" />
                <span v-else class="text-gray-400 dark:text-gray-500">–</span>
              </div>
            </div>
            <div class="text-center">
              <div class="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                Owners
              </div>
              <div class="text-sm font-bold text-gray-900 dark:text-white">
                {{ collectionData.uniqueOwners || '–' }}
              </div>
            </div>
          </div>
        </div>
        <div class="px-4 pb-4 flex gap-3">
          <UButton
            :to="`/${chain}/collection/${item.id}`"
            variant="outline"
            color="neutral"
            class="flex-1 border border-border"
          >
            View
          </UButton>
          <UButton
            :to="`/${chain}/studio/${item.id}`"
            color="neutral"
            class="flex-1"
          >
            Manage
          </UButton>
        </div>
      </div>
    </template>
  </article>
</template>
