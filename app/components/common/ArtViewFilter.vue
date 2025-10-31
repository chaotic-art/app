<script lang="ts" setup>
const route = useRoute()
const router = useRouter()

const { artViewFilter } = storeToRefs(usePreferencesStore())

const artView = computed({
  get: () => route.query?.art_view?.toString() === 'true' || artViewFilter.value,
  set: (value) => {
    router.replace({ query: { ...route.query, art_view: String(value) } })
    artViewFilter.value = value
  },
})
</script>

<template>
  <USwitch
    v-model="artView"
    unchecked-icon="i-lucide-id-card"
    checked-icon="i-lucide-vector-square"
  />
</template>
