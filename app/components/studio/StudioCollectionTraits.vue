<script setup lang="ts">
import { sanitizeIpfsUrl } from '~/utils/ipfs'

interface Props {
  collectionId: string
}

interface NftTraitProperty {
  trait?: string
  value: string
}

interface NftRow {
  sn: number
  image?: string | null
  name: string
  properties: Array<{ trait: string, value: string }>
}

const props = defineProps<Props>()

const {
  loading,
  nftsList,
} = useCollectionAttributes({
  collectionId: computed(() => props.collectionId),
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

const rows = computed<NftRow[]>(() => {
  const base = (nftsList.value ?? []).map((nft) => {
    return {
      sn: parseSn(nft.id),
      image: nft.meta?.image ?? null,
      name: (nft.name?.trim() || 'Untitled NFT'),
      properties: normalizeProperties(nft.meta?.attributes as NftTraitProperty[] | undefined),
    } satisfies NftRow
  })

  base.sort((a, b) => a.sn - b.sn)
  return base
})

const columns = [
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
          :data="rows"
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
  </div>
</template>
