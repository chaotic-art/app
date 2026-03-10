<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui'
import type { OdaToken } from '~/services/oda'

interface PropertyRow {
  trait_type: string
  value: string
  rarity: number
}

const props = defineProps<{ tokenData: OdaToken | null, collectionId: string }>()

const { getAttributeRarity } = useCollectionAttributes({
  collectionId: computed(() => props.collectionId),
})

const properties = computed<PropertyRow[]>(() => {
  const attributes = (props.tokenData?.metadata?.attributes || []) as Array<Record<string, string>>

  return attributes.map((attr) => {
    const traitType = attr.trait_type || attr.trait || attr.key || ''
    const traitValue = attr.value || ''
    const rarity = getAttributeRarity(traitType, traitValue)

    return {
      trait_type: traitType,
      value: traitValue,
      rarity,
    }
  })
})

const propertiesColumns: TableColumn<PropertyRow>[] = [
  {
    accessorKey: 'trait_type',
    header: 'Trait',
  },
  {
    accessorKey: 'value',
    header: 'Value',
  },
  {
    accessorKey: 'rarity',
    header: 'Rarity',
    cell: ({ row }) => {
      return `${row.original.rarity}%`
    },
  },
]
</script>

<template>
  <div class="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
    <UTable
      v-if="properties.length"
      :data="properties"
      :columns="propertiesColumns"
    />
    <div v-else class="p-8 text-center text-muted-foreground">
      No properties available for this NFT
    </div>
  </div>
</template>
