<script setup lang="ts">
import type { SelectedTrait } from '~/components/trait/types'
import { useWindowSize, whenever } from '@vueuse/core'
import { countExploreActiveFilters } from '~/composables/useExploreFilterToggleState'
import { amountToNative, calculateTokenFromUsd, calculateUsdFromToken, nativeToAmount } from '~/utils/calculation'
import { parseQueryNumber } from '~/utils/query'

type PriceBy = 'token' | 'usd'

const props = defineProps<{
  collectionId?: string
}>()

const emit = defineEmits<{
  'update:nft-ids': [nftIds: string[]]
  'update:selected-traits': [selectedTraits: SelectedTrait[]]
}>()

const REASONABLE_MAX_CAP = 100_000

const route = useRoute()
const router = useRouter()
const { chainSymbol, decimals: tokenDecimals } = useChain()
const { getCurrentTokenValue } = useFiatStore()
const { width } = useWindowSize()

const isModalOpen = defineModel('modalOpen', { type: Boolean, default: false })

function clampPercentile(value: number) {
  return Math.min(100, Math.max(0, value))
}

function getNormalizedRarityPercentileRange(): [number, number] {
  const rawMin = parseQueryNumber(route.query.min_rarity_percentile)
  const rawMax = parseQueryNumber(route.query.max_rarity_percentile)
  const nextMin = clampPercentile(rawMin ?? 0)
  const nextMax = clampPercentile(rawMax ?? 100)

  return nextMin <= nextMax ? [nextMin, nextMax] : [nextMax, nextMin]
}

const priceBy = ref<PriceBy>((route.query.price_by as PriceBy) || 'token')
const min = ref(0)
const max = ref(REASONABLE_MAX_CAP)
const priceRange = ref<[number, number]>([min.value, max.value])
const lastSale = ref((route.query.last_sale as string) || '')
const rarityPercentileRange = ref<[number, number]>(getNormalizedRarityPercentileRange())
const { exploreSidebarCollapsed: sidebarCollapsed } = storeToRefs(usePreferencesStore())

const isMobile = computed(() => width.value < 768)
const tokenPrice = computed(() => Number(getCurrentTokenValue(chainSymbol.value as Token)) || 0)
const loading = computed(() => tokenPrice.value === 0)

const activeFiltersCount = computed(() => {
  return countExploreActiveFilters({
    hasPriceFilter: priceRange.value[0] !== min.value || priceRange.value[1] !== max.value,
    hasLastSaleFilter: Boolean(lastSale.value),
    hasRarityFilter: rarityPercentileRange.value[0] > 0 || rarityPercentileRange.value[1] < 100,
  })
})

function updateQueryParams() {
  if (priceBy.value === 'usd' && !tokenPrice.value) {
    return
  }

  const minNative = priceBy.value === 'usd'
    ? amountToNative(calculateTokenFromUsd(priceRange.value[0] as number, tokenPrice.value), tokenDecimals.value as number)
    : amountToNative(priceRange.value[0] as number, tokenDecimals.value as number)

  const maxNative = priceBy.value === 'usd'
    ? amountToNative(calculateTokenFromUsd(priceRange.value[1] as number, tokenPrice.value), tokenDecimals.value as number)
    : amountToNative(priceRange.value[1] as number, tokenDecimals.value as number)

  const query: Record<string, string | undefined> = {
    ...route.query,
    price_by: priceBy.value !== 'token' ? priceBy.value : undefined,
    min_price: priceRange.value[0] !== min.value ? String(minNative) : undefined,
    max_price: priceRange.value[1] !== max.value ? String(maxNative) : undefined,
    last_sale: lastSale.value || undefined,
    min_rarity_percentile: rarityPercentileRange.value[0] > 0 ? String(rarityPercentileRange.value[0]) : undefined,
    max_rarity_percentile: rarityPercentileRange.value[1] < 100 ? String(rarityPercentileRange.value[1]) : undefined,
  }

  router.replace({ query })
}

function applyFilters() {
  updateQueryParams()
}

function handleApplyFilters() {
  isModalOpen.value = false
  updateQueryParams()
}

function clearFilters() {
  priceBy.value = 'token'
  priceRange.value = [min.value, max.value]
  lastSale.value = ''
  rarityPercentileRange.value = [0, 100]
  updateQueryParams()
}

whenever(() => Boolean(tokenPrice.value), () => {
  const urlMinPrice = parseQueryNumber(route.query.min_price)
  const urlMaxPrice = parseQueryNumber(route.query.max_price)
  const hasUrlMin = urlMinPrice !== null
  const hasUrlMax = urlMaxPrice !== null

  if (priceBy.value === 'usd') {
    min.value = calculateUsdFromToken(0, tokenPrice.value)
    max.value = calculateUsdFromToken(REASONABLE_MAX_CAP, tokenPrice.value)
  }
  else {
    min.value = 0
    max.value = REASONABLE_MAX_CAP
  }

  if (!hasUrlMin) {
    priceRange.value[0] = min.value
  }
  if (!hasUrlMax) {
    priceRange.value[1] = max.value
  }

  if (hasUrlMin) {
    const tokenAmount = nativeToAmount(urlMinPrice, tokenDecimals.value as number)
    priceRange.value[0] = priceBy.value === 'usd'
      ? calculateUsdFromToken(tokenAmount, tokenPrice.value)
      : tokenAmount
  }
  if (hasUrlMax) {
    const tokenAmount = nativeToAmount(urlMaxPrice, tokenDecimals.value as number)
    priceRange.value[1] = priceBy.value === 'usd'
      ? calculateUsdFromToken(tokenAmount, tokenPrice.value)
      : tokenAmount
  }
}, { once: true, immediate: true })

watch(priceBy, (newPriceBy, oldPriceBy) => {
  if (!tokenPrice.value || newPriceBy === oldPriceBy) {
    return
  }

  const currentMin = priceRange.value[0]
  const currentMax = priceRange.value[1]

  if (typeof currentMin !== 'number' || typeof currentMax !== 'number') {
    return
  }

  if (newPriceBy === 'usd') {
    // Converting from token to USD
    priceRange.value = [
      calculateUsdFromToken(currentMin, tokenPrice.value),
      calculateUsdFromToken(currentMax, tokenPrice.value),
    ]
    min.value = calculateUsdFromToken(0, tokenPrice.value)
    max.value = calculateUsdFromToken(REASONABLE_MAX_CAP, tokenPrice.value)
  }
  else {
    // Converting from USD to token
    priceRange.value = [
      calculateTokenFromUsd(currentMin, tokenPrice.value),
      calculateTokenFromUsd(currentMax, tokenPrice.value),
    ]
    min.value = 0
    max.value = REASONABLE_MAX_CAP
  }
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <ClientOnly>
      <template v-if="isMobile">
        <UButton
          class="w-full"
          variant="outline"
          size="lg"
          @click="isModalOpen = true"
        >
          <template #leading>
            <UIcon name="i-heroicons-funnel" class="text-lg" />
          </template>
          {{ $t('explore.filters') }}
          <template v-if="activeFiltersCount > 0" #trailing>
            <UBadge :label="String(activeFiltersCount)" size="xs" />
          </template>
        </UButton>

        <!-- Mobile -->
        <USlideover v-model:open="isModalOpen" side="left">
          <template #header>
            <FilterHeader class="flex-1">
              <template #actions>
                <UButton
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  size="sm"
                  @click="isModalOpen = false"
                />
              </template>
            </FilterHeader>
          </template>

          <template #body>
            <FilterContent
              v-model:price-by="priceBy"
              v-model:price-range="priceRange"
              v-model:last-sale="lastSale"
              v-model:rarity-percentile-range="rarityPercentileRange"
              :min="min"
              :max="max"
              :loading="loading"
              :collection-id="props.collectionId"
              @update:nft-ids="(ids: string[]) => emit('update:nft-ids', ids)"
              @update:selected-traits="(traits: SelectedTrait[]) => emit('update:selected-traits', traits)"
            />
          </template>

          <template #footer>
            <FilterFooter
              class="flex-1"
              @apply="handleApplyFilters"
              @clear="clearFilters"
            />
          </template>
        </USlideover>
      </template>
    </ClientOnly>

    <div class="flex" :class="{ 'gap-6': !sidebarCollapsed }">
      <!-- Desktop -->
      <ClientOnly>
        <CollapsibleSidebar
          v-if="!isMobile"
          v-model="sidebarCollapsed"
          sticky
        >
          <div class="p-3 border-b border-border">
            <FilterHeader />
          </div>

          <div class="p-3 overflow-y-auto max-h-[calc(100vh-300px)]">
            <FilterContent
              v-model:price-by="priceBy"
              v-model:price-range="priceRange"
              v-model:last-sale="lastSale"
              v-model:rarity-percentile-range="rarityPercentileRange"
              :min="min"
              :max="max"
              :loading="loading"
              :collection-id="props.collectionId"
              @update:nft-ids="(ids: string[]) => emit('update:nft-ids', ids)"
              @update:selected-traits="(traits: SelectedTrait[]) => $emit('update:selected-traits', traits)"
            />
          </div>

          <div class="p-3 border-t border-border">
            <FilterFooter
              @apply="applyFilters"
              @clear="clearFilters"
            />
          </div>
        </CollapsibleSidebar>
      </ClientOnly>

      <div class="flex-1 min-w-0">
        <slot />
      </div>
    </div>
  </div>
</template>
