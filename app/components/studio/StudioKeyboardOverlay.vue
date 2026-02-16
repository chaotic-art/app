<script setup lang="ts">
defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const isMac = ref(true)

onMounted(() => {
  isMac.value = navigator.platform.toUpperCase().includes('MAC')
})

const mod = computed(() => isMac.value ? '⌘' : 'Ctrl')

const shortcuts = computed(() => [
  { keys: `${mod.value}+S`, label: 'Save changes' },
  { keys: `${mod.value}+A`, label: 'Select all items' },
  { keys: `${mod.value}+Enter`, label: 'Proceed / Continue' },
  { keys: 'Escape', label: 'Close panel / Go back' },
  { keys: '?', label: 'Show this overlay' },
])
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center"
        @click="emit('close')"
      >
        <div
          class="bg-background rounded-2xl shadow-2xl border border-border w-[380px] max-w-[90vw]"
          @click.stop
        >
          <div class="flex items-center justify-between p-4 border-b border-border">
            <h3 class="font-semibold text-sm">
              Keyboard Shortcuts
            </h3>
            <UButton
              variant="ghost"
              size="xs"
              icon="i-heroicons-x-mark"
              @click="emit('close')"
            />
          </div>

          <div class="p-4 space-y-3">
            <div
              v-for="shortcut in shortcuts"
              :key="shortcut.keys"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-muted-foreground">{{ shortcut.label }}</span>
              <kbd class="px-2 py-1 bg-muted rounded text-xs font-mono font-medium">
                {{ shortcut.keys }}
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
