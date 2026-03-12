<script setup lang="ts">
const props = defineProps<{
  collectionId: string
}>()

const { accountId } = useAuth()
</script>

<template>
  <ProfileNftsList hide-chain-switcher :extra-variables="{ owner: accountId, collections: [props.collectionId] }" />
</template>
