<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { NFT, NFTS } from './types'
import { Status } from './types'

interface Props {
  disabled?: boolean
  nfts?: NFTS
  collectionId?: string
}

interface Emits {
  (e: 'openSideBarWith', nft: NFT): void
  (e: 'delete', nft: NFT): void
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  nfts: () => ({}),
  collectionId: undefined,
})

const emit = defineEmits<Emits>()

const displayedNFTS = computed<NFT[]>(() =>
  Object.values(props.nfts).map(addStatus),
)

function openSideBarWith(nft: NFT) {
  emit('openSideBarWith', nft)
}

function deleteNFT(nft: NFT) {
  emit('delete', nft)
}

function addStatus(nft: NFT): NFT {
  const getStatus = (nft: NFT): Status => {
    if (!nft.name) {
      return Status.Incomplete
    }
    return Status.Ok
  }

  return {
    ...nft,
    status: getStatus(nft),
  }
}

function statusClass(status?: Status) {
  switch (status) {
    case Status.Ok:
      return 'bg-green-100 text-green-800 border-green-200'
    case Status.Incomplete:
      return 'bg-red-100 text-red-800 border-red-200'
    case Status.Description:
    case Status.Price:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case Status.Optional:
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function statusTranslation(status?: Status) {
  switch (status) {
    case Status.Ok:
      return 'Complete'
    case Status.Incomplete:
      return 'Incomplete'
    default:
      return 'Unknown'
  }
}

// Define table columns
const columns: TableColumn<NFT>[] = [
  {
    accessorKey: 'id',
    header: '#',
    cell: ({ row }) => {
      return h('div', { class: 'p-2' }, row.getValue('id'))
    },
  },
  {
    accessorKey: 'imageUrl',
    header: 'Image',
    cell: ({ row }) => {
      const nft = row.original
      return h('div', { class: 'p-2' }, [
        h('div', { class: 'w-12 h-12 rounded-lg overflow-hidden bg-muted' }, [
          nft.imageUrl
            ? h('img', {
                src: nft.imageUrl,
                alt: nft.name || `NFT ${nft.id}`,
                class: 'w-full h-full object-cover',
              })
            : h('div', { class: 'w-full h-full flex items-center justify-center' }, [
                h('svg', {
                  class: 'w-6 h-6 text-muted-foreground',
                  fill: 'none',
                  stroke: 'currentColor',
                  viewBox: '0 0 24 24',
                }, [
                  h('path', {
                    'stroke-linecap': 'round',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    'd': 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
                  }),
                ]),
              ]),
        ]),
      ])
    },
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const nft = row.original
      return h('div', {
        class: 'p-2 cursor-pointer hover:text-primary',
        onClick: () => openSideBarWith(nft),
      }, [
        h('div', {
          class: nft.name ? '' : 'text-red-500',
        }, nft.name || '*Name Required'),
      ])
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const nft = row.original
      return h('div', {
        class: 'p-2 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] hover:text-primary',
        onClick: () => openSideBarWith(nft),
      }, [
        h('div', {
          class: nft.description ? '' : 'text-orange-500',
        }, nft.description || 'Description Missing'),
      ])
    },
  },
  {
    accessorKey: 'attributes',
    header: 'Properties',
    cell: ({ row }) => {
      const nft = row.original
      return h('div', {
        class: 'p-2 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:text-primary',
        onClick: () => openSideBarWith(nft),
      }, [
        nft.attributes?.length
          ? h('div', nft.attributes.map(attr =>
              h('div', {
                key: attr.trait_type,
                class: 'flex items-center gap-2 text-sm',
              }, [
                h('span', `${attr.trait_type}: `),
                h('span', { class: 'font-bold' }, attr.value),
              ]),
            ))
          : h('div', { class: nft.attributes?.length ? '' : 'text-orange-500' }, 'Attributes Missing'),
      ])
    },
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const nft = row.original
      return h('div', {
        class: 'p-2 cursor-pointer hover:text-primary',
        onClick: () => openSideBarWith(nft),
      }, [
        nft.price
          ? h('div', { class: 'text-sm' }, `${nft.price} DOT`)
          : h('div', { class: 'text-orange-500 text-sm' }, 'Price Missing'),
      ])
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const nft = row.original
      return h('div', { class: 'p-2' }, [
        h('div', { class: 'flex items-center' }, [
          h('div', {
            class: `border text-xs justify-center py-1 px-2 flex items-center rounded-full ${statusClass(nft.status)}`,
          }, statusTranslation(nft.status)),
        ]),
      ])
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const nft = row.original
      return h('div', { class: 'p-2' }, [
        h('div', { class: 'flex items-center gap-2' }, [
          h('button', {
            class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3',
            onClick: () => openSideBarWith(nft),
          }, [
            h('svg', {
              class: 'h-4 w-4',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24',
            }, [
              h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                'd': 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
              }),
            ]),
          ]),
          h('button', {
            class: 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3 text-destructive hover:text-destructive',
            onClick: () => deleteNFT(nft),
          }, [
            h('svg', {
              class: 'h-4 w-4',
              fill: 'none',
              stroke: 'currentColor',
              viewBox: '0 0 24 24',
            }, [
              h('path', {
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round',
                'stroke-width': '2',
                'd': 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
              }),
            ]),
          ]),
        ]),
      ])
    },
  },
]
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">
        Overview Table
      </h3>
    </div>

    <div v-if="disabled || !displayedNFTS.length" class="border-2 border-dashed border-border rounded-lg p-8 text-center">
      <UIcon
        name="i-heroicons-table-cells"
        class="w-12 h-12 text-muted-foreground mx-auto mb-4"
      />
      <p class="text-lg font-medium mb-2">
        Overview Table
      </p>
      <p class="text-sm text-muted-foreground">
        Upload files to see the overview table
      </p>
    </div>

    <UTable
      v-else
      :data="displayedNFTS"
      :columns="columns"
      sticky
      class="flex-1 h-[600px]"
    />
  </div>
</template>
