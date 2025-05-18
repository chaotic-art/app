<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const navItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'Home',
      to: '/',
    },
    {
      label: 'Gallery',
      to: '/gallery',
    },
    {
      label: 'Drops',
      to: '/drops',
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
    <nav class="bg-white rounded-[15px] border border-[#EBEBEB] my-[26px] px-6 py-2 flex items-center gap-2 justify-between mx-auto overflow-hidden">
      <div class="flex items-center gap-2">
        <img class="select-none" src="@/assets/svg/navbar-logo.svg" alt="logo">
        <div class="text-xl font-bold font-serif italic">
          {{ $t('brand.name') }}
        </div>
      </div>

      <div class="flex items-center gap-6">
        <UNavigationMenu
          :items="navItems"
        />
        <UButton :label="$t('wallet.connect')" variant="solid" class="text-white rounded-full px-6 text-base cursor-pointer" />
      </div>
    </nav>
  </UContainer>
</template>
