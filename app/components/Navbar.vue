<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'

const route = useRoute()
const navItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'Home',
      to: '/',
    },
    {
      label: 'Explore',
      to: '/ahp/explore/collectibles',
    },
    {
      label: 'Drops',
      to: '/ahp/drops',
    },
    {
      label: 'Create',
      to: '/create',
    },
  ],
].map(item => item.map(i => ({ ...i, active: route.path === i.to }))))
</script>

<template>
  <UContainer>
    <nav class="bg-white dark:bg-neutral-900 rounded-[15px] border border-gray-200 dark:border-neutral-700 my-4 md:my-[26px] px-4 md:px-6 py-2 flex items-center gap-2 justify-between mx-auto overflow-hidden">
      <div class="flex items-center gap-2">
        <img class="select-none w-6 h-6 md:w-auto md:h-auto" src="@/assets/svg/navbar-logo.svg" alt="logo">
        <NuxtLink to="/" class="text-lg md:text-xl font-bold font-serif italic text-gray-900 dark:text-white">
          {{ $t('brand.name') }}
        </NuxtLink>
      </div>

      <div class="flex items-center gap-3 md:gap-6">
        <div class="hidden md:flex  items-center">
          <UNavigationMenu
            :items="navItems"
          />
          <ThemeSwitcher />
        </div>
        <NavbarWallet />
      </div>
    </nav>
  </UContainer>
</template>
