import type { AssetHubChain } from '~/plugins/sdk.client'
import { isAddress } from '@polkadot/util-crypto'
import { SwapStep } from '@/components/swap/types'

export default defineNuxtRouteMiddleware((to) => {
  const swapStore = useAtomicSwapStore()
  const { swap, items, step } = storeToRefs(swapStore)
  const chain = to.params.chain?.toString() as AssetHubChain
  const swapId = to.query.swapId?.toString()

  const id = to.params.id?.toString()
  const routeName = getRouteName(to.name?.toString() || '')

  if (!id || !routeName) {
    return navigateTo({ name: getSwapStepRouteName(SwapStep.COUNTERPARTY) })
  }

  swapStore.updateSwap({ chain })

  const foundSwap = items.value
    .filter(item =>
      item.counterparty === id
      && item.id === swapId
      && item.chain === chain,
    )[0]

  if (!foundSwap) {
    if (!isAddress(id)) {
      return navigateTo({ name: getSwapStepRouteName(SwapStep.COUNTERPARTY, true), params: { id, chain } })
    }

    if (!import.meta.client) {
      return navigateTo({
        name: getSwapStepRouteName(SwapStep.DESIRED),
        params: { id, chain },
        query: { swapId: swapStore.createSwap(id, chain).id },
      })
    }

    // On server, do not create swaps; let client handle creation
    return
  }

  const isCollectionSwap = foundSwap.isCollectionSwap

  swap.value = foundSwap

  const swapStep = getSwapStep(swap.value)

  if (swapStep === SwapStep.CREATED) {
    return navigateTo({ name: getSwapStepRouteName(SwapStep.COUNTERPARTY, isCollectionSwap), params: { chain } })
  }

  const routeStep = (getRouteNameStepMap(isCollectionSwap) as Record<string, SwapStep>)[routeName] as SwapStep

  step.value = routeStep

  if (routeStep > swapStep) {
    return navigateTo({ name: getSwapStepRouteName(swapStep, isCollectionSwap), params: { id, chain }, query: { swapId: swap.value.id } })
  }
})
