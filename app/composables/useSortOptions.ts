export interface SortOption {
  label: string
  value: string
  icon: string
}

export const defaultSortOptions: SortOption[] = [
  { label: 'Newest', value: 'newest', icon: 'i-heroicons-clock' },
  { label: 'Oldest', value: 'oldest', icon: 'i-heroicons-archive-box' },
  { label: 'Lowest Price', value: 'lowest_price', icon: 'i-heroicons-arrow-trending-down' },
  { label: 'Higher Price', value: 'higher_price', icon: 'i-heroicons-arrow-trending-up' },
]

export function useSortOptions(defaultSort = 'newest') {
  const selectedSort = ref(defaultSort)

  const orderByValue = computed(() => {
    switch (selectedSort.value) {
      case 'newest':
        return 'blockNumber_DESC'
      case 'oldest':
        return 'blockNumber_ASC'
      case 'lowest_price':
        return 'price_ASC'
      case 'higher_price':
        return 'price_DESC'
      default:
        return 'blockNumber_DESC'
    }
  })

  const createQueryVariables = (collections: string[]) => {
    const variables: any = {
      collections,
      orderBy: orderByValue.value,
    }

    if (selectedSort.value === 'lowest_price' || selectedSort.value === 'higher_price') {
      variables.search = [
        { price_gt: '0' },
      ]
    }

    return variables
  }

  return {
    selectedSort,
    orderByValue,
    createQueryVariables,
  }
}
