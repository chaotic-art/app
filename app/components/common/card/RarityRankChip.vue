<script setup lang="ts">
import type { NftRarity, RarityTierValue } from '~/types/rarity'
import { RarityTier } from '~/types/rarity'

interface TierStyle {
  chip: string
  text: string
  icon: string
}

const props = defineProps<{
  rarity?: NftRarity | null
}>()

const defaultTierStyle: TierStyle = {
  chip: 'border-slate-300/30 bg-slate-500/10',
  text: 'text-slate-200',
  icon: 'bg-slate-300',
}

const tierStyles: Record<RarityTierValue, TierStyle> = {
  [RarityTier.LEGENDARY]: {
    chip: 'border-amber-400/35 bg-amber-500/12',
    text: 'text-amber-300',
    icon: 'bg-amber-400',
  },
  [RarityTier.EPIC]: {
    chip: 'border-fuchsia-400/35 bg-fuchsia-500/12',
    text: 'text-fuchsia-300',
    icon: 'bg-fuchsia-400',
  },
  [RarityTier.RARE]: {
    chip: 'border-sky-400/35 bg-sky-500/12',
    text: 'text-sky-300',
    icon: 'bg-sky-400',
  },
  [RarityTier.UNCOMMON]: {
    chip: 'border-emerald-400/35 bg-emerald-500/12',
    text: 'text-emerald-300',
    icon: 'bg-emerald-400',
  },
  [RarityTier.COMMON]: {
    chip: 'border-slate-300/30 bg-slate-500/10',
    text: 'text-slate-300',
    icon: 'bg-slate-300',
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

const tooltipText = computed(() => {
  if (!hasRarity.value || topPercent.value === null) {
    return ''
  }

  const rankText = normalizedRarityRank.value.toLocaleString('en-US')

  if (normalizedRarityTotalItems.value) {
    const totalText = normalizedRarityTotalItems.value.toLocaleString('en-US')
    return `Ranked ${rankText} / ${totalText} (Top ${topPercent.value}%)`
  }

  return `Ranked ${rankText} (Top ${topPercent.value}%)`
})

const rankLabel = computed(() => `#${normalizedRarityRank.value.toLocaleString('en-US')}`)

const activeStyle = computed<TierStyle>(() => props.rarity?.rarityTier ? tierStyles[props.rarity.rarityTier] : defaultTierStyle)

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
    :text="tooltipText"
    :content="{ side: 'top', sideOffset: 14, align: 'center' }"
    :ui="tooltipUi"
  >
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
