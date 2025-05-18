<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const emit = defineEmits(['selectWalletType'])

const walletStore = useWalletStore()
const {
  getIsEvmConnected,
  getIsSubstrateConnected,
} = storeToRefs(walletStore)

const isDropdownOpen = ref(false)

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value
}

function selectWalletType(type: 'EVM' | 'SUB') {
  emit('selectWalletType', type)
  isDropdownOpen.value = false
}

function closeDropdown() {
  isDropdownOpen.value = false
}

const targetRef = ref(null)

onClickOutside(targetRef, () => {
  closeDropdown()
})
</script>

<template>
  <div ref="targetRef" class="relative">
    <UButton
      v-if="!getIsEvmConnected && !getIsSubstrateConnected"
      color="primary"
      variant="ghost"
      icon="i-lucide-wallet"
      @click="toggleDropdown"
    >
      Connect Wallet
    </UButton>

    <WalletConnectedWallets v-else @click="toggleDropdown" />

    <Transition name="dropdown">
      <div
        v-if="isDropdownOpen"
        class="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="py-1">
          <div
            class="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            @click="selectWalletType('EVM')"
          >
            <span class="mr-2">
              <UIcon name="i-lucide-link" />
            </span>
            Connect EVM Wallet
          </div>
          <div
            class="px-4 py-2 text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            @click="selectWalletType('SUB')"
          >
            <span class="mr-2">
              <UIcon name="i-lucide-link" />
            </span>
            Connect Substrate Wallet
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
