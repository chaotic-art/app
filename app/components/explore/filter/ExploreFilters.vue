<script setup lang="ts">
import { whenever } from '@vueuse/core'
import { amountToNative, calculateTokenFromUsd, calculateUsdFromToken, nativeToAmount } from '~/utils/calculation'

const lastSaleItems = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: 'All', value: 'all' },
] as const

type PriceBy = 'token' | 'usd'

const route = useRoute()
const router = useRouter()
const { chainSymbol, decimals } = useChain()
const { getCurrentTokenValue } = useFiatStore()

const sidebarCollapsed = ref(false)
const priceBy = ref<PriceBy>((route.query.price_by as PriceBy) || 'token')
const min = ref(0)
const max = ref(100)
const priceRange = ref([min.value, max.value])
const belowFloor = ref(route.query.below_floor === 'true')
const lastSale = ref((route.query.last_sale as string) || '')

const tokenDecimals = computed(() => decimals.value ?? 10)
const tokenPrice = computed(() => Number(getCurrentTokenValue(chainSymbol.value as Token)) || 0)
const loading = computed(() => tokenPrice.value === 0)

const priceTabs = computed(() => [
  { label: chainSymbol.value, value: 'token' },
  { label: 'USD', value: 'usd' },
])

function updateQueryParams() {
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

function clearFilters() {
  priceBy.value = 'token'
  priceRange.value = [min.value, max.value]
  belowFloor.value = false
  lastSale.value = ''
  updateQueryParams()
}

function selectLastSale(value: string) {
  lastSale.value = lastSale.value === value ? '' : value
}

whenever(() => Boolean(tokenPrice.value), () => {
  const urlMinPrice = route.query.min_price ? Number(route.query.min_price) : null
  const urlMaxPrice = route.query.max_price ? Number(route.query.max_price) : null

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
</script>

<template>
  <div class="flex gap-6">
    <CollapsibleSidebar v-model="sidebarCollapsed">
      <template #header>
        <div class="flex items-center justify-between p-3 border-b border-border">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-funnel" class="text-lg text-muted-foreground" />
            <span class="font-semibold text-foreground">{{ $t('explore.filters') }}</span>
          </div>
        </div>
      </template>

      <div class="text-muted-foreground text-sm">
        <div class="flex flex-col">
          <PriceRangeSkeleton v-if="loading" />

          <template v-else>
            <div class="flex justify-between items-center mb-4">
              <span>{{ $t('explore.price') }}</span>
              <UTabs v-model="priceBy" :items="priceTabs" size="sm" />
            </div>

            <div class="flex flex-col gap-2 mb-4">
              <USlider v-model="priceRange" :min="min" :max="max" />
              <div class="flex justify-between">
                <span>{{ min }}</span>
                <span>{{ max }}</span>
              </div>
            </div>

            <div class="flex gap-2">
              <UInput v-model.number="priceRange[0]" :ui="{ base: 'pl-12' }" type="number">
                <template #leading>
                  <span>{{ $t('explore.min') }}</span>
                </template>
              </UInput>

              <UInput v-model.number="priceRange[1]" :ui="{ base: 'pl-12' }" type="number">
                <template #leading>
                  <span>{{ $t('explore.max') }}</span>
                </template>
              </UInput>
            </div>
          </template>

          <USeparator class="my-4" />

          <div class="flex justify-between items-center">
            <span>{{ $t('explore.belowFloorPrice') }}</span>
            <USwitch v-model="belowFloor" />
          </div>

          <USeparator class="my-4" />

          <!-- Last Sale -->
          <div class="flex flex-col gap-2">
            <span>{{ $t('explore.lastSale') }}</span>
            <div class="flex gap-2">
              <UButton
                v-for="item in lastSaleItems"
                :key="item.value"
                size="sm"
                class="flex-1"
                :variant="lastSale === item.value ? 'solid' : 'outline'"
                @click="selectLastSale(item.value)"
              >
                {{ item.label }}
              </UButton>
            </div>
          </div>

          <USeparator class="my-4" />

          <div class="flex flex-col gap-2">
            <UButton class="w-full" @click="applyFilters">
              {{ $t('explore.applyFilters') }}
            </UButton>
            <UButton class="w-full" variant="link" @click="clearFilters">
              {{ $t('explore.clearAll') }}
            </UButton>
          </div>
        </div>
      </div>
    </CollapsibleSidebar>

    <div class="flex-1 min-w-0">
      <slot />
    </div>
  </div>
</template>
