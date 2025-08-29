<script setup lang="ts">
import useTheme from '@/composables/useTheme'

const { currentMode } = useTheme()
const { prefix } = usePrefix()

const NuxtLink = resolveComponent('NuxtLink')
</script>

<template>
  <div class="flex items-center flex-col gap-5 pt-8">
    <img :src="currentMode?.value === 'dark' ? '/cart/empty-cart-dark.svg' : '/cart/empty-cart.svg'" alt="Empty Cart" class="w-36 h-36">

    <div class="flex flex-col gap-2 items-center">
      <h1 class="font-bold">
        {{ $t('shoppingCart.emptyTitle') }}
      </h1>
      <p class="text-center">
        {{ $t('shoppingCart.emptySubtitle') }}
      </p>
    </div>

    <UButton
      icon="ic:twotone-search"
      :label="$t('shoppingCart.exploreNfts')"
      variant="outline"
      :as="NuxtLink"
      :to="`/${prefix}/explore/nfts?listed=true`"
    />
  </div>
</template>
