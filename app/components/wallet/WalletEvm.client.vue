<script setup lang="ts">
import type { AppKit } from '@reown/appkit/vue'
import type { WalletAccount } from '@/stores/wallet'
import { createAppKit, useAppKit, useAppKitAccount } from '@reown/appkit/vue'

const emit = defineEmits<{
  select: [account: WalletAccount]
}>()

const { $wagmi } = useNuxtApp()
const accountData = useAppKitAccount()

const appKit = ref<AppKit>()

function open() {
  if (!appKit.value) {
    appKit.value = createAppKit({
      adapters: [$wagmi.adapter],
      // @ts-expect-error different types of networks
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

  useAppKit().open()
}

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
        {{ $t('wallet.connectEvm') }}
      </UButton>

      <UCard v-if="accountData?.address" class="mt-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium">
              {{ $t('wallet.connectedAccount') }}
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
