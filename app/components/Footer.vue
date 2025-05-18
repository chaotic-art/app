<script lang="ts" setup>
</script>

<template>
  <footer class="mt-16 bg-gray-50">
    <UContainer class="px-4 py-12">
      <!-- Main Footer Content -->
      <div class="mb-16 flex flex-col md:flex-row justify-between">
        <!-- Become Artist Section -->
        <div class="max-w-xs mb-8 md:mb-0">
          <h2 class="text-3xl font-bold mb-2">
            Become artist
          </h2>
          <h2 class="text-3xl font-bold mb-6">
            on Polkadot
          </h2>
          <UButton label="Get In Touch" variant="solid" color="primary" />
        </div>

        <!-- Footer Links -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Incentives Column -->
          <div>
            <h3 class="text-xl font-bold mb-4">
              Incentives
            </h3>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-primary-500">Developers</a></li>
              <li><a href="#" class="hover:text-primary-500">FAQ</a></li>
              <li><a href="#" class="hover:text-primary-500">Referral Program</a></li>
              <li><a href="#" class="hover:text-primary-500">Artist Program</a></li>
            </ul>
          </div>

          <!-- DotMint Column -->
          <div>
            <h3 class="text-xl font-bold mb-4">
              DotMint
            </h3>
            <ul class="space-y-2">
              <li><a href="#" class="hover:text-primary-500">Why Dotmint</a></li>
              <li><a href="#" class="hover:text-primary-500">FAQ</a></li>
              <li><a href="#" class="hover:text-primary-500">Tutorials</a></li>
              <li><a href="#" class="hover:text-primary-500">Blog</a></li>
              <li><a href="#" class="hover:text-primary-500">Privacy</a></li>
              <li><a href="#" class="hover:text-primary-500">Presskit</a></li>
            </ul>
          </div>

          <!-- Social Column -->
          <div>
            <h3 class="text-xl font-bold mb-4">
              Social
            </h3>
            <div class="flex flex-wrap gap-2">
              <UButton label="Twitter" variant="outline" size="sm" class="rounded-full" />
              <UButton label="Youtube" variant="outline" size="sm" class="rounded-full" />
              <UButton label="Instagram" variant="outline" size="sm" class="rounded-full" />
              <UButton label="Telegram" variant="outline" size="sm" class="rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </UContainer>
  </footer>
</template>
