<script lang="ts" setup>
</script>

<template>
  <div>
    <UContainer>
      <div class="flex flex-col items-center justify-center mt-4 mb-6 md:mt-[25px] md:mb-[35px]">
        <div class="font-medium text-3xl md:text-[51px] capitalize font-serif italic text-center text-foreground">
          {{ $t('landing.title') }}
        </div>
        <div class="text-base md:text-xl capitalize opacity-[0.66] text-center mt-2 text-muted-foreground">
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

    <!-- <LazyDropMintModal /> -->
  </div>
</template>
