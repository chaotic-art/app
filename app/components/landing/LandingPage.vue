<script lang="ts" setup>
</script>

<template>
  <div>
    <!-- <img
      src="/img/landing/landing-bg.png" alt="Landing Background" class="w-full h-full object-cover bg-transparent opacity-[10%] mix-blend-exclusion"
    > -->
    <Navbar />

    <UContainer>
      <div class="flex flex-col items-center justify-center mt-4 mb-6 md:mt-[25px] md:mb-[35px] px-4">
        <div class="font-medium text-3xl md:text-[51px] capitalize font-serif italic text-center">
          {{ $t('landing.title') }}
        </div>
        <div class="text-base md:text-xl capitalize opacity-[0.66] text-center mt-2">
          {{ $t('landing.subtitle') }}
        </div>
      </div>

      <!-- <LandingDropBanner /> -->
    </UContainer>

    <!-- <LandingArtistsList /> -->

    <UContainer>
      <!-- <LazyLandingTopCollections /> -->
      <Articles />
    </UContainer>
  </div>
</template>
