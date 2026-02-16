<script setup lang="ts">
defineEmits<{
  click: []
}>()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="-translate-y-2 opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="-translate-y-2 opacity-0"
  >
    <button
      v-show="true"
      class="absolute top-4 right-4 z-40 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-3.5 py-2 rounded-lg shadow-lg hover:bg-black/90 transition-colors"
      @click="$emit('click')"
    >
      <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4" />
      <span class="text-sm font-medium">Manage</span>
    </button>
  </Transition>
</template>
