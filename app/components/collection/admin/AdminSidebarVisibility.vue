<script setup lang="ts">
const isExpanded = ref(false)
const isPublished = ref(true)
const isNsfw = ref(false)

function handleToggle() {
  warningMessage('Coming soon — visibility settings will be wired in a future update.')
}
</script>

<template>
  <div class="border-b border-border">
    <button
      class="flex items-center justify-between w-full px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <span>Visibility</span>
      <UIcon
        :name="isExpanded ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
        class="w-4 h-4"
      />
    </button>

    <div v-if="isExpanded" class="px-4 pb-4 space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-sm">Published</span>
        <USwitch v-model="isPublished" size="sm" @update:model-value="handleToggle" />
      </div>

      <div class="flex items-center justify-between">
        <span class="text-sm">NSFW</span>
        <USwitch v-model="isNsfw" size="sm" @update:model-value="handleToggle" />
      </div>
    </div>
  </div>
</template>
