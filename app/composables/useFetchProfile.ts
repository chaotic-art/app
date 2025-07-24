import type { Profile } from '@/services/profile'
import { useQuery } from '@tanstack/vue-query'
import { decodeAddress } from 'dedot/utils'
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
      computed(() => address.value && decodeAddress(address.value) && toSubstrateAddress(address.value)),
    ],
    queryFn: () => (address.value && decodeAddress(address.value) ? fetchProfileByAddress(address.value) : null),
    staleTime: 1000 * 10,
  })

  return {
    profile,
    isPending,
    refetch,
    isLoading,
  }
}
