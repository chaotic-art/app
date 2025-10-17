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

const ParaportEndpointMap: Record<Exclude<AssetHubChain, 'ahpas'>, ChaoticSupportedChain[]> = {
  ahp: ['ahp', 'dot'],
  ahk: ['ahk', 'ksm'],
}

type SupportedChain = keyof typeof ParaportEndpointMap

const { getConnectedSubAccount } = storeToRefs(useWalletStore())
const { accountId } = useAuth()
const pingStore = usePingStore()
const { currentChain } = useChain()
const { endpoints } = storeToRefs(pingStore)
const fetched = ref(false)

const paraportEndpoints = reactive({
  chains: computed<ChaoticSupportedChain[]>(() => {
    if (!Object.keys(ParaportEndpointMap).includes(currentChain.value)) {
      return []
    }

    return ParaportEndpointMap[currentChain.value as SupportedChain]
  }),
  value: computed(() => ({
    AssetHubPolkadot: endpoints.value.ahp,
    Polkadot: endpoints.value.dot,
    Kusama: endpoints.value.ksm,
    AssetHubKusama: endpoints.value.ahk,
  })),
})

const ready = computed(() => paraportEndpoints.chains.every(chain => Boolean(endpoints.value[chain].length)) || fetched.value)

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

onBeforeMount(async () => {
  if (ready.value) {
    return
  }

  const result = await pingStore.getFastestEndpoints(paraportEndpoints.chains)

  console.log(result)

  Object.entries(result).forEach(([chain, chainEndpoints]) => {
    endpoints.value[chain as ChaoticSupportedChain] = chainEndpoints
  })

  console.log(endpoints.value)

  fetched.value = true
})
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
    :endpoints="paraportEndpoints.value"
    @submit="onSubmit"
  />
</template>
