<template>
  <div>
    <div class="flex justify-between items-center mb-4 mt-1">
      <USkeleton class="h-4 w-12" />
      <USkeleton class="h-8 w-24 rounded-md" />
    </div>

    <div class="flex flex-col gap-2 mb-4">
      <USkeleton class="h-4 w-full rounded-full" />
      <div class="flex justify-between">
        <USkeleton class="h-3 w-6" />
        <USkeleton class="h-3 w-8" />
      </div>
    </div>

    <div class="flex gap-2">
      <USkeleton class="h-10 flex-1 rounded-md" />
      <USkeleton class="h-10 flex-1 rounded-md" />
    </div>
  </div>
</template>
