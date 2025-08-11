<script lang="ts" setup>
import type { Profile } from '@/services/profile'
import { getDrops } from '@/services/fxart'
import { fetchProfileByAddress } from '@/services/profile'
import { shortenAddress } from '~/utils/format/address'

const { prefix } = usePrefix()

// Reactive state
const curatedArtists = ref<Profile[]>([])
const isLoading = ref(true)

// Fetch data using watchEffect
watchEffect(async () => {
  try {
    isLoading.value = true

    // Fetch drops
    const drops = await getDrops({
      active: [true],
      chain: [prefix.value],
      limit: 50,
    })

    // Extract unique artists and get random selection
    const artists = [...new Set(drops.map(drop => drop.creator).filter(Boolean))]
    const randomArtists = artists.slice().sort(() => Math.random() - 0.5).slice(0, 6)

    if (randomArtists.length > 0) {
      // Fetch individual profiles for each artist using Promise.all
      const profilePromises = randomArtists
        .filter((artist): artist is string => Boolean(artist))
        .map(address => fetchProfileByAddress(address))
      curatedArtists.value = await Promise.all(profilePromises)
    }
    else {
      curatedArtists.value = []
    }
  }
  catch (error) {
    console.error('Failed to fetch data:', error)
    curatedArtists.value = []
  }
  finally {
    isLoading.value = false
  }
})
</script>

<template>
  <section class="py-16 lg:py-24">
    <UContainer>
      <div class="text-center mb-12">
        <h2 class="text-3xl lg:text-4xl xl:text-5xl text-neutral-900 dark:text-white mb-6 leading-tight font-serif">
          Curated <span class="text-neutral-500 italic">Artists</span>
        </h2>
        <p class="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
          Follow your favorite creators and discover new talent in our carefully selected artist community
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg overflow-hidden">
          <div class="h-24 bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
          <div class="px-6 pb-6 -mt-8 relative">
            <div class="flex items-start sm:items-center justify-between mb-4 flex-col sm:flex-row">
              <div class="h-16 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse" />
              <div class="h-8 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mt-2 sm:mt-0" />
            </div>
            <div class="space-y-2">
              <div class="h-4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-3/4" />
              <div class="h-3 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse w-1/2" />
            </div>
          </div>
        </div>
      </div>

      <!-- Artists Grid -->
      <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <NuxtLink
          v-for="artist in curatedArtists"
          :key="artist.address"
          :to="`/${prefix}/u/${artist.address}`"
          class="block bg-white dark:bg-neutral-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
        >
          <!-- Cover Image Section -->
          <div class="relative h-32 overflow-hidden">
            <div
              v-if="artist.image"
              class="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
              :style="{ backgroundImage: `url(${artist.image})` }"
            />
            <div
              v-else
              class="w-full h-full bg-gradient-to-r from-neutral-600 to-neutral-800 group-hover:scale-105 transition-transform duration-500"
            />
            <!-- Overlay for better text readability -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

            <!-- Avatar and Follow Button positioned over the cover image -->
            <div class="absolute bottom-0 left-0 right-0 px-6 pb-4">
              <div class="flex items-end justify-between">
                <div class="relative">
                  <ProfileAvatar
                    :address="artist.address"
                    :avatar-size="80"
                    class="border-4 border-white shadow-lg rounded-full"
                  />
                </div>

                <FollowButton
                  v-if="artist.address"
                  :target="artist.address"
                  class="bg-white hover:bg-neutral-50 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-600 rounded-full transition-all duration-200 hover:scale-105"
                />
              </div>
            </div>
          </div>

          <!-- Content Section -->
          <div class="px-6 pb-6 pt-4 relative">
            <!-- Artist Info -->
            <div class="space-y-3">
              <div>
                <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-1 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                  {{ artist.name || 'Unknown Artist' }}
                </h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400 font-medium">
                  @{{ artist.address ? shortenAddress(artist.address).toLowerCase().replace(/\s+/g, '_') : 'artist' }}
                </p>
              </div>

              <!-- Artist Description -->
              <p v-if="artist.description" class="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed line-clamp-2">
                {{ artist.description }}
              </p>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="text-center">
        <UButton
          variant="outline"
          color="neutral"
          to="/ahp/artists"
          class="px-8 py-2 rounded-full"
        >
          Explore Artists
        </UButton>
      </div>
    </UContainer>
  </section>
</template>
