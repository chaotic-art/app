<script lang="ts" setup>
</script>

<template>
  <div class="bg-background-color">
    <Navbar />

    <!-- Hero Section -->
    <section class="relative py-20 lg:py-32 overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 bg-neutral-50 dark:bg-neutral-900" />
      <!-- <div class="absolute inset-0 bg-[url('/img/landing/landing-bg.png')] opacity-5 dark:opacity-10" /> -->

      <UContainer class="relative">
        <div class="text-center max-w-4xl mx-auto">
          <!-- Badge -->
          <div class="inline-flex items-center space-x-2 bg-white/80 dark:bg-neutral-800/80 backdrop-blur rounded-full px-4 py-2 mb-8 border border-neutral-200 dark:border-neutral-700">
            <UIcon name="i-heroicons-sparkles" class="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">New: Polkadot Integration Live</span>
          </div>

          <!-- Main Heading -->
          <h1 class="text-4xl sm:text-5xl lg:text-7xl font-bold text-neutral-900 dark:text-white mb-6 leading-tight">
            Your
            <span class="text-neutral-900 dark:text-white">
              Polkadot
            </span>
            NFT
            <br>
            Marketplace
          </h1>

          <!-- Description -->
          <p class="text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Create, collect, and sell extraordinary NFTs on the most advanced blockchain. Join thousands of artists and
            collectors in the decentralized future.
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <UButton
              size="lg"
              variant="solid"
              class="px-8 py-3 text-lg bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
              Start Exploring
              <UIcon name="i-heroicons-arrow-right" class="ml-2 h-5 w-5" />
            </UButton>
            <UButton
              size="lg"
              variant="outline"
              class="px-8 py-3 text-lg border-2 bg-transparent border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              Create NFT
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Featured NFT Section -->
    <FeaturedNFT />

    <!-- Latest Drops Section -->
    <LatestDrops />

    <UContainer>
      <div class="flex flex-col items-center justify-center mt-4 mb-6 md:mt-[25px] md:mb-[35px]">
        <div class="font-medium text-3xl md:text-[51px] capitalize font-serif italic text-center text-gray-900 dark:text-white">
          {{ $t('landing.title') }}
        </div>
        <div class="text-base md:text-xl capitalize opacity-[0.66] text-center mt-2 text-gray-700 dark:text-gray-300">
          {{ $t('landing.subtitle') }}
        </div>
      </div>

      <LandingDropBanner />
    </UContainer>

    <LazyLandingArtistsList :hydrate-on-visible="{ rootMargin: '600px' }" />

    <UContainer>
      <LazyLandingTopCollections :hydrate-on-visible="{ rootMargin: '600px' }" />
      <!-- <LazyArticles :hydrate-on-visible="{ rootMargin: '300px' }" /> -->
    </UContainer>

    <LazyDropMintModal />
  </div>
</template>
