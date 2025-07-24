<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
    <!-- Media Skeleton -->
    <div class="order-2 lg:order-1">
      <div class="relative border border-gray-200 dark:border-neutral-700 rounded-2xl overflow-hidden bg-white dark:bg-neutral-900 p-4">
        <div class="aspect-square bg-gray-200 dark:bg-neutral-800 rounded-xl animate-pulse flex items-center justify-center">
          <UIcon name="i-heroicons-photo" class="w-16 h-16 text-gray-400" />
        </div>
        <!-- Toolbar skeleton -->
        <div class="flex items-center justify-between mt-4">
          <div class="flex items-center gap-2">
            <USkeleton class="w-8 h-8 rounded-full" />
            <USkeleton class="w-8 h-8 rounded-full" />
          </div>
          <USkeleton class="w-8 h-8 rounded-full" />
        </div>
      </div>
    </div>

    <!-- Details Skeleton -->
    <div class="order-1 lg:order-2 space-y-6">
      <!-- Title skeleton -->
      <USkeleton class="h-16 w-full" />

      <!-- Owner section skeleton -->
      <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 bg-white dark:bg-neutral-900">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <USkeleton class="w-12 h-12 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-3 w-16" />
              <USkeleton class="h-4 w-32" />
            </div>
          </div>
          <USkeleton class="h-10 w-24 rounded-full" />
        </div>
      </div>

      <!-- Description skeleton -->
      <div class="space-y-2">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
      </div>

      <!-- Price section skeleton -->
      <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 bg-white dark:bg-neutral-900">
        <div class="flex items-center justify-between mb-4">
          <div class="space-y-2">
            <USkeleton class="h-8 w-32" />
            <USkeleton class="h-4 w-20" />
          </div>
          <div class="space-y-2">
            <USkeleton class="h-4 w-8" />
            <USkeleton class="h-6 w-16" />
          </div>
        </div>
        <div class="flex gap-2">
          <USkeleton class="h-10 w-24 rounded-full" />
          <USkeleton class="h-10 w-24 rounded-full" />
        </div>
      </div>

      <!-- Token info skeleton -->
      <div class="border border-gray-200 dark:border-neutral-700 rounded-2xl p-4 bg-white dark:bg-neutral-900 space-y-3">
        <div class="flex justify-between items-center">
          <USkeleton class="h-4 w-24" />
          <USkeleton class="h-4 w-16" />
        </div>
        <div class="flex justify-between items-center">
          <USkeleton class="h-4 w-20" />
          <USkeleton class="h-4 w-12" />
        </div>
        <div class="flex justify-between items-center">
          <USkeleton class="h-4 w-16" />
          <USkeleton class="h-4 w-20" />
        </div>
      </div>
    </div>
  </div>
</template>
