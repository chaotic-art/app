import type { MaybeRefOrGetter } from 'vue'
import type { NftViewMode, NftViewModeScope } from '~/stores/preferences'

export const NFT_GRID_CLASS_BY_MODE: Record<NftViewMode, string> = {
  grid: 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6',
  compact: 'grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-3 md:gap-4',
  art: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6',
}

const NEXT_NFT_VIEW_MODE: Record<NftViewMode, NftViewMode> = {
  grid: 'compact',
  compact: 'art',
  art: 'grid',
}

export function getNextNftViewMode(currentMode: NftViewMode): NftViewMode {
  return NEXT_NFT_VIEW_MODE[currentMode]
}

export function useNftViewMode(scope: MaybeRefOrGetter<NftViewModeScope>) {
  const { nftViewModeByScope } = storeToRefs(usePreferencesStore())

  const viewMode = computed<NftViewMode>({
    get: () => nftViewModeByScope.value[toValue(scope)] ?? 'grid',
    set: (value) => {
      nftViewModeByScope.value[toValue(scope)] = value
    },
  })

  const gridClass = computed(() => NFT_GRID_CLASS_BY_MODE[viewMode.value])

  function setViewMode(mode: NftViewMode) {
    viewMode.value = mode
  }

  function cycleViewMode() {
    viewMode.value = getNextNftViewMode(viewMode.value)
  }

  return {
    viewMode,
    gridClass,
    setViewMode,
    cycleViewMode,
  }
}
