<script lang="ts" setup>
interface Props {
  open: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'createCollection'): void
  (e: 'createNft'): void
  (e: 'massMint'): void
  (e: 'airdrop'): void
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
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <CreateOptionItem
          icon="i-heroicons-folder-plus"
          title="Create Collection"
          subtitle="Create a collection to group your NFTs together"
          @click="emit('createCollection')"
        />

        <CreateOptionItem
          icon="i-heroicons-photo"
          title="Create NFT"
          subtitle="Create a unique digital asset or artwork"
          @click="emit('createNft')"
        />

        <CreateOptionItem
          icon="i-heroicons-squares-2x2"
          title="Create Multiple NFTs"
          subtitle="Batch creation in one transaction"
          @click="emit('massMint')"
        />

        <CreateOptionItem
          icon="i-lucide-gift"
          title="Airdrop"
          subtitle="Send NFTs to multiple addresses"
          @click="emit('airdrop')"
        />
      </div>
    </template>
  </UModal>
</template>
