<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'
import Logo from '@/assets/svg/navbar-logo.svg'
import ThemeSwitcher from '@/components/common/ThemeSwitcher.vue'

const { accountId } = useAuth()
const { prefix } = usePrefix()
const route = useRoute()
const router = useRouter()

// Modal state
const isCreateModalOpen = ref(false)
const isBottomSheetOpen = ref(false)

const routePrefix = computed(() => isProduction ? 'ahp' : prefix.value)

const navItems = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: 'Home',
      to: '/',
    },
    {
      label: 'Explore',
      to: `/${routePrefix.value}/explore/collectibles`,
    },
    {
      label: 'Drops',
      to: `/${routePrefix.value}/drops`,
    },
    {
      label: 'Artists',
      to: `/${routePrefix.value}/artists`,
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

function handleNavClick(item: NavigationMenuItem, event?: Event) {
  isBottomSheetOpen.value = false
  if (item.onSelect && typeof item.onSelect === 'function') {
    item.onSelect(event || new Event('click'))
  }
  else if (item.to) {
    router.push(item.to)
  }
}
</script>

<template>
  <UContainer>
    <nav class="rounded-full border border-border my-4 md:my-[26px] p-2 flex items-center gap-2 justify-between mx-auto overflow-hidden">
      <div class="flex items-center gap-2 ml-4">
        <Logo class="select-none w-6 h-6 md:w-8 md:h-8" :font-controlled="false" />
        <NuxtLink
          to="/" class="text-lg md:text-3xl font-medium font-serif italic text-foreground"
        >
          Chaotic
        </NuxtLink>
      </div>

      <div class="flex items-center gap-3 md:gap-6">
        <div class="hidden md:flex items-center h-10">
          <UNavigationMenu
            :items="navItems"
          />
          <ThemeSwitcher v-if="!accountId" />
        </div>

        <!-- Desktop Wallet -->
        <div class="hidden md:block">
          <NavbarWallet />
        </div>

        <!-- Mobile Menu Button -->
        <UButton
          icon="i-heroicons-bars-3"
          color="neutral"
          variant="ghost"
          size="sm"
          class="md:hidden"
          @click="isBottomSheetOpen = true"
        />
      </div>
    </nav>
  </UContainer>

  <!-- Mobile Bottom Sheet -->
  <USlideover
    v-model:open="isBottomSheetOpen"
    side="bottom"
    title="Navigation"
    class="md:hidden"
  >
    <template #body>
      <div class="space-y-4">
        <!-- Navigation Items -->
        <div class="space-y-2">
          <UButton
            v-for="item in navItems[0]"
            :key="item.label"
            :variant="item.active ? 'solid' : 'ghost'"
            :color="item.active ? 'primary' : 'neutral'"
            size="lg"
            class="w-full justify-start"
            @click="handleNavClick(item)"
          >
            <div class="flex items-center gap-3">
              <span>{{ item.label }}</span>
              <UIcon
                v-if="item.active"
                name="i-heroicons-check"
                class="ml-auto"
              />
            </div>
          </UButton>
        </div>

        <USeparator />

        <!-- Mobile Wallet -->
        <div class="md:hidden">
          <NavbarWallet />
        </div>
      </div>
    </template>
  </USlideover>

  <!-- Create Modal -->
  <LazyCreateModal
    :open="isCreateModalOpen"
    @close="closeModal"
    @create-collection="handleCreateCollection"
    @create-nft="handleCreateNft"
  />
</template>
