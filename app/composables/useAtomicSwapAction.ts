import type { AssetHubChain } from '~/plugins/sdk.client'
import type { OdaToken, OnchainCollection } from '~/services/oda'
import { SwapStep } from '@/components/swap/types'

export default ({ tokenId, collectionId, token }: {
  tokenId: number
  collectionId: number
  token: Ref<OdaToken | null>
  collection: Ref<OnchainCollection | null>
  owner: Ref<string | null>
  chain: AssetHubChain
}) => {
  const route = useRoute()
  const swapStore = useAtomicSwapStore()
  const { swap, step, stepItems } = storeToRefs(swapStore)

  const routeName = computed(() => getRouteName(route.name?.toString() || ''))

  const showAtomicSwapAction = computed(() => ATOMIC_SWAP_PAGES.includes(routeName.value) && step.value !== SwapStep.REVIEW)

  const isItemSelected = computed(() => {
    return showAtomicSwapAction.value
      ? [...swap.value.desired, ...swap.value.offered].flat().some(item => item.id === `${collectionId}-${tokenId}`)
      : false
  })

  const onAtomicSwapSelect = () => {
    const id = `${collectionId}-${tokenId}`

    if (isItemSelected.value) {
      swapStore.removeStepItem(id)
    }
    else {
      swapStore.updateStepItems([
        ...stepItems.value,
        {
          id,
          collectionId,
          sn: tokenId,
          name: token.value?.metadata?.name,
          meta: token.value?.metadata,
        } as SwapItem,
      ])
    }
  }

  return {
    onAtomicSwapSelect,
    showAtomicSwapAction,
    isItemSelected,
  }
}
