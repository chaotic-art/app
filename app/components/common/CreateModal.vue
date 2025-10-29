<script lang="ts" setup>
interface Props {
  open: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'createCollection'): void
  (e: 'createNft'): void
  (e: 'massMint'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed property to handle two-way binding properly
const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value) {
      emit('close')
    }
  },
})
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="What would you like to create?"
    description="Choose the type of creation you'd like to make"
    class="max-w-3xl"
  >
    <template #body>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Create Collection Option -->
        <div
          class="group relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer bg-background-color-secondary hover:shadow-lg"
          @click="emit('createCollection')"
        >
          <div class="p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-background-color-secondary flex items-center justify-center">
              <UIcon name="i-heroicons-folder-plus" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Create Collection
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Create a collection to group your NFTs together
            </p>
          </div>
        </div>

        <!-- Create NFT Option -->
        <div
          class="group relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer bg-background-color-secondary hover:shadow-lg"
          @click="emit('createNft')"
        >
          <div class="p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-background-color-secondary flex items-center justify-center">
              <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Create NFT
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Create a unique digital asset or artwork
            </p>
          </div>
        </div>

        <!-- Create Mass Mint Option -->
        <div
          class="group relative overflow-hidden rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 cursor-pointer bg-background-color-secondary hover:shadow-lg"
          @click="emit('massMint')"
        >
          <div class="p-6 text-center">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-background-color-secondary flex items-center justify-center">
              <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Create Multiple NFTs
            </h4>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Batch creation in one transaction
            </p>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
