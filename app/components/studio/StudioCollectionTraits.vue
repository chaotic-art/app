<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { NftTraitsEditRow } from '~/components/studio/StudioCollectionTraitsEditSidebar.vue'
import { h, resolveComponent } from 'vue'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface Props {
  collectionId: string
}

interface NftTraitProperty {
  trait?: string
  value: string
}

const props = defineProps<Props>()
const search = ref('')
const {
  loading,
  nftsList,
  refetch,
} = useCollectionAttributes({
  collectionId: computed(() => props.collectionId),
})

const { onSuccess } = useTransactionModal()

const sidebarOpen = ref(false)
const editingRow = ref<NftTraitsEditRow | null>(null)

watch(sidebarOpen, (v) => {
  if (!v) {
    editingRow.value = null
  }
})

function parseSn(id?: string) {
  const parts = String(id ?? '').split('-')
  const tokenId = Number(parts.at(-1))
  return Number.isFinite(tokenId) ? tokenId : 0
}

function normalizeProperties(attrs?: NftTraitProperty[]) {
  const out: Array<{ trait: string, value: string }> = []

  ;(attrs ?? []).forEach((a) => {
    const trait = a.trait?.trim()
    const value = String(a.value ?? '').trim()
    if (!trait || !value) {
      return
    }
    out.push({ trait, value })
  })

  out.sort((a, b) => {
    if (a.trait !== b.trait) {
      return a.trait.localeCompare(b.trait)
    }
    return a.value.localeCompare(b.value)
  })

  return out
}

const rows = computed<NftTraitsEditRow[]>(() => {
  const base = (nftsList.value ?? []).map((nft) => {
    return {
      sn: parseSn(nft.id),
      image: nft.meta?.image ?? null,
      name: (nft.name?.trim() || 'Untitled NFT'),
      properties: normalizeProperties(nft.meta?.attributes as NftTraitProperty[] | undefined),
    } satisfies NftTraitsEditRow
  })

  base.sort((a, b) => a.sn - b.sn)
  return base
})

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) {
    return rows.value
  }

  return rows.value.filter((r) => {
    if (String(r.sn).includes(q) || r.name.toLowerCase().includes(q)) {
      return true
    }
    return r.properties.some(p => p.trait.toLowerCase().includes(q) || p.value.toLowerCase().includes(q))
  })
})

function openEditSidebar(row: NftTraitsEditRow) {
  editingRow.value = row
  sidebarOpen.value = true
}

onSuccess('update_attributes', () => {
  refetch()
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
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <div class="text-xl font-semibold text-foreground">
          Traits Overview
        </div>
      </div>

      <UInput
        v-model="search"
        icon="i-heroicons-magnifying-glass"
        placeholder="Search SN, name, or traits"
        class="w-full sm:w-80"
        aria-label="Search collection NFTs"
      />
    </div>

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

    <div v-else class="space-y-4">
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

    <StudioCollectionTraitsEditSidebar
      v-model:open="sidebarOpen"
      :collection-id="collectionId"
      :nft="editingRow"
    />
  </div>
</template>
