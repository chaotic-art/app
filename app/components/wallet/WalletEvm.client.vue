<script setup lang="ts">
import type { WalletAccount } from '@/stores/wallet/types'
import type { AppKit } from '@reown/appkit/vue'
import { createAppKit, useAppKit, useAppKitAccount } from '@reown/appkit/vue'

const emit = defineEmits<{
  select: [account: WalletAccount]
  disconnect: []
}>()

const { $wagmi } = useNuxtApp()
const accountData = useAppKitAccount()
const isConnecting = ref(false)

const appKit = ref<AppKit>()

async function connectWallet() {
  if (isConnecting.value)
    return

  isConnecting.value = true

  try {
    if (!appKit.value) {
      appKit.value = createAppKit({
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

    useAppKit().open()
  }
  catch (error) {
    console.error('Failed to connect EVM wallet:', error)
  }
  finally {
    isConnecting.value = false
  }
}

function disconnectWallet() {
  emit('disconnect')
}

watchEffect(() => {
  const address = accountData.value.address
  if (address) {
    emit('select', { address })
    isConnecting.value = false
  }
})
</script>

<template>
  <div class="space-y-3">
    <UCard v-if="accountData?.address" class="border-success-200 dark:border-success-800 bg-success-50 dark:bg-success-900/20">
      <div class="flex items-center justify-between p-3">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-success-100 dark:bg-success-800 flex items-center justify-center">
            <UIcon name="i-simple-icons-ethereum" class="w-5 h-5 text-success-600 dark:text-success-400" />
          </div>
          <div>
            <div class="font-medium text-success-800 dark:text-success-200">
              {{ $t('wallet.connected') }}
            </div>
            <div class="text-sm text-success-600 dark:text-success-400">
              {{ accountData.address.slice(0, 6) }}...{{ accountData.address.slice(-4) }}
            </div>
          </div>
        </div>
        <UButton
          color="error"
          variant="soft"
          icon="i-lucide-unlink"
          size="sm"
          @click="disconnectWallet"
        >
          {{ $t('wallet.disconnect') }}
        </UButton>
      </div>
    </UCard>

    <div v-else class="space-y-3">
      <UCard class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" @click="connectWallet">
        <div class="flex items-center justify-between p-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full bg-info-100 dark:bg-info-900/20 flex items-center justify-center">
              <UIcon name="i-simple-icons-ethereum" class="w-5 h-5 text-info-600" />
            </div>
            <div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ $t('wallet.ethereumWallets') }}
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t('wallet.metamaskWalletConnectAndMore') }}
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <UButton
              color="info"
              :loading="isConnecting"
              :disabled="isConnecting"
              @click.stop="connectWallet"
            >
              {{ isConnecting ? $t('wallet.connecting') : $t('wallet.connect') }}
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
