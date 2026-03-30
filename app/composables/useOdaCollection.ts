import { useQuery } from '@tanstack/vue-query'
import { isOdaChain } from '@/utils/chain'
import { fetchOdaCollection } from '~/services/oda'

export default function (collectionId: Ref<number | string>) {
  const { currentChain } = useChain()

  const { data: collection } = useQuery({
    queryKey: ['odaCollection', collectionId],
    queryFn: () => isOdaChain(currentChain.value)
      ? fetchOdaCollection(currentChain.value, String(collectionId.value)).catch(() => null)
      : Promise.resolve(null),
  })

  return {
    collection,
  }
}
