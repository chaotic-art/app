import type { DocumentNode } from 'graphql'
import { useInfiniteScroll } from '@vueuse/core'

interface UseInfiniteQueryOptions<TData, TItem> {
  query: DocumentNode
  pageSize?: number
  distance?: number
  variables?: Record<string, any>
  extractData: (data: TData) => TItem[]
  extractTotal: (data: TData) => number
  placeholderCount?: number
}

export function useInfiniteQuery<TData = any, TItem = any>(options: UseInfiniteQueryOptions<TData, TItem>) {
  const {
    query,
    pageSize = 40,
    distance = 300,
    variables = {},
    extractData,
    extractTotal,
    placeholderCount = 8,
  } = options

  const { $apolloClient } = useNuxtApp()

  // Pagination state
  const currentOffset = ref(0)
  const hasMoreData = ref(true)
  const totalCount = ref(0)
  const isInitialLoading = ref(true)

  // Store all loaded data
  const allItems: Ref<TItem[]> = ref([])

  // Mock data for placeholder cards
  const placeholderItems = Array.from({ length: placeholderCount }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    image: '',
    isPlaceholder: true as const,
  }))

  // Computed property to determine if we should show placeholder or real data
  const displayItems = computed(() => {
    if (isInitialLoading.value && allItems.value.length === 0) {
      return placeholderItems
    }
    return allItems.value.map(item => ({
      ...item,
      isPlaceholder: false as const,
    }))
  })

  // Function to load data
  const loadData = async (offset = 0, append = false) => {
    try {
      const { data } = await $apolloClient.query({
        query,
        variables: {
          ...variables,
          first: pageSize,
          offset,
        },
      })

      const newItems = extractData(data)
      const total = extractTotal(data)

      if (append) {
        allItems.value = [...allItems.value, ...newItems]
      }
      else {
        allItems.value = newItems
      }

      totalCount.value = total
      currentOffset.value = offset + pageSize
      hasMoreData.value = allItems.value.length < totalCount.value && newItems.length > 0
    }
    catch (error) {
      console.error('Error fetching data:', error)
      throw error
    }
    finally {
      isInitialLoading.value = false
    }
  }

  // Function to load more data for infinite scroll
  const loadMore = async () => {
    // Prevent multiple calls and ensure we have initial data
    if (!hasMoreData.value || allItems.value.length === 0) {
      return
    }

    await loadData(currentOffset.value, true)
  }

  // Setup infinite scroll
  const { isLoading } = useInfiniteScroll(
    window,
    loadMore,
    {
      distance,
      canLoadMore: () => {
        // Only load more if we have data and there's actually more to load
        return hasMoreData.value && allItems.value.length > 0 && !isInitialLoading.value
      },
    },
  )

  // Initialize data on first load
  const initialize = async () => {
    await loadData(0, false)
  }

  // Reset function to start fresh
  const reset = async () => {
    allItems.value = []
    currentOffset.value = 0
    hasMoreData.value = true
    totalCount.value = 0
    isInitialLoading.value = true
    await initialize()
  }

  return {
    // Data
    allItems: readonly(allItems),
    displayItems,
    totalCount: readonly(totalCount),

    // Loading states
    isInitialLoading: readonly(isInitialLoading),
    isLoading: readonly(isLoading),
    hasMoreData: readonly(hasMoreData),

    // Methods
    initialize,
    reset,
    loadMore,
  }
}
