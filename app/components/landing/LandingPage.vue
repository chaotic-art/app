<script lang="ts" setup>
</script>

<template>
  <div class="bg-background-color">
    <!-- Hero Section -->
    <section class="relative py-20 lg:py-32 overflow-hidden">
      <!-- Background -->
      <div class="absolute inset-0 bg-neutral-50 dark:bg-neutral-900" />

      <UContainer class="relative">
        <div class="text-center max-w-4xl mx-auto">
          <!-- Badge -->
          <UButton
            href="https://medium.com/chaoticart/chaotic-a-fresh-start-for-polkadot-nfts-c285c2d724f4"
            target="_blank"
            variant="outline"
            size="sm"
            class="mb-8 rounded-full"
          >
            <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
            <span class="text-sm font-medium">New: Chaotic NFT Marketplace Launch</span>
          </UButton>

          <!-- Main Heading -->
          <h1 class="text-4xl sm:text-5xl lg:text-7xl text-neutral-900 dark:text-white mb-6 leading-tight font-serif">
            Your
            <span class="text-neutral-500 italic">
              Polkadot
            </span>
            NFT
            <br>
            Marketplace
          </h1>

          <!-- Description -->
          <p class="text-xl text-neutral-600 dark:text-neutral-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            Create, collect, and sell extraordinary NFTs on the most advanced blockchain. Join thousands of artists and
            collectors in the decentralized future.
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <UButton
              to="/ahp/explore/collectibles"
              size="lg"
              variant="solid"
              class="px-8 py-3 text-lg"
            >
              Start Exploring
              <UIcon name="i-heroicons-arrow-right" class="ml-2 h-5 w-5" />
            </UButton>
            <UButton
              to="/create/nft"
              size="lg"
              variant="outline"
              class="px-8 py-3 text-lg"
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

    <!-- Curated Artists Section -->
    <LazyCuratedArtists />

    <UContainer>
      <LazyLandingTopCollections :hydrate-on-visible="{ rootMargin: '600px' }" />
      <!-- <LazyArticles :hydrate-on-visible="{ rootMargin: '300px' }" /> -->
    </UContainer>

    <!-- Partners Section -->
    <Partners />

    <LazyDropMintModal />
  </div>
</template>
