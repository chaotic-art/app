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
  <section class="py-16 lg:py-24 bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 relative overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5 dark:opacity-10">
      <div class="absolute inset-0" style="background-image: radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0); background-size: 24px 24px;" />
    </div>

    <UContainer class="relative">
      <!-- Header Section -->
      <div class="text-center mb-16">
        <div class="inline-flex items-center space-x-2 bg-white/80 dark:bg-neutral-800/80 backdrop-blur rounded-full px-4 py-2 mb-6 border border-neutral-200 dark:border-neutral-700">
          <UIcon name="i-heroicons-shield-check" class="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
          <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Trusted Partnerships</span>
        </div>

        <h2 class="text-3xl lg:text-4xl xl:text-5xl text-neutral-900 dark:text-white mb-6 leading-tight font-serif">
          Our <span class="text-neutral-500 italic">Partners</span>
        </h2>
        <p class="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto leading-relaxed">
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
          <div class="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border border-neutral-200 dark:border-neutral-700 overflow-hidden group-hover:border-neutral-300 dark:group-hover:border-neutral-600">
            <!-- Card Content -->
            <div class="p-6 lg:p-8 flex flex-col items-center justify-center h-32 lg:h-36 transition-all duration-300 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-700">
              <img
                :src="partner.logo"
                :alt="`${partner.name} logo`"
                class="object-contain max-h-12 lg:max-h-16 w-auto transition-all duration-500 group-hover:scale-125 group-hover:drop-shadow-lg"
              >
            </div>

            <!-- Hover Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end">
              <div class="p-4 w-full text-center transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <p class="text-white font-semibold text-sm">
                  {{ partner.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Floating Badge -->
          <div class="absolute -top-2 -right-2 w-6 h-6 bg-green-500 dark:bg-green-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100 shadow-lg">
            <UIcon name="i-heroicons-check" class="h-3 w-3 text-white" />
          </div>
        </div>
      </div>

      <!-- Call to Action -->
      <div class="text-center">
        <div class="inline-flex items-center space-x-3 bg-white dark:bg-neutral-800 rounded-2xl px-8 py-4 shadow-lg border border-neutral-200 dark:border-neutral-700">
          <UIcon name="i-heroicons-rocket-launch" class="h-5 w-5 text-neutral-600 dark:text-neutral-400" />
          <span class="text-neutral-700 dark:text-neutral-300 font-medium">Ready to partner with us?</span>
          <UButton
            variant="outline"
            size="sm"
            color="neutral"
            class="ml-2"
          >
            Get in Touch
          </UButton>
        </div>
      </div>
    </UContainer>
  </section>
</template>
