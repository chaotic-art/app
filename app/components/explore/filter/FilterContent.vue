<script setup lang="ts">
import type { SelectedTrait } from '~/components/trait/types'
import type { RarityTierQueryValue } from '~/utils/nftSearchFilters'
import { formatCompactNumber } from '~/utils/format/balance'
import { RARITY_TIERS } from '~/utils/nftSearchFilters'

const props = defineProps<{
  min: number
  max: number
  loading: boolean
  collectionId?: string
}>()

defineEmits<{
  'applyFilters': []
  'clearFilters': []
  'update:nft-ids': [nftIds: string[]]
  'update:selected-traits': [selectedTraits: SelectedTrait[]]
}>()

const priceBy = defineModel<'token' | 'usd'>('priceBy', { required: true })
const priceRange = defineModel<number[]>('priceRange', { required: true })
const belowFloor = defineModel<boolean>('belowFloor', { required: true })
const lastSale = defineModel<string>('lastSale', { required: true })
const rarityTiers = defineModel<RarityTierQueryValue[]>('rarityTiers', { required: true })

const { chainSymbol } = useChain()
const { t } = useI18n()

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

const formattedMin = computed(() => formatCompactNumber(props.min))
const formattedMax = computed(() => formatCompactNumber(props.max))
const rarityTierItems = computed(() => [
  { value: RARITY_TIERS.LEGENDARY.toLowerCase() as RarityTierQueryValue, label: t('explore.rarityTierLegendary'), range: t('explore.rarityRangeLegendary') },
  { value: RARITY_TIERS.EPIC.toLowerCase() as RarityTierQueryValue, label: t('explore.rarityTierEpic'), range: t('explore.rarityRangeEpic') },
  { value: RARITY_TIERS.RARE.toLowerCase() as RarityTierQueryValue, label: t('explore.rarityTierRare'), range: t('explore.rarityRangeRare') },
  { value: RARITY_TIERS.UNCOMMON.toLowerCase() as RarityTierQueryValue, label: t('explore.rarityTierUncommon'), range: t('explore.rarityRangeUncommon') },
  { value: RARITY_TIERS.COMMON.toLowerCase() as RarityTierQueryValue, label: t('explore.rarityTierCommon'), range: t('explore.rarityRangeCommon') },
])

function selectLastSale(value: string) {
  lastSale.value = lastSale.value === value ? '' : value
}

function toggleRarityTier(value: RarityTierQueryValue) {
  rarityTiers.value = rarityTiers.value.includes(value)
    ? rarityTiers.value.filter(tier => tier !== value)
    : [...rarityTiers.value, value]
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

      <UTooltip text="Coming soon" :content="{ side: 'bottom', align: 'center' }">
        <div class="flex justify-between items-center opacity-60 cursor-not-allowed">
          <span>{{ $t('explore.belowFloorPrice') }}</span>
          <USwitch v-model="belowFloor" disabled />
        </div>
      </UTooltip>

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

      <USeparator class="my-4" />

      <div class="flex flex-col gap-2">
        <span>{{ $t('explore.rarity') }}</span>
        <div class="flex flex-col gap-2">
          <UButton
            v-for="item in rarityTierItems"
            :key="item.value"
            size="sm"
            :variant="rarityTiers.includes(item.value) ? 'solid' : 'outline'"
            class="justify-between"
            @click="toggleRarityTier(item.value)"
          >
            <span>{{ item.label }}</span>
            <span class="text-xs opacity-75">{{ item.range }}</span>
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
