<script lang="ts" setup>
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="relative py-16 lg:py-32 overflow-hidden bg-muted">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-10 dark:opacity-20">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0); background-size: 24px 24px;" />
      </div>

      <UContainer class="relative">
        <div class="text-center max-w-4xl mx-auto">
          <!-- Badge -->
          <UButton
            href="https://medium.com/chaoticart/chaotic-a-fresh-start-for-polkadot-nfts-c285c2d724f4"
            target="_blank"
            variant="outline"
            size="sm"
            class="mb-8"
          >
            <UIcon name="i-heroicons-sparkles" class="h-4 w-4" />
            <span class="text-sm font-medium">New: Chaotic NFT Marketplace Launch</span>
          </UButton>

          <!-- Main Heading -->
          <h1 class="text-4xl sm:text-5xl lg:text-7xl text-foreground mb-6 leading-tight font-serif">
            Your
            <span class="text-muted-foreground italic">
              Polkadot
            </span>
            NFT
            <br>
            Marketplace
          </h1>

          <!-- Description -->
          <p class="text-xl text-primary mb-10 max-w-3xl mx-auto leading-relaxed">
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
    <!-- <LazyFeaturedNFT :hydrate-on-visible="{ rootMargin: '600px' }" /> -->

    <!-- Latest Drops Section -->
    <!-- <LazyLatestDrops :hydrate-on-visible="{ rootMargin: '600px' }" /> -->

    <!-- Curated Artists Section -->
    <LazyCuratedArtists :hydrate-on-visible="{ rootMargin: '600px' }" />

    <div class="bg-muted py-16">
      <UContainer>
        <LazyLandingTopCollections :hydrate-on-visible="{ rootMargin: '600px' }" />
      <!-- <LazyArticles :hydrate-on-visible="{ rootMargin: '300px' }" /> -->
      </UContainer>
    </div>

    <!-- Partners Section -->
    <LazyPartners :hydrate-on-visible="{ rootMargin: '600px' }" />

    <LazyDropMintModal />
  </div>
</template>
