<script setup lang="ts">
interface Props {
  collectionId: string
}

interface SelectedTrait {
  traitType: string
  value: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:nft-ids', nftIds: string[]): void
}>()

const { attributesRarityMaps, traitCounts, loading, getNftIdsByTraits } = useCollectionAttributes({
  collectionId: computed(() => props.collectionId),
})

const isOpen = ref(false)
const searchQuery = ref('')
const expandedTraits = ref<Set<string>>(new Set())
const selectedTraits = ref<SelectedTrait[]>([])

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
        // Filter by search query
        if (!searchQuery.value)
          return true
        return item.value.toLowerCase().includes(searchQuery.value.toLowerCase())
          || traitType.toLowerCase().includes(searchQuery.value.toLowerCase())
      })
      .sort((a, b) => a.value.localeCompare(b.value))

    if (traitValues.length > 0) {
      groups.set(traitType, traitValues)
    }
  })

  return groups
})

const totalSelectedCount = computed(() => selectedTraits.value.length)

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
    selectedTraits.value.push({ traitType, value })
  }

  const nftIds = getNftIdsByTraits(selectedTraits.value)

  emit('update:nft-ids', nftIds)
}

function clearFilters() {
  selectedTraits.value = []
  emit('update:nft-ids', [])
}

function clearSearch() {
  searchQuery.value = ''
}
</script>

<template>
  <UPopover v-model:open="isOpen" :popper="{ placement: 'bottom-start' }" :ui="{ content: 'overflow-hidden' }">
    <UButton
      variant="outline"
      color="neutral"
      size="sm"
      icon="i-heroicons-adjustments-horizontal"
    >
      Traits
    </UButton>

    <template #content>
      <div class="w-80 max-h-[600px] flex flex-col bg-background">
        <div class="p-4 border-b border-border sticky top-0 bg-background z-10">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-semibold text-sm">
              Filter by Traits
            </h3>
            <UButton
              v-if="totalSelectedCount > 0"
              size="xs"
              variant="ghost"
              @click="clearFilters"
            >
              Clear all
            </UButton>
          </div>

          <div class="relative">
            <UInput
              v-model="searchQuery"
              placeholder="Search traits..."
              icon="i-heroicons-magnifying-glass"
              size="sm"
              class="w-full"
            >
              <template v-if="searchQuery" #trailing>
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-heroicons-x-mark"
                  @click="clearSearch"
                />
              </template>
            </UInput>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center items-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-muted-foreground" />
        </div>

        <div v-else-if="groupedTraits.size > 0" class="overflow-y-auto flex-1">
          <div
            v-for="[traitType, values] in groupedTraits"
            :key="traitType"
            class="border-b border-border last:border-b-0"
          >
            <button
              class="w-full px-4 py-3 flex items-center justify-between hover:bg-muted transition-colors text-left"
              @click="toggleTrait(traitType)"
            >
              <div class="flex items-center gap-2 flex-1 min-w-0">
                <UIcon
                  :name="isTraitExpanded(traitType) ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right'"
                  class="w-4 h-4 shrink-0"
                />
                <span class="font-medium text-sm truncate">{{ traitType }}</span>
              </div>
              <span class="text-xs text-muted-foreground ml-2 shrink-0">
                {{ values.length }}
              </span>
            </button>

            <div
              v-if="isTraitExpanded(traitType)"
              class="bg-muted/30"
            >
              <div class="max-h-60 overflow-y-auto">
                <button
                  v-for="item in values"
                  :key="item.value"
                  class="w-full px-4 py-2 flex items-center justify-between hover:bg-muted transition-colors text-left group"
                  @click="toggleValue(traitType, item.value)"
                >
                  <div class="flex items-center gap-2 flex-1 min-w-0">
                    <div
                      class="w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors"
                      :class="isValueSelected(traitType, item.value)
                        ? 'bg-primary border-primary'
                        : 'border-border group-hover:border-primary/50'"
                    >
                      <UIcon
                        v-if="isValueSelected(traitType, item.value)"
                        name="i-heroicons-check"
                        class="w-3 h-3 text-primary-foreground"
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

        <div v-else class="flex flex-col items-center justify-center py-8 px-4 text-center">
          <UIcon name="i-heroicons-funnel" class="w-12 h-12 text-muted-foreground mb-2" />
          <p class="text-sm text-muted-foreground">
            {{ searchQuery ? 'No traits found' : 'No traits available' }}
          </p>
        </div>
      </div>
    </template>
  </UPopover>
</template>
