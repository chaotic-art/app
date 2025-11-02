<script setup lang="ts">
import type { ParaportParams } from '@paraport/vue'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { Paraport } from '@paraport/vue'
import { isProduction } from '@/utils/env'

defineProps<{
  amount: number
  label?: string
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits(['confirm'])

const SupportedChainMap: Record<AssetHubChain, { chain: ParaportParams['chain'], asset: ParaportParams['asset'] }> = {
  ahp: { chain: 'AssetHubPolkadot', asset: 'DOT' },
  ahk: { chain: 'AssetHubKusama', asset: 'KSM' },
  ahpas: { chain: 'AssetHubPaseo', asset: 'PAS' },
} as const

const { getConnectedSubAccount } = storeToRefs(useWalletStore())
const { accountId } = useAuth()
const { currentChain } = useChain()

async function getSigner() {
  const signer = await getConnectedSubAccount.value?.signer

  if (!signer) {
    throw new Error('No connected subaccount')
  }

  return signer
}

function onSubmit({ completed, autoteleport }: { completed: boolean, autoteleport: boolean }) {
  const submit = autoteleport ? completed : true

  if (submit) {
    emit('confirm')
  }
}
</script>

<template>
  <!-- Unsupported Chain -->
  <UButton
    v-if="!(currentChain === 'ahp' || currentChain === 'ahk' || currentChain === 'ahpas')"
    class="w-full inline-flex justify-center"
    :disabled="disabled"
    :label="label"
    @click="$emit('confirm')"
  />

  <USkeleton v-else-if="loading" class="h-12 w-full rounded" />

  <Paraport
    v-else
    :key="String(amount)"
    :amount="String(amount)"
    :address="accountId"
    :get-signer="getSigner"
    :chain="SupportedChainMap[currentChain].chain"
    :asset="SupportedChainMap[currentChain].asset"
    :label="label"
    :disabled="disabled"
    :log-level="isProduction ? 'INFO' : 'DEBUG'"
    @submit="onSubmit"
  />
</template>
