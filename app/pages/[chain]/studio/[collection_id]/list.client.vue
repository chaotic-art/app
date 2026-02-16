<script setup lang="ts">
import { useStudioCollection } from '~/composables/studio/useStudioCollection'

const route = useRoute()
const collection = useStudioCollection()

const backLink = computed(() =>
  `/${route.params.chain}/studio/${route.params.collection_id}`,
)
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full py-24 px-6 text-center">
    <div class="border border-dashed border-border rounded-xl p-10 max-w-md space-y-4">
      <UIcon name="i-heroicons-tag" class="w-12 h-12 mx-auto text-muted-foreground" />
      <h2 class="text-lg font-semibold">
        Bulk Listing
      </h2>
      <p class="text-sm text-muted-foreground">
        This feature is a work in progress. Bulk listing for <span class="font-medium text-foreground">{{ collection.name }}</span> will be available soon.
      </p>
      <UButton
        variant="outline"
        :to="backLink"
      >
        Back to Items
      </UButton>
    </div>
  </div>
</template>
