import { useQuery } from '@tanstack/vue-query'
import { fetchOdaCollection } from '~/services/oda'

export default function (collectionId: Ref<number | string>) {
  const { currentChain } = useChain()

  const { data: collection } = useQuery({
    queryKey: ['odaCollection', collectionId],
    queryFn: () => fetchOdaCollection(currentChain.value, String(collectionId.value)).catch(() => null),
  })

  return {
    collection,
  }
}
