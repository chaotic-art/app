<script setup lang="ts">
defineProps<{
  massMintLink: string
}>()
</script>

<template>
  <div class="text-center py-20">
    <UIcon name="i-heroicons-rectangle-stack" class="w-16 h-16 mx-auto text-muted-foreground mb-4" />
    <h2 class="text-xl font-semibold mb-2">
      Your collection is empty
    </h2>
    <p class="text-muted-foreground mb-6">
      Start by minting your first NFTs into this collection.
    </p>
    <UButton
      size="lg"
      icon="i-heroicons-sparkles"
      :to="massMintLink"
    >
      Mass Mint
    </UButton>
  </div>
</template>
