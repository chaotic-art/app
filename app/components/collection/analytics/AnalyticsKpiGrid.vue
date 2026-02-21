<script setup lang="ts">
import type { AnalyticsKpis, AnalyticsRange } from '~/types/collectionAnalytics'

defineProps<{
  kpis: AnalyticsKpis
  loading: boolean
  range: AnalyticsRange
}>()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
    <template v-if="loading">
      <UCard v-for="index in 5" :key="`kpi-skeleton-${index}`" class="rounded-xl">
        <div class="space-y-2 py-1">
          <USkeleton class="h-3.5 w-24" />
          <USkeleton class="h-7 w-28" />
        </div>
      </UCard>
    </template>

    <template v-else>
      <UCard class="rounded-xl">
        <p class="text-xs text-muted-foreground mb-1.5">
          Current Floor
        </p>
        <div class="text-xl md:text-2xl font-semibold tabular-nums">
          <Money
            v-if="kpis.currentFloor !== null && kpis.currentFloor !== undefined"
            :value="kpis.currentFloor"
            inline
          />
          <span v-else>-</span>
        </div>
      </UCard>

      <UCard class="rounded-xl">
        <p class="text-xs text-muted-foreground mb-1.5">
          Sale Floor ({{ range === 'all' ? 'All' : range }})
        </p>
        <div class="text-xl md:text-2xl font-semibold tabular-nums">
          <Money
            v-if="kpis.saleFloor !== null"
            :value="kpis.saleFloor"
            inline
          />
          <span v-else>-</span>
        </div>
      </UCard>

      <UCard class="rounded-xl">
        <p class="text-xs text-muted-foreground mb-1.5">
          Volume ({{ range === 'all' ? 'All' : range }})
        </p>
        <div class="text-xl md:text-2xl font-semibold tabular-nums">
          <Money :value="kpis.volume" inline />
        </div>
      </UCard>

      <UCard class="rounded-xl">
        <p class="text-xs text-muted-foreground mb-1.5">
          Sales ({{ range === 'all' ? 'All' : range }})
        </p>
        <div class="text-xl md:text-2xl font-semibold tabular-nums">
          {{ kpis.sales }}
        </div>
      </UCard>

      <UCard class="rounded-xl">
        <p class="text-xs text-muted-foreground mb-1.5">
          Owners
        </p>
        <div class="text-xl md:text-2xl font-semibold tabular-nums">
          {{ kpis.owners ?? '-' }}
        </div>
      </UCard>
    </template>
  </div>
</template>
