<script setup lang="ts">
defineProps<{
  title: string
  count?: string
  content?: string
  active?: boolean
}>()
</script>

<template>
  <UCard
    class="w-full h-[540px] transition-opacity overflow-y-auto duration-300"
    :class="{ 'opacity-50': !active }"
  >
    <template #header>
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-bold capitalize">
          {{ title }}
        </h2>
        <UBadge
          :label="count"
          size="lg"
          color="neutral"
          variant="soft"
        />
      </div>
    </template>

    <div class="space-y-4">
      <slot>
        <div v-if="content" class="w-full">
          <MarkdownPreview :source="content" />
        </div>
      </slot>
    </div>
  </UCard>
</template>
