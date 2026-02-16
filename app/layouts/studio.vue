<template>
  <div class="min-h-screen w-full bg-background flex">
    <slot />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 150ms ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
