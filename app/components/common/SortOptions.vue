<script setup lang="ts">
interface SortOption {
  label: string
  value: string
  icon?: string
}

interface Props {
  modelValue: string
  options?: SortOption[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: 'Sort by...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectedSort = computed({
  get: () => props.modelValue,
  set: (value: string) => emit('update:modelValue', value),
})
</script>

<template>
  <USelectMenu
    v-model="selectedSort"
    :items="options"
    value-key="value"
    :placeholder="placeholder"
    class="w-40"
    :search-input="false"
    :ui="{ content: 'min-w-50' }"
  />
</template>
