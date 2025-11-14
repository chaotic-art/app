<script lang="ts" setup>
defineProps<{
  step: string
  title: string
  subtitle: string
}>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-6">
    <div class="px-4 py-2 bg-muted text-xl rounded-full">
      {{ step }}
    </div>
    <div class="flex flex-col justify-center capitalize">
      <h1 class="text-3xl font-bold">
        {{ title }}
      </h1>
      <p class="text-2xl">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
