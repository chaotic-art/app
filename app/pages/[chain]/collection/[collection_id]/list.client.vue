<script setup lang="ts">
definePageMeta({
  layout: 'no-footer',
})

const route = useRoute()
const router = useRouter()
const { chain: chainPrefix, collection_id } = route.params

onMounted(() => {
  const mockQuery = route.query.mock === 'true' ? '?mock=true' : ''
  router.replace(`/${chainPrefix}/studio/${collection_id}/list${mockQuery}`)
})
</script>

<template>
  <div />
</template>
