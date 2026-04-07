<script setup lang="ts">
import { useActionCartStore } from '@/stores/actionCart'

const props = defineProps<{
  collectionId: string
}>()
const actionCartStore = useActionCartStore()
onUnmounted(() => {
  actionCartStore.clear()
})
</script>

<template>
  <ProfileNftsList hide-chain-switcher :extra-variables="{ collections: [props.collectionId] }" />
</template>
