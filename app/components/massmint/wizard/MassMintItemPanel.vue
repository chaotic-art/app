<script setup lang="ts">
import type { MassMintFile } from '~/components/massmint/types'

const props = defineProps<{
  file: MassMintFile | null
}>()

const emit = defineEmits<{
  close: []
  save: [data: { name: string, description: string, attributes: Array<{ trait_type: string, value: string }> }]
}>()

// Local form state — populated from file, committed on Save
const editName = ref('')
const editDescription = ref('')
const editAttributes = ref<Array<{ trait_type: string, value: string }>>([])

// Snapshot of original values to track dirty state
const originalName = ref('')
const originalDescription = ref('')
const originalAttributes = ref('')

function populateFrom(file: MassMintFile) {
  editName.value = file.name ?? ''
  editDescription.value = file.description ?? ''
  editAttributes.value = file.attributes?.map(a => ({ ...a })) ?? []
  snapshotOriginals()
}

function snapshotOriginals() {
  originalName.value = editName.value
  originalDescription.value = editDescription.value
  originalAttributes.value = JSON.stringify(editAttributes.value)
}

const isDirty = computed(() => {
  return editName.value !== originalName.value
    || editDescription.value !== originalDescription.value
    || JSON.stringify(editAttributes.value) !== originalAttributes.value
})

// Populate when file changes
watch(() => props.file, (file) => {
  if (file) {
    populateFrom(file)
  }
}, { immediate: true })

function addTrait() {
  editAttributes.value.push({ trait_type: '', value: '' })
}

function removeTrait(index: number) {
  editAttributes.value.splice(index, 1)
}

function handleSave() {
  emit('save', {
    name: editName.value,
    description: editDescription.value,
    attributes: editAttributes.value.filter(a => a.trait_type.trim() || a.value.trim()),
  })
  snapshotOriginals()
}

// Unsaved changes confirmation
const showDiscardConfirm = ref(false)
let pendingAction: (() => void) | null = null

function guardedClose() {
  if (isDirty.value) {
    pendingAction = () => emit('close')
    nextTick(() => {
      showDiscardConfirm.value = true
    })
  }
  else {
    emit('close')
  }
}

function confirmDiscard() {
  showDiscardConfirm.value = false
  pendingAction?.()
  pendingAction = null
}

function cancelDiscard() {
  showDiscardConfirm.value = false
  pendingAction = null
}

/**
 * Called by parent before switching to a different file.
 * Returns true if switch is allowed, false if blocked (shows discard dialog).
 */
function canSwitchFile(onConfirm: () => void): boolean {
  if (isDirty.value) {
    pendingAction = onConfirm
    showDiscardConfirm.value = true
    return false
  }
  return true
}

defineExpose({ canSwitchFile })

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.file) {
    e.stopImmediatePropagation()
    e.preventDefault()
    guardedClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown, true)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown, true)
})

const nameError = computed(() => !editName.value.trim())
const descriptionHint = computed(() => !editDescription.value.trim())
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
        v-if="file"
        class="fixed inset-0 bg-black/50"
        style="z-index: 100"
        @click="guardedClose"
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
        v-if="file"
        class="fixed right-0 top-0 h-screen w-[340px] bg-background border-l border-border shadow-2xl overflow-y-auto"
        style="z-index: 101"
        @click.stop
      >
        <!-- Header — height matches top bar (px-5 py-3.5 with h-8 content) -->
        <div class="flex items-center justify-between px-4 py-3.5 border-b border-border min-h-[60px]">
          <h3 class="font-semibold text-sm truncate">
            {{ file.file.name }}
          </h3>
          <UButton
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark"
            @click="guardedClose"
          />
        </div>

        <!-- Thumbnail -->
        <div class="aspect-square bg-muted">
          <img
            v-if="file.file.type?.startsWith('image/')"
            :src="file.thumbnailUrl"
            :alt="file.file.name"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center">
            <UIcon name="i-heroicons-document" class="w-16 h-16 text-muted-foreground" />
          </div>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-5">
          <!-- Name -->
          <div>
            <label class="text-xs font-medium text-muted-foreground mb-1 block">
              Name <span class="text-red-500">*</span>
            </label>
            <UInput
              v-model="editName"
              placeholder="NFT name"
              :class="nameError ? 'ring-1 ring-red-500' : ''"
            />
            <p v-if="nameError" class="text-xs text-red-500 mt-1">
              Name is required
            </p>
          </div>

          <!-- Description -->
          <div>
            <label class="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
            <UTextarea
              v-model="editDescription"
              placeholder="Add a description..."
              :rows="3"
            />
            <p v-if="descriptionHint" class="text-xs text-amber-500 mt-1">
              No description — optional but recommended
            </p>
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
              <div v-if="editAttributes.length > 0" class="flex items-center gap-2 px-1">
                <span class="flex-1 text-xs text-muted-foreground">Trait</span>
                <span class="flex-1 text-xs text-muted-foreground">Value</span>
                <span class="w-7" />
              </div>
              <div
                v-for="(attr, i) in editAttributes"
                :key="i"
                class="flex items-center gap-2"
              >
                <UInput
                  v-model="attr.trait_type"
                  placeholder="Trait"
                  size="sm"
                  class="flex-1"
                />
                <UInput
                  v-model="attr.value"
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
              <p v-if="editAttributes.length === 0" class="text-xs text-muted-foreground">
                No properties yet.
              </p>
            </div>
          </div>

          <!-- Divider + Save -->
          <div class="pt-4 border-t border-border">
            <UButton
              class="w-full"
              :disabled="nameError"
              icon="i-heroicons-check-circle"
              @click="handleSave"
            >
              Save
            </UButton>
          </div>
        </div>
      </aside>
    </Transition>
  </Teleport>

  <!-- Discard confirmation -->
  <UModal v-model:open="showDiscardConfirm">
    <template #content>
      <div class="p-6 space-y-4">
        <h3 class="text-lg font-semibold">
          Unsaved changes
        </h3>
        <p class="text-muted-foreground">
          You have unsaved changes. Discard them?
        </p>
        <div class="flex justify-end gap-3">
          <UButton variant="outline" @click="cancelDiscard">
            Go Back
          </UButton>
          <UButton color="error" @click="confirmDiscard">
            Discard
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
