<script setup lang="ts">
import type { TraitValueRow } from './types'
import { ChartType } from './types'
import { exportTraitsToCsv } from './utils'

interface Props {
  collectionId: string
  collectionName?: string
}

type ViewMode = 'table' | 'charts'

const props = defineProps<Props>()

const { attributesRarityMaps, traitCounts, loading } = useCollectionAttributes({
  collectionId: computed(() => props.collectionId),
})

const viewMode = ref<ViewMode>('table')
const chartType = ref<ChartType>(ChartType.BAR)

const traitOverview = computed<TraitValueRow[]>(() => {
  const rows: TraitValueRow[] = []

  Object.entries(traitCounts.value).forEach(([traitType, values]) => {
    Object.entries(values).forEach(([value, count]) => {
      const rarity = attributesRarityMaps.value[traitType]?.[value] || 0
      rows.push({
        traitType,
        value,
        count,
        rarity,
      })
    })
  })

  return rows.sort((a, b) => a.rarity - b.rarity)
})

const columns = [
  {
    accessorKey: 'value',
    header: 'Value',
  },
  {
    accessorKey: 'count',
    header: 'Count',
  },
  {
    accessorKey: 'rarity',
    header: 'Rarity',
    cell: ({ row }: { row: { original: TraitValueRow } }) => {
      return `${row.original.rarity.toFixed(1)}%`
    },
  },
]

const groupedTraits = computed(() => {
  const groups = new Map<string, TraitValueRow[]>()

  traitOverview.value.forEach((trait) => {
    if (!groups.has(trait.traitType)) {
      groups.set(trait.traitType, [])
    }
    groups.get(trait.traitType)!.push(trait)
  })

  groups.forEach((traits) => {
    traits.sort((a, b) => a.rarity - b.rarity)
  })

  return groups
})

const viewModeItems = [
  {
    label: 'Table',
    icon: 'i-heroicons-table-cells',
    value: 'table' as ViewMode,
  },
  {
    label: 'Charts',
    icon: 'i-heroicons-chart-bar',
    value: 'charts' as ViewMode,
  },
]

const chartTypeItems = [
  {
    label: 'Bar Chart',
    icon: 'i-heroicons-chart-bar',
    value: ChartType.BAR,
  },
  {
    label: 'Doughnut Chart',
    icon: 'i-heroicons-chart-pie',
    value: ChartType.DOUGHNUT,
  },
]

function exportToCsv() {
  exportTraitsToCsv(groupedTraits.value, props.collectionName)
}
</script>

<template>
  <div class="space-y-6">
    <div v-if="loading" class="flex justify-center items-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-muted-foreground" />
    </div>

    <div v-else-if="groupedTraits.size === 0" class="flex flex-col items-center justify-center py-12 text-center">
      <UIcon name="i-heroicons-cube-transparent" class="w-16 h-16 text-muted-foreground mb-4" />
      <p class="text-lg font-medium text-foreground">
        No Traits Available
      </p>
      <p class="text-sm text-muted-foreground mt-2">
        This collection doesn't have any trait data yet.
      </p>
    </div>

    <div v-else class="space-y-6">
      <!-- Summary Cards and Controls -->
      <div class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-background border border-border rounded-xl p-6">
            <div class="text-sm text-muted-foreground mb-1">
              Total Traits
            </div>
            <div class="text-3xl font-bold">
              {{ groupedTraits.size }}
            </div>
          </div>

          <div class="bg-background border border-border rounded-xl p-6">
            <div class="text-sm text-muted-foreground mb-1">
              Total Values
            </div>
            <div class="text-3xl font-bold">
              {{ traitOverview.length }}
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-background border border-border rounded-xl">
          <div class="flex flex-wrap items-center justify-between gap-2 w-full">
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-sm font-medium text-muted-foreground">View Mode:</span>
              <div class="flex items-center gap-2">
                <UButton
                  v-for="item in viewModeItems"
                  :key="item.value"
                  :icon="item.icon"
                  :variant="viewMode === item.value ? 'solid' : 'outline'"
                  @click="viewMode = item.value"
                >
                  {{ item.label }}
                </UButton>
              </div>
            </div>
            <UButton
              icon="i-heroicons-arrow-down-tray"
              variant="outline"
              @click="exportToCsv"
            >
              Export to CSV
            </UButton>
          </div>

          <div v-if="viewMode === 'charts'" class="flex items-center gap-2">
            <span class="text-sm font-medium text-muted-foreground">Chart Type:</span>
            <div class="flex items-center gap-2">
              <UButton
                v-for="item in chartTypeItems"
                :key="item.value"
                :icon="item.icon"
                :variant="chartType === item.value ? 'solid' : 'outline'"
                @click="chartType = item.value"
              >
                {{ item.label }}
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="space-y-8">
        <div
          v-for="[traitType, traits] in groupedTraits"
          :key="traitType"
          class="space-y-4"
        >
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ traitType }}
            </h3>
            <span class="text-sm text-muted-foreground">
              {{ traits.length }} {{ traits.length === 1 ? 'value' : 'values' }}
            </span>
          </div>

          <div class="bg-background rounded-xl border border-border overflow-hidden">
            <UTable
              :data="traits"
              :columns="columns"
              class="w-full max-h-[400px]"
              sticky
            />
          </div>
        </div>
      </div>

      <!-- Charts View -->
      <div v-else class="space-y-8">
        <div
          v-for="[traitType, traits] in groupedTraits"
          :key="traitType"
          class="space-y-4"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold">
                {{ traitType }}
              </h3>
              <p class="text-sm text-muted-foreground mt-1">
                {{ traits.length }} {{ traits.length === 1 ? 'value' : 'values' }}
              </p>
            </div>
          </div>

          <div class="bg-background rounded-xl border border-border p-6">
            <ClientOnly>
              <TraitDistributionChart
                :trait-type="traitType"
                :traits="traits"
                :chart-type="chartType"
              />
              <template #fallback>
                <div class="flex items-center justify-center h-[400px] text-muted-foreground">
                  <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
                </div>
              </template>
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
