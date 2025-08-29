<script lang="ts" setup>
// Partner data with existing logos from public/partners directory
const partners = [
  {
    name: 'Clover',
    logo: '/partners/logo-clover.png',
  },
  {
    name: 'Enkrypt',
    logo: '/partners/logo-enkrypt.png',
  },
  {
    name: 'Ledger',
    logo: '/partners/logo-ledger.svg',
  },
  {
    name: 'MathWallet',
    logo: '/partners/logo-mathwallet.png',
  },
  {
    name: 'Nova',
    logo: '/partners/logo-nova.png',
  },
  {
    name: 'Polkadot.js',
    logo: '/partners/logo-polkadot-js.png',
  },
  {
    name: 'Reown',
    logo: '/partners/logo-reown.png',
  },
  {
    name: 'SubWallet',
    logo: '/partners/logo-subwallet.svg',
  },
  {
    name: 'Talisman',
    logo: '/partners/logo-talisman.svg',
  },
]
</script>

<template>
  <section class="py-16 lg:py-24 relative overflow-hidden">
    <UContainer class="relative">
      <!-- Header Section -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center space-x-2 bg-background backdrop-blur rounded-full px-4 py-2 mb-6 border border-border">
          <UIcon name="i-heroicons-shield-check" class="h-4 w-4 text-foreground" />
          <span class="text-sm font-medium text-foreground">Trusted Partnerships</span>
        </div>

        <h2 class="text-3xl lg:text-4xl xl:text-5xl text-foreground mb-6 leading-tight font-serif">
          Our <span class="text-muted-foreground italic">Partners</span>
        </h2>
        <p class="text-lg text-primary max-w-3xl mx-auto leading-relaxed">
          We collaborate with leading projects in the blockchain ecosystem to bring you the best experience and build the future of Web3 together.
        </p>
      </div>

      <!-- Partners Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 lg:gap-8 mb-12">
        <div
          v-for="partner in partners"
          :key="partner.name"
          class="group relative"
        >
          <!-- Partner Card -->
          <div class="bg-background rounded-xl shadow-xs transition-all duration-500 transform hover:-translate-y-1 border border-border overflow-hidden">
            <!-- Card Content -->
            <div class="p-6 lg:p-8 flex flex-col items-center justify-center h-32 lg:h-36">
              <img
                :src="partner.logo"
                :alt="`${partner.name} logo`"
                class="object-contain max-h-12 lg:max-h-16 w-auto"
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center">
        <div class="inline-flex items-center space-x-3 bg-background rounded-2xl px-8 py-4 border border-border">
          <UIcon name="i-heroicons-rocket-launch" class="h-5 w-5 text-foreground" />
          <span class="text-foreground font-medium">Ready to partner with us?</span>
          <UButton
            variant="outline"
            size="sm"
            class="ml-2"
          >
            Get in Touch
          </UButton>
        </div>
      </div>
    </UContainer>
  </section>
</template>
