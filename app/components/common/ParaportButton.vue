<script setup lang="ts">
import type { SupportedChain } from '~/plugins/sdk.client'

defineProps<{
  amount: number
  label?: string
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits(['confirm'])

const chains = ['ahp', 'dot'] as SupportedChain[]

const SupportedChainMap = {
  ahp: 'AssetHubPolkadot',
  dot: 'Polkadot',
  ksm: 'Kusama',
  ahk: 'AssetHubKusama',
  ahpas: 'AssetHubPaseo',
} as const

const { getConnectedSubAccount } = storeToRefs(useWalletStore())
const { accountId } = useAuth()
const pingStore = usePingStore()
const { currentChain } = useChain()
const { endpoints } = storeToRefs(pingStore)
const fetched = ref(false)

const paraportEndpoints = computed(() => ({
  AssetHubPolkadot: endpoints.value.ahp,
  Polkadot: endpoints.value.dot,
}))

const ready = computed(() => chains.every(chain => Boolean(endpoints.value[chain].length)) || fetched.value)

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

  const result = await pingStore.getFastestEndpoint(chains)

  Object.entries(result).forEach(([chain, endpoint]) => {
    endpoints.value[chain as SupportedChain] = [endpoint]
  })

  fetched.value = true
})
</script>

<template>
  <USkeleton v-if="loading || !ready" class="h-12 w-full rounded" />

  <Paraport
    v-else
    :amount="String(amount)"
    :address="accountId"
    :chain="SupportedChainMap[currentChain]"
    asset="DOT"
    :label="label"
    :disabled="disabled"
    :get-signer="getSigner"
    :endpoints="paraportEndpoints"
    @submit="onSubmit"
  />
</template>
