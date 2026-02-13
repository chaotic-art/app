<script setup lang="ts">
import type { SelectedTrait } from '~/components/trait/types'
import { formatCompactNumber } from '~/utils/format/balance'

const props = defineProps<{
  min: number
  max: number
  loading: boolean
  collectionId?: string
}>()

defineEmits<{
  'update:nft-ids': [nftIds: string[]]
  'update:selected-traits': [selectedTraits: SelectedTrait[]]
}>()

const priceBy = defineModel<'token' | 'usd'>('priceBy', { required: true })
const priceRange = defineModel<number[]>('priceRange', { required: true })
const lastSale = defineModel<string>('lastSale', { required: true })
const rarityPercentileRange = defineModel<number[]>('rarityPercentileRange', { required: true })

const { chainSymbol } = useChain()

const lastSaleItems = [
  { label: '24h', value: '24h' },
  { label: '7d', value: '7d' },
  { label: '30d', value: '30d' },
  { label: 'All', value: 'all' },
] as const

const priceTabs = computed(() => [
  { label: chainSymbol.value, value: 'token' },
  { label: 'USD', value: 'usd' },
])

const rarityExpanded = ref(false)

const formattedMin = computed(() => formatCompactNumber(props.min))
const formattedMax = computed(() => formatCompactNumber(props.max))

function selectLastSale(value: string) {
  lastSale.value = lastSale.value === value ? '' : value
}

function clampPercentile(value: number) {
  return Math.min(100, Math.max(0, value))
}

function normalizeRarityRange() {
  const rawMin = rarityPercentileRange.value[0]
  const rawMax = rarityPercentileRange.value[1]
  const nextMin = typeof rawMin === 'number' && Number.isFinite(rawMin) ? clampPercentile(rawMin) : 0
  const nextMax = typeof rawMax === 'number' && Number.isFinite(rawMax) ? clampPercentile(rawMax) : 100

  rarityPercentileRange.value = nextMin <= nextMax
    ? [nextMin, nextMax]
    : [nextMax, nextMin]
}
</script>

<template>
  <div class="text-muted-foreground text-sm">
    <div class="flex flex-col">
      <template v-if="collectionId">
        <FilterTraitSection
          :collection-id="collectionId"
          @update:nft-ids="(ids: string[]) => $emit('update:nft-ids', ids)"
          @update:selected-traits="(traits: SelectedTrait[]) => $emit('update:selected-traits', traits)"
        />

        <USeparator class="my-4" />
      </template>

      <div class="flex flex-col">
        <button
          class="flex items-center justify-between w-full py-1"
          @click="rarityExpanded = !rarityExpanded"
        >
          <span>{{ $t('explore.rarity') }}</span>
          <UIcon
            :name="rarityExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
            class="w-4 h-4"
          />
        </button>

        <div v-if="rarityExpanded" class="mt-3 flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <UInput
              v-model.number="rarityPercentileRange[0]"
              type="number"
              :placeholder="$t('explore.minValue')"
              :min="0"
              :max="100"
              class="flex-1"
              @blur="normalizeRarityRange"
            />
            <span class="font-semibold text-foreground">{{ $t('explore.to') }}</span>
            <UInput
              v-model.number="rarityPercentileRange[1]"
              type="number"
              :placeholder="$t('explore.maxValue')"
              :min="0"
              :max="100"
              class="flex-1"
              @blur="normalizeRarityRange"
            />
          </div>
        </div>
      </div>

      <USeparator class="my-4" />

      <PriceRangeSkeleton v-if="loading" />

      <template v-else>
        <div class="flex justify-between items-center mb-4">
          <span>{{ $t('explore.price') }}</span>
          <UTabs v-model="priceBy" :items="priceTabs" size="sm" />
        </div>

        <div class="flex flex-col gap-2 mb-4">
          <USlider v-model="priceRange" :min="min" :max="max" />
          <div class="flex justify-between text-xs">
            <span>{{ formattedMin }}</span>
            <span>{{ formattedMax }}</span>
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
    </div>
  </div>
</template>
