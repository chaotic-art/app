import type { Profile } from '@/services/profile'
import { isAddress } from '@polkadot/util-crypto'
import { useQuery } from '@tanstack/vue-query'
import { fetchProfileByAddress, toSubstrateAddress } from '@/services/profile'

export default function useFetchProfile(address: Ref<string | undefined>) {
  const {
    data: profile,
    isPending,
    isLoading,
    refetch,
  } = useQuery<Profile | null>({
    queryKey: [
      'user-profile',
      computed(() => isAddress(address.value) && toSubstrateAddress(address.value)),
    ],
    queryFn: () => (isAddress(address.value) ? fetchProfileByAddress(address.value) : null),
    staleTime: 1000 * 10,
  })

  return {
    profile,
    isPending,
    refetch,
    isLoading,
  }
}
