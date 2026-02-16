<script setup lang="ts">
defineProps<{
  name?: string
  description?: string
  image?: string
  banner?: string
}>()

const localDescription = ref('')
const isExpanded = ref(false)

function handleSave() {
  warningMessage('Coming soon — on-chain transactions will be wired in a future update.')
}
</script>

<template>
  <div class="border-b border-border">
    <button
      class="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <span>Details</span>
      <UIcon
        :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-4 h-4"
      />
    </button>

    <div v-if="isExpanded" class="px-4 pb-4 space-y-4">
      <div>
        <label class="text-xs font-medium text-muted-foreground block mb-1">Name</label>
        <UInput
          :model-value="name || ''"
          disabled
          size="sm"
        />
        <p class="text-xs text-muted-foreground mt-1">
          Cannot be changed after creation
        </p>
      </div>

      <div>
        <label class="text-xs font-medium text-muted-foreground block mb-1">Description</label>
        <UTextarea
          v-model="localDescription"
          :placeholder="description || 'Add a description...'"
          size="sm"
          :rows="3"
        />
      </div>

      <div>
        <label class="text-xs font-medium text-muted-foreground block mb-1">Logo</label>
        <div class="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
          <img
            v-if="image"
            :src="sanitizeIpfsUrl(image)"
            alt="Logo"
            class="w-full h-full object-cover rounded-lg"
          >
          <UIcon v-else name="i-heroicons-camera" class="w-6 h-6 text-muted-foreground" />
        </div>
      </div>

      <div>
        <label class="text-xs font-medium text-muted-foreground block mb-1">Banner</label>
        <div class="w-full h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
          <img
            v-if="banner"
            :src="sanitizeIpfsUrl(banner)"
            alt="Banner"
            class="w-full h-full object-cover rounded-lg"
          >
          <UIcon v-else name="i-heroicons-photo" class="w-6 h-6 text-muted-foreground" />
        </div>
      </div>

      <UButton
        size="sm"
        class="w-full"
        @click="handleSave"
      >
        Save Changes
      </UButton>
    </div>
  </div>
</template>
