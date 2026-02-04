<script setup lang="ts">
import { useWindowScroll } from '@vueuse/core'

const scrollThreshold = 400
const { y } = useWindowScroll()

const isVisible = computed(() => y.value > scrollThreshold)

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-4 scale-95"
  >
    <div v-if="isVisible" class="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
      <UButton
        icon="i-heroicons-chevron-up"
        color="primary"
        variant="solid"
        size="lg"
        class="w-10 h-10 rounded-full shadow-lg hover:shadow-xl transition-shadow duration-200"
        aria-label="Scroll to top"
        @click="scrollToTop"
      />
    </div>
  </Transition>
</template>
