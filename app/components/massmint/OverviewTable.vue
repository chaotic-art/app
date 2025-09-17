<script setup lang="ts">
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
    if (!nft.description && !nft.price) {
      return Status.Optional
    }
    if (!nft.description) {
      return Status.Description
    }
    if (!nft.price) {
      return Status.Price
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
    case Status.Description:
      return 'Missing Description'
    case Status.Price:
      return 'Missing Price'
    case Status.Optional:
      return 'Optional'
    default:
      return 'Unknown'
  }
}
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

    <div v-else class="overflow-x-auto">
      <table class="w-full table-auto">
        <thead>
          <tr class="border-b border-border">
            <th class="text-left p-2 font-medium">
              #
            </th>
            <th class="text-left p-2 font-medium">
              Image
            </th>
            <th class="text-left p-2 font-medium">
              Name
            </th>
            <th class="text-left p-2 font-medium">
              Description
            </th>
            <th class="text-left p-2 font-medium">
              Properties
            </th>
            <th class="text-left p-2 font-medium">
              Price
            </th>
            <th class="text-left p-2 font-medium">
              Status
            </th>
            <th class="text-left p-2 font-medium">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="nft in displayedNFTS"
            :key="nft.id"
            class="border-b border-border hover:bg-muted/50"
          >
            <td class="p-2">
              {{ nft.id }}
            </td>
            <td class="p-2">
              <div class="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                <img
                  v-if="nft.imageUrl"
                  :src="nft.imageUrl"
                  :alt="nft.name || `NFT ${nft.id}`"
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full flex items-center justify-center">
                  <UIcon name="i-heroicons-photo" class="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </td>
            <td class="p-2">
              <div
                class="cursor-pointer hover:text-primary"
                :class="{ 'text-red-500': !nft.name }"
                @click="openSideBarWith(nft)"
              >
                {{ nft.name || '*Name Required' }}
              </div>
            </td>
            <td class="p-2">
              <div
                class="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] hover:text-primary"
                :class="{ 'text-orange-500': !nft.description }"
                @click="openSideBarWith(nft)"
              >
                {{ nft.description || 'Description Missing' }}
              </div>
            </td>
            <td class="p-2">
              <div
                class="cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap hover:text-primary"
                :class="{ 'text-orange-500': !nft.attributes?.length }"
                @click="openSideBarWith(nft)"
              >
                <div v-if="nft.attributes?.length">
                  <div
                    v-for="attr in nft.attributes"
                    :key="attr.trait_type"
                    class="flex items-center gap-2 text-sm"
                  >
                    <span>{{ attr.trait_type }}: <span class="font-bold">{{ attr.value }}</span></span>
                  </div>
                </div>
                <div v-else>
                  Attributes Missing
                </div>
              </div>
            </td>
            <td class="p-2">
              <div
                class="cursor-pointer hover:text-primary"
                @click="openSideBarWith(nft)"
              >
                <div v-if="nft.price" class="text-sm">
                  {{ nft.price }} DOT
                </div>
                <div v-else class="text-orange-500 text-sm">
                  Price Missing
                </div>
              </div>
            </td>
            <td class="p-2">
              <div class="flex items-center">
                <div
                  class="border text-xs justify-center py-1 px-2 flex items-center rounded-full"
                  :class="statusClass(nft.status)"
                >
                  {{ statusTranslation(nft.status) }}
                </div>
              </div>
            </td>
            <td class="p-2">
              <div class="flex items-center gap-2">
                <UButton
                  icon="i-heroicons-pencil"
                  size="sm"
                  variant="ghost"
                  @click="openSideBarWith(nft)"
                />
                <UButton
                  icon="i-heroicons-trash"
                  size="sm"
                  variant="ghost"
                  color="error"
                  @click="deleteNFT(nft)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
