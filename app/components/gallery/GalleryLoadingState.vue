<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
    <!-- Media Skeleton -->
    <div class="order-2 lg:order-1">
      <div class="relative border border-border rounded-md overflow-hidden bg-secondary p-4">
        <div class="aspect-square bg-muted rounded-md animate-pulse flex items-center justify-center">
          <UIcon name="i-heroicons-photo" class="w-16 h-16 text-muted-foreground" />
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
      <div>
        <!-- Collection Information skeleton -->
        <div class="flex items-center gap-2 mb-4">
          <div class="w-6 h-6 rounded-md overflow-hidden bg-muted flex-shrink-0">
            <USkeleton class="w-full h-full" />
          </div>
          <USkeleton class="h-4 w-32" />
        </div>

        <!-- Title with Action Dropdown skeleton -->
        <div class="flex items-center justify-between gap-3 md:gap-4">
          <USkeleton class="h-12 md:h-14 lg:h-16 w-full" />
          <USkeleton class="h-7 w-7 rounded-full" />
        </div>
      </div>

      <!-- Creator and Owner Cards skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Creator Card skeleton -->
        <div class="p-6 bg-secondary rounded-md space-y-2">
          <USkeleton class="h-5 w-32" />
          <div class="flex items-center gap-3">
            <USkeleton class="w-10 h-10 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-3 w-20" />
            </div>
          </div>
        </div>

        <!-- Owner Card skeleton -->
        <div class="p-6 bg-secondary rounded-md space-y-2">
          <USkeleton class="h-5 w-16" />
          <div class="flex items-center gap-3">
            <USkeleton class="w-10 h-10 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-4 w-24" />
              <USkeleton class="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>

      <!-- Description skeleton -->
      <div class="space-y-2">
        <USkeleton class="h-4 w-full" />
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-4 w-1/2" />
      </div>

      <!-- Current Price Section skeleton -->
      <div class="space-y-3 bg-secondary rounded-md p-6">
        <USkeleton class="h-3 w-24" />
        <div class="flex items-baseline gap-2">
          <USkeleton class="h-8 w-32" />
          <USkeleton class="h-4 w-16" />
        </div>
      </div>
    </div>
  </div>
</template>
