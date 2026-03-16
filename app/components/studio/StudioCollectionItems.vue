<script setup lang="ts">
const props = defineProps<{
  collectionId: string
}>()
</script>

<template>
  <ProfileNftsList hide-chain-switcher :extra-variables="{ collections: [props.collectionId] }" />
</template>
