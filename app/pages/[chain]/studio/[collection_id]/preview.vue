<script setup lang="ts">
import { useStudioCollection } from '~/composables/studio/useStudioCollection'

const collection = useStudioCollection()
</script>

<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-xl font-bold mb-1">
        Preview
      </h1>
      <p class="text-sm text-muted-foreground">
        This is how visitors see your collection.
      </p>
    </div>

    <CollectionDisplay
      :name="collection.name"
      :description="collection.description"
      :image="collection.image"
      :banner="collection.banner"
      :owner="collection.owner"
      :supply="collection.supply"
      :claimed="collection.claimed"
      :floor="collection.floor"
      :chain="collection.chain"
      :collection-id="collection.id"
      :read-only="true"
    />
  </div>
</template>
