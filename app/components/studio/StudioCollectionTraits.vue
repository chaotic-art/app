<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { NftTraitsEditRow } from '~/components/studio/StudioCollectionTraitsEditSidebar.vue'
import type { Property } from '~/composables/onchain/useNftPallets'
import { h, resolveComponent } from 'vue'
import {
  bulkTraitRowMatchesQuery,
  collectionTraitRowMatchesQuery,
  csvIdsMissingFromCollection,
  exportBulkTraitsCsv,
  normalizeNftGraphqlAttributes,
  normalizePropertiesForCompare,
  parseBulkTraitsCsv,
  parseSnFromNftEntityId,
  propertiesEqual,
} from '~/components/studio/utils'
import { useNftPallets } from '~/composables/onchain/useNftPallets'
import { fetchTokenMetadata } from '~/composables/useToken'
import { pinJson } from '~/services/storage'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface Props {
  collectionId: string
}

interface BulkTraitRow extends NftTraitsEditRow {
  nextProperties: Property[] | null
  isChanged: boolean
}

const props = defineProps<Props>()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const search = ref('')
const {
  loading,
  nftsList,
  refetch,
} = useCollectionAttributes({
  collectionId: computed(() => props.collectionId),
})

const { onSuccess } = useTransactionModal()
const { currentChain } = useChain()
const { getItemMetadataUri, bulkUpdateItemsAttributes } = useNftPallets()

const sidebarOpen = ref(false)
const editingRow = ref<NftTraitsEditRow | null>(null)

const bulkMode = ref(false)
const pendingCsv = ref<Map<string, Property[]> | null>(null)
const csvParseError = ref('')
const csvInputRef = ref<HTMLInputElement | null>(null)
const applyingBulk = ref(false)

watch(sidebarOpen, (v) => {
  if (!v) {
    editingRow.value = null
  }
})

onMounted(() => {
  if (route.query.bulk === '1') {
    bulkMode.value = true
    const q = { ...route.query }
    delete q.bulk
    router.replace({ query: q })
  }
})

const rows = computed<NftTraitsEditRow[]>(() => {
  const base = (nftsList.value ?? []).map((nft) => {
    return {
      id: nft.id ?? '',
      sn: parseSnFromNftEntityId(nft.id),
      image: nft.meta?.image ?? null,
      name: (nft.name?.trim() || 'Untitled NFT'),
      properties: normalizeNftGraphqlAttributes(nft.meta?.attributes),
    } satisfies NftTraitsEditRow
  })

  base.sort((a, b) => a.sn - b.sn)
  return base
})

const filteredRows = computed(() =>
  rows.value.filter(r => collectionTraitRowMatchesQuery(search.value, r)),
)

const bulkTableRows = computed<BulkTraitRow[]>(() => {
  const csv = pendingCsv.value
  return rows.value.map((row) => {
    if (!csv || !csv.has(row.id)) {
      return { ...row, nextProperties: null, isChanged: false }
    }
    const next = normalizePropertiesForCompare(csv.get(row.id)!)
    const current: Property[] = row.properties.map(p => ({ trait: p.trait, value: p.value }))
    const isChanged = !propertiesEqual(current, next)
    return { ...row, nextProperties: next, isChanged }
  })
})

const filteredBulkRows = computed(() =>
  bulkTableRows.value.filter(r => bulkTraitRowMatchesQuery(search.value, r)),
)

const csvUnknownIds = computed(() => {
  if (!pendingCsv.value) {
    return [] as string[]
  }
  return csvIdsMissingFromCollection(
    rows.value.map(r => r.id),
    pendingCsv.value.keys(),
  )
})

const changedBulkCount = computed(() => bulkTableRows.value.filter(r => r.isChanged).length)

function openEditSidebar(row: NftTraitsEditRow) {
  editingRow.value = row
  sidebarOpen.value = true
}

function enterBulkMode() {
  bulkMode.value = true
  pendingCsv.value = null
  csvParseError.value = ''
}

function exitBulkMode() {
  bulkMode.value = false
  pendingCsv.value = null
  csvParseError.value = ''
}

function exportBulkCsv() {
  const exportRows = rows.value.map(r => ({
    id: r.id,
    properties: r.properties.map(p => ({ trait: p.trait, value: p.value })),
  }))
  exportBulkTraitsCsv(exportRows, `collection-${props.collectionId}`)
}

function triggerCsvImport() {
  csvInputRef.value?.click()
}

async function onCsvFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) {
    return
  }
  csvParseError.value = ''
  try {
    const text = await file.text()
    const parsed = parseBulkTraitsCsv(text)
    if (!parsed.ok) {
      csvParseError.value = parsed.error
      pendingCsv.value = null
      return
    }
    pendingCsv.value = parsed.data.byId
  }
  catch (err) {
    console.error('Bulk traits CSV read failed:', err)
    csvParseError.value = 'Could not read the CSV file.'
    pendingCsv.value = null
  }
  finally {
    input.value = ''
  }
}

async function confirmBulkApply() {
  const toApply = bulkTableRows.value.filter(r => r.isChanged)
  if (toApply.length === 0) {
    return
  }

  const chain = currentChain.value
  const collectionId = Number(props.collectionId)
  applyingBulk.value = true
  try {
    const items = await Promise.all(
      toApply.map(async (row) => {
        const currentUri = await getItemMetadataUri(chain, collectionId, row.sn)
        const currentMeta = currentUri ? await fetchTokenMetadata(currentUri) : null
        const nextProps = row.nextProperties ?? []
        const attributesForMeta = nextProps.map(p => ({ trait_type: p.trait, value: p.value }))
        const newMetadata = currentMeta
          ? { ...currentMeta, attributes: attributesForMeta }
          : {
              name: row.name,
              description: '',
              image: row.image ?? undefined,
              attributes: attributesForMeta,
            }

        const cid = await pinJson(newMetadata)
        return {
          itemId: row.sn,
          properties: nextProps,
          metadataUri: `ipfs://${cid}`,
        }
      }),
    )

    await bulkUpdateItemsAttributes({
      chain,
      collectionId,
      items,
    })
  }
  catch (err) {
    console.error('Bulk traits apply failed:', err)
    toast.add({
      title: 'Bulk update failed',
      description: err instanceof Error ? err.message : 'Unknown error',
      color: 'error',
    })
  }
  finally {
    applyingBulk.value = false
  }
}

onSuccess('update_attributes', () => {
  refetch()
})

onSuccess('bulk_update_attributes', () => {
  refetch()
  exitBulkMode()
})

const columns: TableColumn<NftTraitsEditRow>[] = [
  {
    accessorKey: 'sn',
    header: '#',
  },
  {
    accessorKey: 'image',
    header: 'Image',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'properties',
    header: 'Properties',
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h('div', { class: 'py-2' }, [
        h(resolveComponent('UButton'), {
          'variant': 'ghost',
          'color': 'neutral',
          'size': 'sm',
          'icon': 'i-heroicons-pencil-square',
          'aria-label': 'Edit traits',
          'onClick': () => openEditSidebar(row.original),
        }),
      ]),
  },
]

const bulkColumns: TableColumn<BulkTraitRow>[] = [
  {
    accessorKey: 'sn',
    header: '#',
  },
  {
    accessorKey: 'image',
    header: 'Image',
  },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'properties',
    header: 'Properties',
  },
  {
    accessorKey: 'nextProperties',
    header: 'New properties',
  },
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <div class="text-xl font-semibold text-foreground">
          Traits Overview
        </div>
      </div>

      <div v-if="!bulkMode" class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search SN, name, or traits"
          class="w-full sm:w-80"
          aria-label="Search collection NFTs"
        />
        <UButton
          variant="outline"
          icon="i-heroicons-pencil-square"
          class="shrink-0"
          @click="enterBulkMode"
        >
          Bulk Edit
        </UButton>
      </div>

      <div v-else class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Search SN, name, or traits"
          class="w-full sm:w-80"
          aria-label="Search collection NFTs"
        />
        <UButton
          variant="ghost"
          color="neutral"
          icon="i-heroicons-arrow-left"
          class="shrink-0"
          @click="exitBulkMode"
        >
          Back
        </UButton>
      </div>
    </div>

    <div v-if="bulkMode" class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <UTooltip
        text="Export this collection’s traits to CSV for editing."
        :popper="{ placement: 'top' }"
      >
        <UButton
          icon="i-heroicons-arrow-down-tray"
          variant="outline"
          :disabled="rows.length === 0"
          @click="exportBulkCsv"
        >
          Export CSV
        </UButton>
      </UTooltip>
      <input
        ref="csvInputRef"
        type="file"
        accept=".csv,text/csv"
        class="hidden"
        aria-label="Upload traits CSV"
        @change="onCsvFile"
      >
      <UTooltip
        text="Upload your edited CSV. Properties column: trait:value;trait2:value2 (semicolon-separated pairs)."
        :popper="{ placement: 'top' }"
      >
        <UButton
          icon="i-heroicons-arrow-up-tray"
          variant="outline"
          :disabled="rows.length === 0"
          @click="triggerCsvImport"
        >
          Upload CSV
        </UButton>
      </UTooltip>
      <UButton
        :disabled="changedBulkCount === 0 || applyingBulk"
        :loading="applyingBulk"
        @click="confirmBulkApply"
      >
        Confirm changes ({{ changedBulkCount }})
      </UButton>
    </div>

    <UAlert
      v-if="bulkMode && csvParseError"
      color="error"
      variant="soft"
      :title="csvParseError"
    />

    <UAlert
      v-if="bulkMode && csvUnknownIds.length > 0"
      color="warning"
      variant="soft"
      title="These NFT ids from the CSV were not found in this collection:"
      :description="csvUnknownIds.join(', ')"
    />

    <div v-if="loading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-muted" />
    </div>

    <div v-else-if="rows.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
      <UIcon name="i-heroicons-tag" class="w-14 h-14 text-muted mb-3" />
      <div class="text-lg font-medium text-foreground">
        No NFTs found
      </div>
      <div class="text-sm text-muted mt-1">
        This collection doesn't have any NFT metadata with properties yet.
      </div>
    </div>

    <div v-else-if="!bulkMode" class="space-y-4">
      <div class="rounded-xl border border-border bg-background overflow-hidden">
        <UTable
          :data="filteredRows"
          :columns="columns"
          class="w-full max-h-[80vh]"
          sticky
        >
          <template #image-cell="{ row }">
            <div class="py-2">
              <img
                v-if="row.original.image"
                :src="sanitizeIpfsUrl(row.original.image)"
                :alt="row.original.name"
                class="w-14 h-14 aspect-square rounded-lg object-cover border border-border bg-muted"
                loading="lazy"
              >
              <div v-else class="w-14 h-14 aspect-square rounded-lg border border-border bg-muted flex items-center justify-center">
                <UIcon name="i-heroicons-photo" class="w-6 h-6 text-muted" />
              </div>
            </div>
          </template>

          <template #properties-cell="{ row }">
            <div class="py-2 text-sm leading-5">
              <div v-if="row.original.properties.length === 0" class="text-muted">
                —
              </div>
              <div v-else class="space-y-0.5">
                <div
                  v-for="(p, idx) in row.original.properties"
                  :key="`${p.trait}-${p.value}-${idx}`"
                  class="text-foreground"
                >
                  <span class="text-muted">{{ p.trait }}:</span>
                  {{ ' ' }}{{ p.value }}
                </div>
              </div>
            </div>
          </template>
        </UTable>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="rounded-xl border border-border bg-background overflow-hidden">
        <UTable
          :data="filteredBulkRows"
          :columns="bulkColumns"
          class="w-full max-h-[80vh]"
          sticky
        >
          <template #image-cell="{ row }">
            <div class="py-2">
              <img
                v-if="row.original.image"
                :src="sanitizeIpfsUrl(row.original.image)"
                :alt="row.original.name"
                class="w-14 h-14 aspect-square rounded-lg object-cover border border-border bg-muted"
                loading="lazy"
              >
              <div v-else class="w-14 h-14 aspect-square rounded-lg border border-border bg-muted flex items-center justify-center">
                <UIcon name="i-heroicons-photo" class="w-6 h-6 text-muted" />
              </div>
            </div>
          </template>

          <template #properties-cell="{ row }">
            <div class="py-2 text-sm leading-5">
              <div v-if="row.original.properties.length === 0" class="text-muted">
                —
              </div>
              <div v-else class="space-y-0.5">
                <div
                  v-for="(p, idx) in row.original.properties"
                  :key="`${p.trait}-${p.value}-${idx}`"
                  class="text-foreground"
                >
                  <span class="text-muted">{{ p.trait }}:</span>
                  {{ ' ' }}{{ p.value }}
                </div>
              </div>
            </div>
          </template>

          <template #nextProperties-cell="{ row }">
            <div class="py-2 text-sm leading-5 space-y-1">
              <UBadge
                v-if="row.original.isChanged"
                color="warning"
                variant="subtle"
                size="xs"
              >
                Changed
              </UBadge>
              <div v-if="!row.original.nextProperties" class="text-muted">
                —
              </div>
              <div v-else-if="row.original.nextProperties.length === 0" class="text-muted">
                -
              </div>
              <div v-else class="space-y-0.5">
                <div
                  v-for="(p, idx) in row.original.nextProperties"
                  :key="`new-${p.trait}-${p.value}-${idx}`"
                  class="text-foreground"
                >
                  <span class="text-muted">{{ p.trait }}:</span>
                  {{ ' ' }}{{ p.value }}
                </div>
              </div>
            </div>
          </template>
        </UTable>
      </div>
    </div>

    <StudioCollectionTraitsEditSidebar
      v-model:open="sidebarOpen"
      :collection-id="collectionId"
      :nft="editingRow"
    />
  </div>
</template>
