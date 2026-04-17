import { useQuery } from '@tanstack/vue-query'
import { isAppChain } from '@/utils/chain'
import { fetchOdaCollection } from '~/services/oda'

export default function (collectionId: Ref<number | string>) {
  const { currentChain } = useChain()

  const { data: collection } = useQuery({
    queryKey: ['odaCollection', collectionId],
    queryFn: () => isAppChain(currentChain.value)
      ? fetchOdaCollection(currentChain.value, String(collectionId.value)).catch(() => null)
      : Promise.resolve(null),
  })

  return {
    collection,
  }
}
