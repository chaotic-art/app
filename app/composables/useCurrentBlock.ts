import type { PolkadotClient } from 'polkadot-api'
import type { AssetHubChain } from '~/types'
import { getSubstrateSourceChain } from '@/utils/chain'

type Subscription = ReturnType<PolkadotClient['blocks$']['subscribe']>

interface ChainEntry {
  block: Ref<number>
  subscription: Subscription
  refCount: number
}

const entries = new Map<AssetHubChain, ChainEntry>()

export default function useCurrentBlock() {
  const { $sdk } = useNuxtApp()
  const { currentChain } = useChain()
  const substrateSourceChain = computed(() => getSubstrateSourceChain(currentChain.value))

  function acquire(chain: AssetHubChain) {
    let entry = entries.get(chain)
    if (!entry) {
      const block = ref(0)
      const subscription = $sdk(chain).client.blocks$.subscribe((lastHeader) => {
        block.value = lastHeader.number
      })
      entry = { block, subscription, refCount: 0 }
      entries.set(chain, entry)
    }
    entry.refCount++
  }

  function release(chain: AssetHubChain) {
    const entry = entries.get(chain)

    if (!entry) {
      return
    }

    entry.refCount--

    if (entry.refCount <= 0) {
      entry.subscription.unsubscribe?.()
      entries.delete(chain)
    }
  }

  if (import.meta.client) {
    acquire(substrateSourceChain.value)

    watch(substrateSourceChain, (newChain, oldChain) => {
      if (newChain === oldChain) {
        return
      }

      acquire(newChain)

      if (oldChain) {
        release(oldChain)
      }
    })

    onScopeDispose(() => release(substrateSourceChain.value))
  }

  return computed(() => entries.get(substrateSourceChain.value)?.block.value ?? 0)
}
