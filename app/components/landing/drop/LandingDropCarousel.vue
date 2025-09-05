<script setup lang="ts">
import type { DropItem } from '@/types'
import { getEnrichedDrop, parseCETDate } from '@/components/drop/utils'
import { getDrops } from '@/services/fxart'
import { tokenToUsd } from '@/utils/calculation'
import { chainSpec } from '@/utils/chain'
import { isProduction } from '@/utils/env'
import { formatToNow } from '@/utils/format/time'
import { ipfsToCfImageUrl } from '@/utils/ipfs'

const props = defineProps<{
  drops?: DropItem[]
}>()

const emit = defineEmits<{
  (e: 'click', drop: DropItem): void
}>()

const { prefix } = usePrefix()
const { getChainIcon } = useIcon()

// Fetch top active drops if not provided via props
const { data: fetched } = await useLazyAsyncData(() => (getDrops({
  active: [true],
  chain: [isProduction ? 'ahp' : prefix.value],
  limit: 3,
})), {
  transform: async data => await Promise.all(data.map(getEnrichedDrop)),
})

const items = computed<DropItem[]>(() => {
  if (props.drops?.length) {
    return props.drops
  }
  return (fetched.value || []) as DropItem[]
})

function onSelect(drop: DropItem) {
  emit('click', drop)
}

function usdFor(drop: DropItem) {
  const spec = chainSpec[drop.chain]
  return tokenToUsd(Number(drop.price), spec.tokenDecimals, spec.tokenSymbol)
}

// Constants
const CENTERING_DELAY = 50
const VIEWPORT_CLASS = '.landing-viewport'
const ITEM_CLASS = '.landing-item'

// Template refs
const carouselRoot = ref<HTMLElement | null>(null)

/**
 * Centers the first carousel item in the viewport
 * Used to ensure proper initial positioning
 */
function centerFirstItem(): void {
  const root = carouselRoot.value
  if (!root)
    return

  const viewport = root.querySelector(VIEWPORT_CLASS) as HTMLElement | null
  const firstItem = root.querySelector(ITEM_CLASS) as HTMLElement | null

  if (!viewport || !firstItem)
    return

  try {
    const targetScrollLeft = firstItem.offsetLeft - (viewport.clientWidth - firstItem.clientWidth) / 2
    viewport.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: 'auto',
    })
  }
  catch (error) {
    // Silently fail if DOM manipulation fails
    console.warn('Failed to center carousel item:', error)
  }
}

// Center first item when items are loaded
watch(() => items.value.length, (itemCount: number) => {
  if (!itemCount)
    return

  nextTick(() => {
    // Use RAF for immediate centering, timeout for layout-complete centering
    requestAnimationFrame(centerFirstItem)
    setTimeout(centerFirstItem, CENTERING_DELAY)
  })
}, { immediate: true })
</script>

<template>
  <div ref="carouselRoot" class="w-full">
    <UCarousel
      v-if="items.length"
      v-slot="{ item }: { item: DropItem }"
      :items="items"
      :loop="true"
      arrows
      prev-icon="i-lucide-arrow-left"
      next-icon="i-lucide-arrow-right"
      :ui="{
        root: 'relative',
        viewport: 'landing-viewport overflow-hidden snap-x snap-mandatory scroll-smooth',
        container: 'flex',
        item: 'landing-item flex-none w-full snap-center',
        controls: 'pointer-events-none',
        arrows: 'absolute inset-y-0 -left-6 -right-6 flex items-center justify-between z-10',
        prev: 'pointer-events-auto rounded-full border-[1px] border-border bg-white dark:bg-zinc-900 shadow hover:bg-gray-100 hover:dark:bg-zinc-800 text-foreground w-10 h-10',
        next: 'pointer-events-auto rounded-full border-[1px] border-border bg-white dark:bg-zinc-900 shadow hover:bg-gray-100 hover:dark:bg-zinc-800 text-foreground w-10 h-10',
        dots: '',
        dot: '',
      }"
      class="w-full"
    >
      <div
        class="relative border rounded-[15px] border-border overflow-hidden bg-background mx-4"
        @click="onSelect(item)"
      >
        <!-- Image -->
        <img
          :src="ipfsToCfImageUrl(item.banner)"
          :alt="item.name"
          class="w-full aspect-square object-cover"
        >

        <!-- Content -->
        <div class="p-6 flex flex-col gap-6">
          <!-- Title + Artist + Chain -->
          <div class="flex flex-col gap-4">
            <h3 class="font-serif italic font-medium leading-none text-[32px] text-foreground line-clamp-1">
              {{ item.name }}
            </h3>
            <div class="flex items-center justify-between gap-3">
              <UserInfo
                :address="item.creator"
                :avatar-size="30"
                class="h-10 !bg-background border border-border !p-0 !pr-4"
              />
              <div v-if="item.chain" class="flex items-center gap-1 bg-background rounded-full px-1.5 py-[3px] border border-border">
                <img
                  :src="getChainIcon(item.chain) || ''"
                  :alt="`${chainSpec[item.chain]?.tokenSymbol || item.chain} chain`"
                  class="w-[13px] h-[13px]"
                >
                <span class="text-base">{{ chainSpec[item.chain]?.tokenSymbol }}</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="text-muted-foreground text-base leading-6 min-h-[72px] break-words">
            <MarkdownPreview
              :source="item.collectionDescription || ''"
              class="line-clamp-3 [&_p]:!m-0 [&_p]:inline [&_a]:inline [&_strong]:inline [&_em]:inline [&_code]:inline [&_span]:inline [&_br]:hidden"
            />
          </div>

          <!-- Stats Row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4 text-foreground">
              <div class="text-base">
                {{ item.minted }}/{{ item.max }} {{ $t('drop.minted') }}
              </div>
              <span class="w-1.5 h-1.5 rounded-full bg-border inline-block" />
              <div class="text-base">
                {{ usdFor(item) }} USD
              </div>
            </div>
          </div>

          <!-- Footer Row -->
          <div class="flex items-center justify-between">
            <div class="text-muted-foreground text-base">
              {{ item.start_at ? `Ends in ${formatToNow(parseCETDate(item.start_at), false)}` : 'N/A' }}
            </div>
            <DropMintButton :drop="item" size="sm" />
          </div>
        </div>
      </div>
    </UCarousel>

    <div v-else class="w-full h-[440px] bg-muted dark:bg-neutral-800 animate-pulse rounded-xl" />
  </div>
</template>
