<script lang="ts" setup>
interface Props {
  icon: string
  title: string
  subtitle: string
}

defineProps<Props>()

const emit = defineEmits<{
  click: []
}>()

function handleClick() {
  emit('click')
}
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-lg border-2 border-border transition-all duration-200 cursor-pointer bg-background-color-secondary hover:shadow-lg"
    @click="handleClick"
  >
    <div class="p-6 text-center">
      <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-background-color-secondary flex items-center justify-center">
        <UIcon :name="icon" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
      </div>
      <h4 class="text-lg font-semibold text-foreground mb-2">
        {{ title }}
      </h4>
      <p class="text-sm text-muted-foreground">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
