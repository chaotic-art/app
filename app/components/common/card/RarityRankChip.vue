<script setup lang="ts">
import type { NftRarity, RarityTierValue } from '~/types/rarity'
import { isRarityTier, RarityTier } from '~/types/rarity'

interface TierStyle {
  chip: string
  text: string
  icon: string
}

const props = defineProps<{
  rarity?: NftRarity | null
}>()

const defaultTierStyle: TierStyle = {
  chip: 'border-slate-300 bg-slate-100 dark:border-slate-300/30 dark:bg-slate-500/10',
  text: 'text-slate-700 dark:text-slate-200',
  icon: 'bg-slate-500 dark:bg-slate-300',
}

const tierStyles: Record<RarityTierValue, TierStyle> = {
  [RarityTier.LEGENDARY]: {
    chip: 'border-amber-300 bg-amber-50 dark:border-amber-400/35 dark:bg-amber-500/12',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'bg-amber-500 dark:bg-amber-400',
  },
  [RarityTier.EPIC]: {
    chip: 'border-fuchsia-300 bg-fuchsia-50 dark:border-fuchsia-400/35 dark:bg-fuchsia-500/12',
    text: 'text-fuchsia-700 dark:text-fuchsia-300',
    icon: 'bg-fuchsia-500 dark:bg-fuchsia-400',
  },
  [RarityTier.RARE]: {
    chip: 'border-sky-300 bg-sky-50 dark:border-sky-400/35 dark:bg-sky-500/12',
    text: 'text-sky-700 dark:text-sky-300',
    icon: 'bg-sky-500 dark:bg-sky-400',
  },
  [RarityTier.UNCOMMON]: {
    chip: 'border-emerald-300 bg-emerald-50 dark:border-emerald-400/35 dark:bg-emerald-500/12',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'bg-emerald-500 dark:bg-emerald-400',
  },
  [RarityTier.COMMON]: {
    chip: 'border-slate-300 bg-slate-100 dark:border-slate-300/30 dark:bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-300',
    icon: 'bg-slate-500 dark:bg-slate-300',
  },
}

const hasRarity = computed(() => {
  return Boolean(
    props.rarity
    && typeof props.rarity.rarityRank === 'number'
    && Number.isFinite(props.rarity.rarityRank)
    && props.rarity.rarityRank > 0,
  )
})

const normalizedRarityRank = computed(() => hasRarity.value ? Math.trunc(props.rarity?.rarityRank as number) : 0)
const normalizedRarityTotalItems = computed(() =>
  typeof props.rarity?.rarityTotalItems === 'number' && Number.isFinite(props.rarity.rarityTotalItems) && props.rarity.rarityTotalItems > 0
    ? Math.trunc(props.rarity.rarityTotalItems)
    : null,
)

const topPercent = computed(() => {
  if (!hasRarity.value) {
    return null
  }

  if (normalizedRarityTotalItems.value) {
    return clamp(Math.ceil((normalizedRarityRank.value / normalizedRarityTotalItems.value) * 100), 1, 100)
  }

  const percentile = typeof props.rarity?.rarityPercentile === 'number' && Number.isFinite(props.rarity.rarityPercentile)
    ? props.rarity.rarityPercentile
    : null

  return percentile !== null ? clamp(Math.ceil(percentile), 1, 100) : null
})

const tooltipRankText = computed(() => {
  if (!hasRarity.value) {
    return ''
  }

  const rankText = normalizedRarityRank.value.toLocaleString('en-US')

  if (normalizedRarityTotalItems.value) {
    const totalText = normalizedRarityTotalItems.value.toLocaleString('en-US')
    return `Ranked ${rankText} / ${totalText}`
  }

  return `Ranked ${rankText}`
})

const tooltipTopText = computed(() => topPercent.value !== null ? `(Top ${topPercent.value}%)` : null)

const rankLabel = computed(() => `#${normalizedRarityRank.value.toLocaleString('en-US')}`)

const activeStyle = computed<TierStyle>(() => {
  const tier = props.rarity?.rarityTier
  return isRarityTier(tier) ? tierStyles[tier] : defaultTierStyle
})

const tooltipUi = {
  content: 'h-7 rounded-md px-2.5 py-1 text-sm font-medium shadow-md',
  text: 'tracking-[0.01em]',
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}
</script>

<template>
  <UTooltip
    v-if="hasRarity"
    :content="{ side: 'top', sideOffset: 14, align: 'center' }"
    :ui="tooltipUi"
  >
    <template #content>
      <span class="font-medium text-highlighted">{{ tooltipRankText }}</span>
      <span v-if="tooltipTopText" class="font-medium text-muted">
        {{ tooltipTopText }}
      </span>
    </template>

    <div
      class="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-1.5 py-0.5 shadow-sm transition-colors md:px-2"
      :class="activeStyle.chip"
    >
      <span class="h-2 w-2 shrink-0 rotate-45 rounded-[1px]" :class="activeStyle.icon" />
      <span class="text-sm font-semibold tabular-nums leading-none" :class="activeStyle.text">
        {{ rankLabel }}
      </span>
    </div>
  </UTooltip>
</template>
