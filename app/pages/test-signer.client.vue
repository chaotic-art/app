<script setup lang="ts">
import { Binary } from 'polkadot-api'

type SupportedChain = 'ahp' | 'ahk' | 'dot' | 'ksm'

const { $sdk } = useNuxtApp()
const { getConnectedSubAccount } = storeToRefs(useWalletStore())

const isLoading = ref(false)
const blockHash = ref('')
const selectedChain = ref<SupportedChain>('ahk')

const chainOptions = [
  { value: 'ahp' as SupportedChain, label: 'Asset Hub Polkadot' },
  { value: 'ahk' as SupportedChain, label: 'Asset Hub Kusama' },
  { value: 'dot' as SupportedChain, label: 'Polkadot' },
  { value: 'ksm' as SupportedChain, label: 'Kusama' },
]

const subscanUrls: Record<SupportedChain, string> = {
  ahp: 'https://assethub-polkadot.subscan.io',
  ahk: 'https://assethub-kusama.subscan.io',
  dot: 'https://polkadot.subscan.io',
  ksm: 'https://kusama.subscan.io',
}

async function submitRemark() {
  isLoading.value = true
  blockHash.value = ''

  try {
    const api = $sdk(selectedChain.value).api
    const signer = await getConnectedSubAccount.value?.signer

    if (!signer) {
      isLoading.value = false
      return
    }

    const remark = Binary.fromText('Hello world!')
    const tx = api.tx.System.remark({ remark })

    tx.signSubmitAndWatch(signer).subscribe({
      next: (event) => {
        if (event.type === 'txBestBlocksState' && event.found) {
          blockHash.value = event.block.hash.toString()
          // eslint-disable-next-line no-console
          console.log('txBestBlocksState', event.block.hash.toString())
        }

        if (event.type === 'finalized') {
          isLoading.value = false
          // eslint-disable-next-line no-console
          console.log('finalized')
        }
      },
      error: (err) => {
        console.error(err, getConnectedSubAccount.value?.address)
        console.error(err.message || 'Unknown error')
        isLoading.value = false
      },
    })
  }
  catch (err) {
    console.error(err)
    isLoading.value = false
  }
}
</script>

<template>
  <UContainer class="flex items-center justify-center py-20">
    <div class="space-y-6 w-full max-w-md mx-auto">
      <h1 class="text-2xl font-bold text-gray-800 text-center">
        Test Signer
      </h1>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-2">
            Select Chain
          </label>
          <USelect
            v-model="selectedChain"
            :items="chainOptions"
            placeholder="Select a chain"
            class="w-full max-w-xs"
          />
        </div>

        <UButton
          :loading="isLoading"
          class="bg-gray-800 hover:bg-gray-700"
          @click="submitRemark"
        >
          Submit Remark
        </UButton>
      </div>

      <div v-if="blockHash" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-600 mb-1">
            Block Hash:
          </label>
          <p class="font-mono text-sm text-gray-800 break-all bg-gray-100 p-2 rounded">
            {{ blockHash }}
          </p>
        </div>

        <UButton
          :to="`${subscanUrls[selectedChain]}/block/${blockHash}`"
          target="_blank"
          variant="outline"
          class="border-gray-600 text-gray-600 hover:bg-gray-100"
        >
          View on Subscan
        </UButton>
      </div>
    </div>
  </UContainer>
</template>
