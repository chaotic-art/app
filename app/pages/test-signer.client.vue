<script setup lang="ts">
import type { SubstrateWalletSource } from '~/utils/wallet/substrate/types'
import { Binary } from 'polkadot-api'

const { $api } = useNuxtApp()
const { getConnectedSubAccount, getConnectedWallets } = storeToRefs(useWalletStore())
const { getSigner } = useSubWalletStore()

const isLoading = ref(false)
const blockHash = ref('')

async function submitRemark() {
  isLoading.value = true
  blockHash.value = ''

  try {
    const api = $api('ahk')
    const signer = await getSigner(getConnectedWallets.value[0]?.source as SubstrateWalletSource, getConnectedSubAccount.value?.address || '')

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
  <UContainer>
    <h1>Test Signer</h1>

    <UButton :loading="isLoading" @click="submitRemark">
      Submit Remark
    </UButton>

    <div v-if="blockHash">
      <p>Block Hash: {{ blockHash }}</p>
      <UButton :to="`https://assethub-kusama.subscan.io/block/${blockHash}`" target="_blank">
        View on Subscan
      </UButton>
    </div>
  </UContainer>
</template>
