<script setup lang="ts">
const props = defineProps<{
  extraVariables?: Partial<Record<'owner' | 'issuer', string>>
}>()

defineEmits(['totalCountChange'])

const sortOptions = [
  { label: 'Recent', value: 'blockNumber_DESC' },
  { label: 'Oldest', value: 'blockNumber_ASC' },
  { label: 'A-Z', value: 'name_ASC' },
  { label: 'Z-A', value: 'name_DESC' },
]

const route = useRoute()
const router = useRouter()

const queryState = computed({
  get: () => ({
    sort: sortOptions.find(opt => opt.value === route.query.sort) || sortOptions[0],
    search: route.query.search as string || '',
  }),
  set: ({ sort, search }: { sort?: typeof sortOptions[0], search?: string }) => {
    const query = { ...route.query }

    // Clean up default values
    if (sort?.value === 'blockNumber_DESC')
      delete query.sort
    else if (sort)
      query.sort = sort.value

    if (!search)
      delete query.search
    else query.search = search

    router.push({ query })
  },
})

const queryVariables = computed(() => {
  const orderBy = queryState.value.sort?.value || 'blockNumber_DESC'
  const search = queryState.value.search

  return {
    ...props.extraVariables,
    orderBy: [orderBy],
    ...(search && { name: search }),
  }
})
</script>

<template>
  <div>
    <div class="flex items-center gap-2 mt-4">
      <UInput
        :model-value="queryState.search"
        placeholder="Search NFTs..."
        class="w-48"
        icon="i-heroicons-magnifying-glass"
        @update:model-value="queryState = { ...queryState, search: $event }"
      />
      <USelectMenu
        :model-value="queryState.sort"
        :items="sortOptions"
        placeholder="Sort By"
        class="w-32"
        @update:model-value="queryState = { ...queryState, sort: $event }"
      />
    </div>

    <div class="mt-8">
      <NftsGrid
        :key="queryVariables.orderBy + (queryVariables.name || '')"
        :search="queryState.search"
        :owner="queryVariables.owner"
        :issuer="queryVariables.issuer"
        :variables="queryVariables"
        @total-count-change="$emit('totalCountChange', $event)"
      />
    </div>
  </div>
</template>
