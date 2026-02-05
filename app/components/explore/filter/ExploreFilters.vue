<script setup lang="ts">
import { useWindowSize, whenever } from '@vueuse/core'
import { amountToNative, calculateTokenFromUsd, calculateUsdFromToken, nativeToAmount } from '~/utils/calculation'
import { parseQueryNumber } from '~/utils/query'

type PriceBy = 'token' | 'usd'

const REASONABLE_MAX_CAP = 100_000

const route = useRoute()
const router = useRouter()
const { chainSymbol, decimals: tokenDecimals } = useChain()
const { getCurrentTokenValue } = useFiatStore()
const { width } = useWindowSize()

const isModalOpen = defineModel('modalOpen', { type: Boolean, default: false })

const priceBy = ref<PriceBy>((route.query.price_by as PriceBy) || 'token')
const min = ref(0)
const max = ref(REASONABLE_MAX_CAP)
const priceRange = ref([min.value, max.value])
const belowFloor = ref(route.query.below_floor === 'true')
const lastSale = ref((route.query.last_sale as string) || '')
const { exploreSidebarCollapsed: sidebarCollapsed } = storeToRefs(usePreferencesStore())

const isMobile = computed(() => width.value < 768)
const tokenPrice = computed(() => Number(getCurrentTokenValue(chainSymbol.value as Token)) || 0)
const loading = computed(() => tokenPrice.value === 0)

const activeFiltersCount = computed(() => {
  let count = 0
  if (priceRange.value[0] !== min.value || priceRange.value[1] !== max.value) {
    count++
  }
  if (belowFloor.value) {
    count++
  }
  if (lastSale.value) {
    count++
  }
  return count
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
    below_floor: belowFloor.value ? 'true' : undefined,
    last_sale: lastSale.value || undefined,
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
  belowFloor.value = false
  lastSale.value = ''
  updateQueryParams()
}

whenever(() => Boolean(tokenPrice.value), () => {
  const urlMinPrice = parseQueryNumber(route.query.min_price)
  const urlMaxPrice = parseQueryNumber(route.query.max_price)

  if (urlMinPrice !== null) {
    const tokenAmount = nativeToAmount(urlMinPrice, tokenDecimals.value as number)
    priceRange.value[0] = priceBy.value === 'usd'
      ? calculateUsdFromToken(tokenAmount, tokenPrice.value)
      : tokenAmount
  }
  if (urlMaxPrice !== null) {
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
              v-model:below-floor="belowFloor"
              v-model:last-sale="lastSale"
              :min="min"
              :max="max"
              :loading="loading"
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
            <FilterHeader>
              <template #actions>
                <UTooltip :text="$t('explore.hideFilters')">
                  <UButton
                    variant="ghost"
                    icon="i-heroicons-chevron-left"
                    size="sm"
                    @click="sidebarCollapsed = true"
                  />
                </UTooltip>
              </template>
            </FilterHeader>
          </div>

          <div class="p-3 overflow-y-auto max-h-[calc(100vh-300px)]">
            <FilterContent
              v-model:price-by="priceBy"
              v-model:price-range="priceRange"
              v-model:below-floor="belowFloor"
              v-model:last-sale="lastSale"
              :min="min"
              :max="max"
              :loading="loading"
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

    <!-- Floating expand button when desktop sidebar is collapsed -->
    <ClientOnly>
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-x-4 scale-95"
        enter-to-class="opacity-100 translate-x-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-x-0 scale-100"
        leave-to-class="opacity-0 -translate-x-4 scale-95"
      >
        <UTooltip v-if="!isMobile && sidebarCollapsed" :text="$t('explore.showFilters')">
          <UButton
            icon="i-heroicons-chevron-right"
            color="neutral"
            variant="solid"
            size="sm"
            class="fixed left-6 top-72 z-50 w-10! h-10 rounded-full! shadow-md hover:shadow-lg transition-shadow duration-200 md:left-8"
            aria-label="Show filters"
            @click="sidebarCollapsed = false"
          >
            <UBadge v-if="activeFiltersCount > 0" :label="String(activeFiltersCount)" size="xs" class="absolute -top-1 -right-1" />
          </UButton>
        </UTooltip>
      </Transition>
    </ClientOnly>
  </div>
</template>
