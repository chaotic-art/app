<script setup lang="ts">
import { defaultSortOptions } from '~/composables/useSortOptions'

interface SortOption {
  label: string
  value: string
  icon: string
}

interface Props {
  modelValue: string
  options?: SortOption[]
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => defaultSortOptions,
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
  <USelect
    v-model="selectedSort"
    :items="options"
    :placeholder="placeholder"
  />
</template>
