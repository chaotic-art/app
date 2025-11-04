<script setup lang="ts">
defineProps<{
  customMenuClass?: string
}>()

defineEmits(['update:modelValue'])

const EXPIRATION_DAYS_LIST = [1, 3, 7, 14, 30]

const options = EXPIRATION_DAYS_LIST.map(value => ({
  value,
  label: `${value} Day${value > 1 ? 's' : ''}`,
}))

const selected = defineModel({
  type: Number,
  default: 7,
})

const formattedExpirationTime = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + selected.value!)
  return date.toLocaleString(undefined, {
    month: 'numeric',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })
})
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <span>{{ formattedExpirationTime }}</span>
    <USelect v-model="selected" value-key="value" :items="options" class="w-32" size="lg" />
  </div>
</template>
