import type { Chain } from '~/types'
import type { AssetHubChain } from '~/types/chain'
import { isAssetHubChain, isSubstrateChain } from '@/utils/chain'

export async function getAssethubDeposit(chain: AssetHubChain) {
  const { $sdk } = useNuxtApp()
  const api = $sdk(chain).api

  const [
    existentialDeposit,
    collectionDeposit,
    itemDeposit,
    metadataDeposit,
    attributeDeposit,
  ] = await Promise.all([
    api.constants.Balances.ExistentialDeposit(),
    api.constants.Nfts.CollectionDeposit(),
    api.constants.Nfts.ItemDeposit(),
    api.constants.Nfts.MetadataDepositBase(),
    api.constants.Nfts.AttributeDepositBase(),
  ])

  return {
    existentialDeposit,
    collectionDeposit,
    itemDeposit,
    metadataDeposit,
    attributeDeposit,
  }
}

export default function (chainRef: Ref<Chain>) {
  const collectionDeposit = ref(0)
  const itemDeposit = ref(0)
  const metadataDeposit = ref(0)
  const existentialDeposit = ref(0)
  const attributeDeposit = ref(0)

  const totalCollectionDeposit = ref(0)
  const totalItemDeposit = ref(0)

  const loading = ref(true)

  watchEffect((onInvalidate) => {
    let cancelled = false
    onInvalidate(() => {
      cancelled = true
    })

    if (import.meta.server) {
      loading.value = false
      return
    }

    const chain = chainRef.value
    loading.value = true

    const updateTotals = () => {
      totalCollectionDeposit.value = metadataDeposit.value + collectionDeposit.value + existentialDeposit.value
      totalItemDeposit.value = metadataDeposit.value + itemDeposit.value + existentialDeposit.value
    }

    // Keep the effect synchronous; async work is fired separately with cancellation via onInvalidate.
    const loadDeposits = async () => {
      try {
        if (isAssetHubChain(chain)) {
          const {
            existentialDeposit: existentialDepositValue,
            collectionDeposit: collectionDepositValue,
            itemDeposit: itemDepositValue,
            metadataDeposit: metadataDepositValue,
            attributeDeposit: attributeDepositValue,
          } = await getAssethubDeposit(chain)

          if (cancelled) {
            return
          }

          existentialDeposit.value = Number(existentialDepositValue)
          collectionDeposit.value = Number(collectionDepositValue)
          itemDeposit.value = Number(itemDepositValue)
          metadataDeposit.value = Number(metadataDepositValue)
          attributeDeposit.value = Number(attributeDepositValue)
        }
        else if (isSubstrateChain(chain)) {
          const { $sdk } = useNuxtApp()
          const api = $sdk(chain).api
          const existential = Number(await api.constants.Balances.ExistentialDeposit())

          if (cancelled) {
            return
          }

          existentialDeposit.value = existential
          collectionDeposit.value = 0
          itemDeposit.value = 0
          metadataDeposit.value = 0
          attributeDeposit.value = 0
        }
        else {
          existentialDeposit.value = 0
          collectionDeposit.value = 0
          itemDeposit.value = 0
          metadataDeposit.value = 0
          attributeDeposit.value = 0
        }

        if (cancelled) {
          return
        }

        updateTotals()
      }
      catch (error) {
        console.error(error)
      }
      finally {
        if (!cancelled) {
          loading.value = false
        }
      }
    }

    void loadDeposits()
  })

  return {
    collectionDeposit,
    itemDeposit,
    attributeDeposit,
    metadataDeposit,
    existentialDeposit,
    totalCollectionDeposit,
    totalItemDeposit,
    loading,
  }
}
