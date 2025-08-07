<script lang="ts" setup>
</script>

<template>
  <div class="bg-background-color">
    <!-- <img
      src="/img/landing/landing-bg.png" alt="Landing Background" class="w-full h-full object-cover bg-transparent opacity-[10%] mix-blend-exclusion"
    > -->
    <Navbar />

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
