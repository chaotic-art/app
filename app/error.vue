<script lang="ts" setup>
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()
// const { urlPrefix } = usePrefix()
const headline = computed(() => {
  switch (props.error?.statusCode) {
    case 404:
      return 'Page not found'
    case 410:
      return 'Page gone'
    case 500:
      return 'Internal Server Error'
    default:
      return 'Indexer Error'
  }
})
</script>

<template>
  <div id="Error" class="min-h-screen flex items-center justify-center py-16 px-4">
    <UContainer>
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-5xl font-bold mb-4 text-gray-800">
          {{ error.statusCode }} - {{ headline }}
        </h1>

        <p class="text-xl text-gray-600 mb-6">
          {{ error.message || 'Something went wrong' }}
        </p>

        <p v-if="error.cause" class="text-lg text-gray-500 mb-8">
          Cause: {{ error.cause }}
        </p>

        <div class="mb-10 rounded-lg overflow-hidden shadow-lg">
          <img
            :src="`https://http.cat/${error.statusCode}`"
            alt="Internal error cat"
            class="w-full"
          >
        </div>

        <div class="mb-8">
          <p class="text-lg text-gray-600">
            If you think this shouldn't happen, report it to us by
            <a
              target="_blank"
              class="text-primary-600 hover:text-primary-800 font-medium"
              rel="nofollow noopener noreferrer"
              href="TODO"
            >creating a bug issue with steps and screenshot to reproduce.</a>
          </p>
        </div>

        <UButton
          to="/"
          color="primary"
          size="lg"
          class="mx-auto"
        >
          Return to Home
        </UButton>

        <!-- <nuxt-link
          :to="`/${urlPrefix}/explore/collectibles`"
          class="text-k-blue hover:text-k-blue-hover"
        >
          Explore NFTs and Collections
        </nuxt-link> -->
      </div>
    </UContainer>
  </div>
</template>
