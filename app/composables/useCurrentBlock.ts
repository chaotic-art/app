import type { PolkadotClient } from 'polkadot-api'
import { getSubstrateSourceChain } from '@/utils/chain'

const currentBlock = ref(0)
const subscription = ref<ReturnType<PolkadotClient['blocks$']['subscribe']>>()
const syncCount = ref(0)

export default function useCurrentBlock() {
  const { $sdk } = useNuxtApp()
  const { currentChain } = useChain()
  const substrateSourceChain = computed(() => getSubstrateSourceChain(currentChain.value))

  syncCount.value++

  if (!subscription.value) {
    onBeforeMount(async () => {
      subscription.value = $sdk(substrateSourceChain.value).client.blocks$.subscribe((lastHeader) => {
        currentBlock.value = lastHeader.number
      })
    })
  }

  onBeforeUnmount(() => {
    syncCount.value--

    if (syncCount.value === 0 && subscription.value) {
      subscription.value.unsubscribe?.()
      subscription.value = undefined
    }
  })

  return currentBlock
}
