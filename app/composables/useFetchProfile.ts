import type { Profile } from '@/services/profile'
import { fetchProfileByAddress, toSubstrateAddress } from '@/services/profile'
import { useQuery } from '@tanstack/vue-query'

export default function useFetchProfile(address: Ref<string | undefined>) {
  const {
    data: profile,
    isPending,
    isLoading,
    refetch,
  } = useQuery<Profile | null>({
    queryKey: [
      'user-profile',
      computed(() => address.value && toSubstrateAddress(address.value)),
    ],
    queryFn: () => (address.value ? fetchProfileByAddress(address.value) : null),
    staleTime: 1000 * 10,
  })

  return {
    profile,
    isPending,
    refetch,
    isLoading,
  }
}
