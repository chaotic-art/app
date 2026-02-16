<script setup lang="ts">
defineProps<{
  selectedCount: number
}>()

const emit = defineEmits<{
  clear: []
  airdrop: []
  list: []
  transfer: []
}>()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="selectedCount > 0"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-background border border-border rounded-2xl shadow-2xl px-6 py-3 flex items-center gap-4"
    >
      <span class="text-sm font-medium whitespace-nowrap">
        {{ selectedCount }} selected
      </span>

      <USeparator orientation="vertical" class="h-6" />

      <!-- Transactional actions -->
      <div class="flex items-center gap-2">
        <UButton
          size="sm"
          variant="outline"
          icon="i-heroicons-paper-airplane"
          @click="emit('airdrop')"
        >
          Airdrop
        </UButton>
        <UButton
          size="sm"
          variant="outline"
          icon="i-heroicons-tag"
          @click="emit('list')"
        >
          List
        </UButton>
        <UButton
          size="sm"
          variant="outline"
          icon="i-heroicons-arrow-right-circle"
          @click="emit('transfer')"
        >
          Transfer
        </UButton>
      </div>

      <USeparator orientation="vertical" class="h-6" />

      <UButton
        size="sm"
        variant="ghost"
        icon="i-heroicons-x-mark"
        @click="emit('clear')"
      >
        Clear
      </UButton>
    </div>
  </Transition>
</template>
