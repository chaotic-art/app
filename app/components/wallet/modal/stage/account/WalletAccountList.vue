<script setup lang="ts">
import type { WalletAccount } from '@/components/wallet/types.ts'

const props = defineProps<{
  accounts: WalletAccount[]
}>()

const { $jdenticon } = useNuxtApp()

function generateAvatar(address: string): string {
  // if (import.meta.client && $jdenticon) {
  //   return $jdenticon.toSvg(address, 40)
  // }
  return ''
}

const filteredAccounts = computed(() => props.accounts)

function selectAccount(account) {
}
</script>

<template>
  <div>
    <WalletAccountListEmpty v-if="filteredAccounts.length === 0" />

    <UCard
      v-for="account in filteredAccounts"
      :key="`${account.vm}-${account.address}`"
      class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      :class="{ 'ring-2 ring-primary-500': account.isSelected }"
      @click="selectAccount(account)"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="relative">
            <div
              class="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
              v-html="generateAvatar(account.address)"
            />
          </div>
          <div class="flex items-start">
            <div>
              <div class="flex items-center space-x-0.5">
                <div class="w-4 h-4 rounded-lg shadow-lg bg-white flex items-center justify-center relative z-10">
                  <img
                    src="/partners/logo-talisman.svg"
                    alt="Talisman Wallet Extension"
                    class="w-3 h-3 object-contain"
                  >
                </div>
                <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {{ account.name }}
                </div>
                <UBadge
                  v-if="account.vm === 'EVM'"
                  color="info"
                  size="xs"
                >
                  EVM
                </UBadge>
              </div>

              <div class="text-xs text-gray-500 dark:text-gray-400">
                {{ account.address }}
              </div>
            </div>

            <div class="flex items-center space-x-2 mt-1">
              <span class="text-sm text-gray-600 dark:text-gray-400">
                ${{ account.balance }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
