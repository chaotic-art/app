<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'
import CreateModal from '@/components/common/CreateModal.vue'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'

const { accountId } = useAuth()
const route = useRoute()
const router = useRouter()

// Modal state
const isCreateModalOpen = ref(false)

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
      label: 'Artists',
      to: '/ahp/artists',
    },
    {
      label: 'Create',
      onSelect: () => isCreateModalOpen.value = true,
    },
  ],
].map(item => item.map(i => ({
  ...i,
  active: i.to ? route.path === i.to : false,
}))))

// Handle modal actions
function handleCreateCollection() {
  isCreateModalOpen.value = false
  // Navigate to collection creation page
  router.push('/create/collection')
}

function handleCreateNft() {
  isCreateModalOpen.value = false
  // Navigate to NFT creation page
  router.push('/create/nft')
}

function closeModal() {
  isCreateModalOpen.value = false
}
</script>

<template>
  <UContainer>
    <nav class="bg-background-color rounded-[15px] border border-gray-200 dark:border-neutral-700 my-4 md:my-[26px] px-4 md:px-6 py-2 flex items-center gap-2 justify-between mx-auto overflow-hidden">
      <div class="flex items-center gap-2">
        <img class="select-none w-6 h-6 md:w-8 md:h-8" src="@/assets/svg/navbar-logo.svg" alt="logo">
        <NuxtLink to="/" class="text-lg md:text-xl font-bold font-serif italic text-gray-900 dark:text-white">
          Chaotic
        </NuxtLink>
      </div>

      <div class="flex items-center gap-3 md:gap-6">
        <div class="hidden md:flex  items-center">
          <UNavigationMenu
            :items="navItems"
          />
          <ThemeSwitcher v-if="!accountId" />
        </div>
        <NavbarWallet />
      </div>
    </nav>
  </UContainer>

  <!-- Create Modal -->
  <CreateModal
    :open="isCreateModalOpen"
    @close="closeModal"
    @create-collection="handleCreateCollection"
    @create-nft="handleCreateNft"
  />
</template>
