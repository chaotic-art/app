<script setup lang="ts">
import type { AssetHubChain, SupportedChain as ChaoticSupportedChain } from '~/plugins/sdk.client'
import { Paraport } from '@paraport/vue'

defineProps<{
  amount: number
  label?: string
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits(['confirm'])

const SupportedChainMap = {
  ahp: { chain: 'AssetHubPolkadot', asset: 'DOT' },
  dot: { chain: 'Polkadot', asset: 'DOT' },
  ksm: { chain: 'Kusama', asset: 'KSM' },
  ahk: { chain: 'AssetHubKusama', asset: 'KSM' },
} as const

const { getConnectedSubAccount } = storeToRefs(useWalletStore())
const { accountId } = useAuth()
const { currentChain } = useChain()

const ready = ref(true)

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
    v-if="!(currentChain === 'ahp' || currentChain === 'ahk')"
    class="w-full inline-flex justify-center"
    :disabled="disabled"
    :label="label"
    @click="$emit('confirm')"
  />

  <USkeleton v-else-if="loading || !ready" class="h-12 w-full rounded" />

  <Paraport
    v-else
    :amount="String(amount)"
    :address="accountId"
    :chain="SupportedChainMap[currentChain].chain"
    :asset="SupportedChainMap[currentChain].asset"
    :label="label"
    :disabled="disabled"
    :get-signer="getSigner"
    @submit="onSubmit"
  />
</template>
