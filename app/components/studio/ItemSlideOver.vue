<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'

const props = defineProps<{
  itemId: string | null
  chain: AssetHubChain
  collectionId: string
}>()

const emit = defineEmits<{
  close: []
}>()

// Parse tokenId and collectionId from the composite itemId (format: "collectionId-tokenId")
const parsedIds = computed(() => {
  if (!props.itemId)
    return null
  const parts = props.itemId.split('-')
  return {
    collectionId: Number(parts[0]),
    tokenId: Number(parts[1]),
  }
})

// Mock item data based on tokenId
const mockNames = [
  'Nebula Drift',
  'Solar Whisper',
  'Quantum Bloom',
  'Astral Echo',
  'Cosmic Seed',
  'Void Walker',
  'Star Forge',
  'Lunar Tide',
  'Photon Veil',
  'Dark Matter',
  'Celestial Shard',
  'Plasma Wave',
]

const itemData = computed(() => {
  if (!parsedIds.value)
    return null
  const idx = parsedIds.value.tokenId - 1
  return {
    name: `${mockNames[idx] || 'Untitled'} #${parsedIds.value.tokenId}`,
    description: 'A unique piece from the Cosmic Explorers collection.',
    properties: [
      { key: 'Background', value: 'Deep Space' },
      { key: 'Pattern', value: 'Nebula' },
    ],
    isListed: idx % 3 === 0,
    isVisible: true,
  }
})

const editableDescription = ref('')
const editableProperties = ref<{ key: string, value: string }[]>([])
const isVisible = ref(true)

watch(() => props.itemId, () => {
  if (itemData.value) {
    editableDescription.value = itemData.value.description
    editableProperties.value = [...itemData.value.properties]
    isVisible.value = itemData.value.isVisible
  }
}, { immediate: true })

function addTrait() {
  editableProperties.value.push({ key: '', value: '' })
}

function removeTrait(index: number) {
  editableProperties.value.splice(index, 1)
}

function handleClose() {
  emit('close')
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close')
  }
}

const galleryLink = computed(() => {
  if (!parsedIds.value)
    return ''
  return `/${props.chain}/gallery/${parsedIds.value.collectionId}-${parsedIds.value.tokenId}`
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="itemId"
        class="fixed inset-0 bg-black/50 z-[100]"
        @click="handleClose"
      />
    </Transition>

    <!-- Panel -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <aside
        v-if="itemId && itemData"
        class="fixed right-0 top-0 h-screen w-[340px] bg-background border-l border-border shadow-2xl overflow-y-auto z-[101]"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-border">
          <h3 class="font-semibold text-sm truncate">
            {{ itemData.name }}
          </h3>
          <div class="flex items-center gap-1">
            <UButton
              variant="ghost"
              size="xs"
              icon="i-heroicons-arrow-top-right-on-square"
              :to="galleryLink"
              target="_blank"
            />
            <UButton
              variant="ghost"
              size="xs"
              icon="i-heroicons-x-mark"
              @click="handleClose"
            />
          </div>
        </div>

        <!-- Thumbnail -->
        <div class="aspect-square bg-muted">
          <div class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-photo" class="w-16 h-16 text-muted-foreground" />
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-6">
          <!-- Description -->
          <div>
            <label class="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <UTextarea
              v-model="editableDescription"
              placeholder="Add a description..."
              :rows="3"
            />
          </div>

          <!-- Properties / Traits -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-medium text-muted-foreground">Properties</label>
              <UButton
                variant="ghost"
                size="xs"
                icon="i-heroicons-plus"
                @click="addTrait"
              >
                Add
              </UButton>
            </div>
            <div class="space-y-2">
              <div v-if="editableProperties.length > 0" class="flex items-center gap-2 px-1">
                <span class="flex-1 text-xs text-muted-foreground">Trait</span>
                <span class="flex-1 text-xs text-muted-foreground">Value</span>
                <span class="w-7" />
              </div>
              <div
                v-for="(prop, i) in editableProperties"
                :key="i"
                class="flex items-center gap-2"
              >
                <UInput
                  v-model="prop.key"
                  placeholder="Trait"
                  size="sm"
                  class="flex-1"
                />
                <UInput
                  v-model="prop.value"
                  placeholder="Value"
                  size="sm"
                  class="flex-1"
                />
                <UButton
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-trash"
                  class="text-muted-foreground"
                  @click="removeTrait(i)"
                />
              </div>
              <p v-if="editableProperties.length === 0" class="text-xs text-muted-foreground">
                No properties yet.
              </p>
            </div>
          </div>

          <!-- Visibility -->
          <div class="flex items-center justify-between">
            <div>
              <label class="text-sm font-medium block">Visibility</label>
              <p class="text-xs text-muted-foreground">
                {{ isVisible ? 'Visible to everyone' : 'Hidden from public view' }}
              </p>
            </div>
            <USwitch v-model="isVisible" />
          </div>

          <!-- Status -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium">Status</span>
            <UBadge
              :label="itemData.isListed ? 'Listed' : 'Unlisted'"
              :color="itemData.isListed ? 'success' : 'neutral'"
              variant="subtle"
              size="sm"
            />
          </div>

          <!-- Delete Item -->
          <div class="pt-4 border-t border-border">
            <UButton
              variant="outline"
              color="error"
              class="w-full"
              icon="i-heroicons-trash"
            >
              Delete Item
            </UButton>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
