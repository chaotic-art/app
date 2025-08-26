<script setup lang="ts">
const dropStore = useDropStore()
const { drop } = useDrop()

onBeforeMount(() => dropStore.reset())
onUnmounted(() => dropStore.reset())

useSeoMeta({
  title: () => drop.value.name,
  description: () => drop.value.collectionDescription?.slice(0, 150),
  ogImage: () => `https://ogi.koda.art/__og-image__/image/${drop.value.chain}/drops/${drop.value.alias}/og.png`, // TODO: at the moment satori somehow doesn't work on cf-pages (defineOgImageComponent)
})
</script>

<template>
  <GenerativeDrop />
</template>
