<script setup lang="ts">
import { createAppKit, useAppKit, useAppKitAccount } from '@reown/appkit/vue'

const emit = defineEmits<{
  select: [account: WalletAccount]
}>()

const { $wagmi } = useNuxtApp()

if (import.meta.client) {
  createAppKit({
    adapters: [$wagmi.adapter],
    networks: [$wagmi.defaultNetwork, ...$wagmi.networks],
    projectId: $wagmi.projectId,
    metadata: $wagmi.metadata,
    themeMode: 'light',
    features: {
      email: false,
      socials: false,
      swaps: false,
    },
  })
}

function open() {
  useAppKit().open()
}

const accountData = useAppKitAccount()

watchEffect(() => {
  const address = accountData.value.address

  if (address) {
    emit('select', {
      address,
    })
  }
})
</script>

<template>
  <client-only>
    <div class="space-y-4">
      <UButton
        color="primary"
        icon="i-lucide-wallet"
        size="lg"
        block
        @click="open"
      >
        Connect EVM Wallet
      </UButton>

      <UCard v-if="accountData?.address" class="mt-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">
              Connected Account
            </div>
            <div class="text-xs text-gray-500 mt-1">
              {{ accountData.address }}
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </client-only>
</template>
