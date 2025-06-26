<template>
  <div class="space-y-6">
    <USkeleton class="h-8 w-56 rounded" />

    <div class="space-y-4">
      <USkeleton class="h-5 w-48" />

      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div class="relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
          <div class="flex flex-col items-center space-y-3">
            <div class="flex -space-x-2">
              <USkeleton class="w-6 h-6 rounded-full" />
              <USkeleton class="w-6 h-6 rounded-full" />
            </div>
            <USkeleton class="h-3 w-20" />
          </div>
        </div>

        <div v-for="i in 10" :key="i" class="relative p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
          <div class="flex flex-col items-center space-y-3">
            <USkeleton class="w-6 h-6 rounded" />
            <div class="flex flex-col space-y-0.5 items-center">
              <USkeleton class="h-4 w-16" />
              <USkeleton class="h-3 w-12" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
