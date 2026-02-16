<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OnchainCollection } from '~/services/oda'
import { useWindowSize } from '@vueuse/core'

const props = defineProps<{
  collectionId: string
  chain: AssetHubChain
  collectionData?: OnchainCollection | null
  isOwner: boolean
  sidebarView: 'default' | 'selection' | 'itemDetail'
  selectedCount: number
}>()

const emit = defineEmits<{
  toggleSelection: []
  selectAll: []
  clearSelection: []
  closeItemDetail: []
}>()

const isOpen = defineModel<boolean>('open', { default: false })

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)

// CollapsibleSidebar uses isCollapsed (true = hidden), we use isOpen (true = visible)
const isCollapsed = computed({
  get: () => !isOpen.value,
  set: (val: boolean) => { isOpen.value = !val },
})

const collectionName = computed(() => props.collectionData?.metadata?.name)
const collectionImage = computed(() => props.collectionData?.metadata?.image)
const collectionBanner = computed(() => props.collectionData?.metadata?.banner)
const collectionDescription = computed(() => props.collectionData?.metadata?.description)
const itemCount = computed(() => props.collectionData?.claimed || props.collectionData?.supply || '0')
const ownerAddress = computed(() => props.collectionData?.owner)
</script>

<template>
  <ClientOnly>
    <!-- Mobile: Slideover -->
    <template v-if="isMobile">
      <USlideover v-model:open="isOpen" side="left">
        <template #header>
          <AdminSidebarIdentity
            :name="collectionName"
            :image="collectionImage"
            :item-count="itemCount"
            :chain="chain"
            class="flex-1"
            @close="isOpen = false"
          />
        </template>

        <template #body>
          <template v-if="sidebarView === 'selection'">
            <AdminSelectionBar
              :selected-count="selectedCount"
              :collection-id="collectionId"
              :chain="chain"
              @select-all="emit('selectAll')"
              @clear-selection="emit('clearSelection')"
              @toggle-selection="emit('toggleSelection')"
            />
          </template>

          <template v-else-if="sidebarView === 'itemDetail'">
            <AdminItemDetail
              @back="emit('closeItemDetail')"
            />
          </template>

          <template v-else>
            <AdminSidebarDetails
              :name="collectionName"
              :description="collectionDescription"
              :image="collectionImage"
              :banner="collectionBanner"
            />
            <AdminSidebarEarnings :owner-address="ownerAddress" />
            <AdminSidebarTeam :owner-address="ownerAddress" />
            <AdminSidebarVisibility />
            <AdminSidebarActions
              :collection-id="collectionId"
              :collection-name="collectionName"
              :chain="chain"
              @toggle-selection="emit('toggleSelection')"
            />
          </template>
        </template>
      </USlideover>
    </template>

    <!-- Desktop: CollapsibleSidebar -->
    <template v-else>
      <CollapsibleSidebar
        v-model="isCollapsed"
        expanded-width="320px"
        sticky
      >
        <AdminSidebarIdentity
          :name="collectionName"
          :image="collectionImage"
          :item-count="itemCount"
          :chain="chain"
          @close="isOpen = false"
        />

        <div class="overflow-y-auto max-h-[calc(100vh-260px)]">
          <template v-if="sidebarView === 'selection'">
            <AdminSelectionBar
              :selected-count="selectedCount"
              :collection-id="collectionId"
              :chain="chain"
              @select-all="emit('selectAll')"
              @clear-selection="emit('clearSelection')"
              @toggle-selection="emit('toggleSelection')"
            />
          </template>

          <template v-else-if="sidebarView === 'itemDetail'">
            <AdminItemDetail
              @back="emit('closeItemDetail')"
            />
          </template>

          <template v-else>
            <AdminSidebarDetails
              :name="collectionName"
              :description="collectionDescription"
              :image="collectionImage"
              :banner="collectionBanner"
            />
            <AdminSidebarEarnings :owner-address="ownerAddress" />
            <AdminSidebarTeam :owner-address="ownerAddress" />
            <AdminSidebarVisibility />
            <AdminSidebarActions
              :collection-id="collectionId"
              :collection-name="collectionName"
              :chain="chain"
              @toggle-selection="emit('toggleSelection')"
            />
          </template>
        </div>
      </CollapsibleSidebar>
    </template>
  </ClientOnly>
</template>
