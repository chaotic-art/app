import type { ComputedRef, InjectionKey } from 'vue'
import type { SupportedChain } from '~/plugins/sdk.client'

export interface StudioCollectionData {
  id: string
  chain: SupportedChain
  name: string
  description: string
  image: string
  banner: string
  owner: string
  supply: string
  claimed: string
  floor: number | null
}

const STUDIO_COLLECTION_KEY: InjectionKey<ComputedRef<StudioCollectionData>> = Symbol('studio-collection')

export function provideStudioCollection(data: ComputedRef<StudioCollectionData>) {
  provide(STUDIO_COLLECTION_KEY, data)
}

export function useStudioCollection(): ComputedRef<StudioCollectionData> {
  const data = inject(STUDIO_COLLECTION_KEY)
  if (!data) {
    throw new Error('useStudioCollection must be used within a studio page')
  }
  return data
}
