<script setup lang="ts">
</script>

<template>
  <div class="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-neutral-700 bg-secondary">
    <div class="flex items-center flex-1 min-w-0">
      <!-- Avatar skeleton -->
      <USkeleton class="w-12 h-12 rounded-full mr-4 flex-shrink-0" />

      <!-- Content skeleton -->
      <div class="flex flex-col gap-1 min-w-0 flex-1">
        <!-- Name skeleton -->
        <USkeleton class="h-5 w-32 rounded" />

        <!-- Follower count skeleton -->
        <div class="flex items-center gap-1">
          <USkeleton class="h-4 w-8 rounded" />
          <USkeleton class="h-4 w-16 rounded" />
        </div>
      </div>
    </div>

    <!-- Button skeleton -->
    <USkeleton class="h-10 w-24 rounded-full flex-shrink-0" />
  </div>
</template>
