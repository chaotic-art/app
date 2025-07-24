import type { Prefix } from '@kodadot1/static'
import type {
  ActionMintDrop,
  Actions,
} from '../transaction/types'
import consola from 'consola'
import { getPercentSupportFee } from '@/utils/support'
import {
  NFTs,
} from '../transaction/types'

export function verifyRoyalty(royalty?: Royalty): { isValid: boolean, normalizedRoyalty: Royalty } {
  const normalizedRoyalty = {
    amount: Number(royalty?.amount ?? 0),
    address: royalty?.address ?? '',
  }

  return {
    isValid: isRoyaltyValid(normalizedRoyalty),
    normalizedRoyalty,
  }
}

export function isActionValid(action: Actions): boolean {
  const hasContent = <T>(v: T | T[]): boolean => Array.isArray(v) ? v.length > 0 : Boolean(v)

  const validityMap: Record<string, (action) => boolean> = {
    [NFTs.MINT_DROP]: (action: ActionMintDrop) =>
      hasContent(action.collectionId),
  }

  const checker = validityMap[action.interaction]

  if (!checker) {
    consola.error(`Interaction not found: ${action.interaction}`)
    return false
  }

  return checker(action)
}

export function useBuySupportFee(
  prefix: ComputedRef<Prefix>,
  amount: ComputedRef<string | number>,
) {
  const { isAssetHub } = useIsChain(prefix)

  const hasBuySupportFee = computed(
    () => isAssetHub.value || false,
  )

  const supportFee = computed(() =>
    hasBuySupportFee.value ? getPercentSupportFee(amount.value) : 0,
  )

  return {
    hasBuySupportFee,
    supportFee,
  }
}
