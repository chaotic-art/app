<script setup lang="ts">
import type { SelectedTrait } from '~/components/trait/types'

const props = defineProps<{
  collectionId: string
}>()

const emit = defineEmits<{
  'update:nft-ids': [nftIds: string[]]
  'update:selected-traits': [selectedTraits: SelectedTrait[]]
}>()

const { attributesRarityMaps, traitCounts, loading: traitsLoading, getNftIdsByTraits } = useCollectionAttributes({
  collectionId: computed(() => props.collectionId),
})

const traitSearchQuery = ref('')
const expandedTraits = ref<Set<string>>(new Set())
const selectedTraits = ref<SelectedTrait[]>([])
const traitsExpanded = ref(false)

const groupedTraits = computed(() => {
  const groups = new Map<string, Array<{ value: string, count: number, rarity: number }>>()

  Object.entries(traitCounts.value).forEach(([traitType, values]) => {
    const traitValues = Object.entries(values)
      .map(([value, count]) => ({
        value,
        count,
        rarity: attributesRarityMaps.value[traitType]?.[value] || 0,
      }))
      .filter((item) => {
        if (!traitSearchQuery.value)
          return true
        return item.value.toLowerCase().includes(traitSearchQuery.value.toLowerCase())
          || traitType.toLowerCase().includes(traitSearchQuery.value.toLowerCase())
      })
      .sort((a, b) => a.count - b.count)

    if (traitValues.length > 0) {
      groups.set(traitType, traitValues)
    }
  })

  return groups
})

const totalSelectedTraitsCount = computed(() => selectedTraits.value.length)

function toggleTrait(traitType: string) {
  if (expandedTraits.value.has(traitType)) {
    expandedTraits.value.delete(traitType)
  }
  else {
    expandedTraits.value.add(traitType)
  }
}

function isTraitExpanded(traitType: string) {
  return expandedTraits.value.has(traitType)
}

function isValueSelected(traitType: string, value: string) {
  return selectedTraits.value.some(
    t => t.traitType === traitType && t.value === value,
  )
}

function toggleValue(traitType: string, value: string) {
  const index = selectedTraits.value.findIndex(
    t => t.traitType === traitType && t.value === value,
  )

  if (index >= 0) {
    selectedTraits.value.splice(index, 1)
  }
  else {
    selectedTraits.value = selectedTraits.value.filter(t => t.traitType !== traitType)
    selectedTraits.value.push({ traitType, value })
  }

  emit('update:selected-traits', selectedTraits.value)
  emit('update:nft-ids', getNftIdsByTraits(selectedTraits.value))
}

function clearTraitFilters() {
  selectedTraits.value = []
  emit('update:nft-ids', [])
  emit('update:selected-traits', [])
}

function clearTraitSearch() {
  traitSearchQuery.value = ''
}
</script>

<template>
  <div class="flex flex-col">
    <button
      class="flex items-center justify-between w-full py-1"
      @click="traitsExpanded = !traitsExpanded"
    >
      <div class="flex items-center gap-2">
        <span>Traits</span>
        <UBadge
          v-if="totalSelectedTraitsCount > 0"
          :label="String(totalSelectedTraitsCount)"
          size="xs"
          class="flex items-center justify-center rounded-full w-4 h-4"
        />
      </div>
      <UIcon
        :name="traitsExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-4 h-4"
      />
    </button>

    <div v-if="traitsExpanded" class="mt-3">
      <div v-if="totalSelectedTraitsCount > 0" class="flex justify-end mb-2">
        <UButton
          size="xs"
          variant="secondary"
          @click="clearTraitFilters"
        >
          Clear traits
        </UButton>
      </div>

      <UInput
        v-model="traitSearchQuery"
        placeholder="Search traits..."
        icon="i-heroicons-magnifying-glass"
        size="sm"
        class="w-full mb-3"
      >
        <template v-if="traitSearchQuery" #trailing>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-heroicons-x-mark"
            @click="clearTraitSearch"
          />
        </template>
      </UInput>

      <div v-if="traitsLoading" class="flex justify-center items-center py-6">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-muted-foreground" />
      </div>

      <div v-else-if="groupedTraits.size > 0" class="max-h-80 overflow-y-auto -mx-1">
        <div
          v-for="[traitType, values] in groupedTraits"
          :key="traitType"
          class="border-b border-border last:border-b-0"
        >
          <button
            class="w-full px-1 py-2 flex items-center justify-between hover:bg-muted transition-colors text-left"
            @click="toggleTrait(traitType)"
          >
            <div class="flex items-center gap-2 flex-1 min-w-0">
              <UIcon
                :name="isTraitExpanded(traitType) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                class="w-3.5 h-3.5 shrink-0"
              />
              <span class="font-medium text-sm truncate">{{ traitType }}</span>
            </div>
            <span class="text-xs text-muted-foreground ml-2 shrink-0">
              {{ values.length }}
            </span>
          </button>

          <div v-if="isTraitExpanded(traitType)" class="bg-muted/30">
            <div class="max-h-48 overflow-y-auto">
              <button
                v-for="item in values"
                :key="item.value"
                class="w-full px-1 py-1.5 flex items-center justify-between hover:bg-muted transition-colors text-left group"
                @click="toggleValue(traitType, item.value)"
              >
                <div class="flex items-center gap-2 flex-1 min-w-0 pl-4">
                  <div
                    class="w-3.5 h-3.5 rounded border-2 shrink-0 flex items-center justify-center transition-colors"
                    :class="isValueSelected(traitType, item.value)
                      ? 'bg-primary border-primary'
                      : 'border-border group-hover:border-primary/50'"
                  >
                    <UIcon
                      v-if="isValueSelected(traitType, item.value)"
                      name="i-heroicons-check"
                      class="w-2.5 h-2.5 text-primary-foreground"
                    />
                  </div>
                  <span class="text-sm truncate">{{ item.value }}</span>
                </div>
                <div class="flex items-center gap-2 ml-2 shrink-0">
                  <span class="text-xs text-muted-foreground">
                    {{ item.count }}
                  </span>
                  <span class="text-xs text-muted-foreground font-mono">
                    {{ item.rarity.toFixed(1) }}%
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center justify-center py-6 text-center">
        <UIcon name="i-heroicons-funnel" class="w-8 h-8 text-muted-foreground mb-2" />
        <p class="text-sm text-muted-foreground">
          {{ traitSearchQuery ? 'No traits found' : 'No traits available' }}
        </p>
      </div>
    </div>
  </div>
</template>
