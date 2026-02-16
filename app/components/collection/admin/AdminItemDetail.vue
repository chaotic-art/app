<script setup lang="ts">
import { warningMessage } from '~/utils/notification'

const emit = defineEmits<{
  back: []
}>()

const localDescription = ref('')
const localTraits = ref<Array<{ trait_type: string, value: string }>>([])

function handleSave() {
  warningMessage('Coming soon — on-chain item editing will be wired in a future update.')
}

function addTrait() {
  localTraits.value.push({ trait_type: '', value: '' })
}

function removeTrait(index: number) {
  localTraits.value.splice(index, 1)
}
</script>

<template>
  <div class="p-4 space-y-4">
    <button
      class="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      @click="emit('back')"
    >
      <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
      Back to collection
    </button>

    <div class="space-y-4">
      <div>
        <label class="text-xs font-medium text-muted-foreground block mb-1">Name</label>
        <UInput
          model-value="Item name"
          disabled
          size="sm"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Names are set during minting and are final
        </p>
      </div>

      <div>
        <label class="text-xs font-medium text-muted-foreground block mb-1">Description</label>
        <UTextarea
          v-model="localDescription"
          placeholder="Add a description..."
          size="sm"
          :rows="3"
        />
      </div>

      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-medium text-muted-foreground">Properties</label>
          <UButton
            variant="ghost"
            size="xs"
            icon="i-heroicons-plus"
            @click="addTrait"
          />
        </div>

        <div v-if="localTraits.length > 0" class="space-y-2">
          <div
            v-for="(trait, index) in localTraits"
            :key="index"
            class="flex items-center gap-2"
          >
            <UInput
              v-model="trait.trait_type"
              placeholder="Trait"
              size="sm"
              class="flex-1"
            />
            <UInput
              v-model="trait.value"
              placeholder="Value"
              size="sm"
              class="flex-1"
            />
            <UButton
              variant="ghost"
              icon="i-heroicons-x-mark"
              size="xs"
              @click="removeTrait(index)"
            />
          </div>
        </div>

        <p v-else class="text-xs text-muted-foreground">
          No properties set
        </p>
      </div>

      <UButton
        size="sm"
        class="w-full"
        @click="handleSave"
      >
        Save Changes
      </UButton>

      <USeparator />

      <UButton
        size="sm"
        color="error"
        variant="outline"
        class="w-full"
        icon="i-heroicons-trash"
        @click="warningMessage('Item deletion coming soon')"
      >
        Delete Item
      </UButton>
    </div>
  </div>
</template>
