<script lang="ts" setup>
</script>

<template>
  <div>
    <!-- <img
      src="/img/landing/landing-bg.png" alt="Landing Background" class="w-full h-full object-cover bg-transparent opacity-[10%] mix-blend-exclusion"
    > -->
    <Navbar />

    <UContainer>
      <div class="flex flex-col items-center justify-center mt-[25px] mb-[35px]">
        <div class="font-medium text-[51px] capitalize font-serif italic">
          {{ $t('landing.title') }}
        </div>
        <div class="text-xl capitalize opacity-[0.66]">
          {{ $t('landing.subtitle') }}
        </div>
      </div>

      <LandingDropBanner />
    </UContainer>

    <LandingArtistsList />

    <UContainer>
      <LandingTopCollections />
      <Articles />
    </UContainer>
  </div>
</template>
