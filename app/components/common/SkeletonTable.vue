<template>
  <div class="space-y-2">
    <USkeleton class="h-10 w-full rounded-md" />
    <USkeleton v-for="n in 6" :key="n" class="h-12 w-full rounded-md" />
  </div>
</template>
