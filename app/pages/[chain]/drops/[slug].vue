<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { useTimeoutFn } from '@vueuse/core'
import { FALLBACK_DROP_COLLECTION_MAX } from '@/components/drops/utils'
import useGenerativeIframeData from '@/composables/drop/useGenerativeIframeData'
import { getDropById } from '~/services/fxart'
import { fetchOdaCollection } from '~/services/oda'

const { slug, chain } = useRoute().params
const { $api } = useNuxtApp()
const chainPrefix = computed(() => chain?.toString() as Prefix)
const { address } = useAccountStore()
const { data: drop } = await useAsyncData(`drop:${slug}`, () => getDropById(slug?.toString() ?? ''))
const collection = ref<Awaited<ReturnType<typeof fetchOdaCollection>> | null>(null)
const { imageDataPayload, imageDataLoaded } = useGenerativeIframeData()
const isCapturingImage = ref(false)
const generativeImageUrl = ref(collection.value?.metadata?.generative_uri)
const items = ref<number[]>([])

const { start: startTimer } = useTimeoutFn(() => {
  // quick fix: ensure that even if the completed event is not received, the loading state of the drop can be cleared
  // only applicable if the drop is missing`kodahash/render/completed` event
  if (!imageDataLoaded.value) {
    isCapturingImage.value = false
  }
}, 5000)

const { decimals, chainSymbol } = useChain()
const { usd: usdPrice, formatted: formattedTokenPrice } = useAmount(computed(() => drop.value?.price), decimals, chainSymbol)

function generateNft() {
  if (!drop.value?.content) {
    return
  }
  isCapturingImage.value = true
  startTimer()

  const previewItem = generatePreviewItem({
    entropyRange: getEntropyRange(drop.value?.max ?? FALLBACK_DROP_COLLECTION_MAX),
    accountId: address ?? '',
    content: drop.value.content,
  })

  generativeImageUrl.value = previewItem.image
  imageDataPayload.value = undefined
}

watch(collection, () => {
  generativeImageUrl.value = collection.value?.metadata?.generative_uri
})

watch(imageDataLoaded, () => {
  if (imageDataLoaded.value) {
    isCapturingImage.value = false
  }
})

onMounted(async () => {
  collection.value = await fetchOdaCollection(chainPrefix.value, drop.value?.collection ?? '')

  if (drop.value?.collection) {
    const api = $api(chainPrefix.value)
    const apiResult = await api.query.Nfts.Item.getEntries(Number(drop.value.collection))
    items.value = apiResult.map(item => item.keyArgs[1]).sort((a, b) => b - a)
  }
})
</script>

<template>
  <UContainer class="max-w-7xl px-4 md:px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <!-- left side -->
      <div>
        <!-- badge section -->
        <div class="flex gap-2 mb-4 justify-center lg:justify-start">
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-heroicons-star">
            Featured
          </UBadge>
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-token-polkadot">
            Polkadot
          </UBadge>
        </div>
        <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center lg:text-left mb-6 lg:mb-0">
          {{ collection?.metadata?.name ?? '---' }}
        </h1>

        <div class="flex flex-col items-start md:flex-row md:items-center gap-4 justify-between my-6 lg:my-10">
          <div v-if="drop?.creator" class="flex flex-col gap-2">
            <p class="text-sm text-gray-500">
              Created By
            </p>
            <div class="flex justify-between items-center gap-1">
              <div class="p-1 bg-gray-100 inline-block rounded-full">
                <UserInfo :avatar-size="40" :address="drop?.creator" />
              </div>

              <FollowButton
                :target="drop.creator"
                class="px-4 py-2 w-full sm:w-auto ml-0"
              />
            </div>
          </div>

          <div v-if="Number(collection?.claimed)" class="flex flex-col gap-2">
            <p class="text-sm text-gray-500">
              Collected By
            </p>

            <DropCollectedBy
              :chain="chainPrefix"
              :collection-id="drop?.collection ?? ''"
              :max-address-count="5"
              size="medium"
            />
          </div>
        </div>

        <!-- description section -->
        <div class="text-sm md:text-base">
          <MarkdownPreview :source="collection?.metadata?.description ?? '---'" />
        </div>
      </div>

      <!-- right side -->
      <div class="order-1 lg:order-2">
        <!-- preview section -->
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100">
          <iframe class="aspect-square w-full" :src="sanitizeIpfsUrl(generativeImageUrl)" frameborder="0" />
          <div class="flex flex-col sm:flex-row gap-2 mt-4 justify-center">
            <UButton class="rounded-full bg-gray-100 dark:bg-gray-800 text-xs md:text-sm cursor-pointer" variant="soft" trailing-icon="i-lucide-refresh-cw" :loading="isCapturingImage" @click="generateNft">
              Preview Variation
            </UButton>
            <UButton class="rounded-full bg-gray-100 dark:bg-gray-800 text-xs md:text-sm" variant="soft" trailing-icon="i-lucide-joystick">
              Controls
            </UButton>
          </div>
        </div>

        <!-- stats section -->
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100 mt-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <p class="font-serif font-bold text-2xl md:text-3xl italic">
                {{ formattedTokenPrice }}
              </p>
              <p class="text-sm text-gray-500">
                {{ usdPrice }} USD
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <UInputNumber
                class="w-full sm:w-24" :min="1" :ui="{
                  base: 'rounded-full px-4 md:px-6 py-2 md:py-3',
                }"
              />
              <UButton class="rounded-full px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto">
                Mint Drop
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <USeparator class="my-12 md:my-20" />

    <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 md:mb-0">
      <p class="text-2xl md:text-3xl font-bold font-serif italic text-center md:text-left">
        Latest NFT Mints
      </p>

      <div class="flex gap-2 md:gap-4">
        <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Newest" variant="outline" />
        <UButton class="rounded-full px-3 md:px-4 py-2 text-sm" label="Buy Now" variant="outline" />
      </div>
    </div>

    <!-- items -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mt-6 md:mt-10">
      <LazyTokenCard v-for="id in items" :key="id" :token-id="id" :collection-id="Number(drop?.collection ?? 0)" :chain="chainPrefix" />
    </div>
  </UContainer>
</template>
