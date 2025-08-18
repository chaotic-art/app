import type { Prefix } from '@kodadot1/static'
import { CHAINS } from '@kodadot1/static'
import { chainPropListOf } from '@/utils/chain'
import format from '@/utils/format/balance'

export default function (prefix: Ref<Prefix>) {
  const { $sdk } = useNuxtApp()
  const { isAssetHub } = useIsChain(prefix)

  const collectionDeposit = ref(0)
  const itemDeposit = ref(0)
  const metadataDeposit = ref(0)
  const existentialDeposit = ref(0)
  const attributeDeposit = ref(0)

  const totalCollectionDeposit = ref('0')
  const totalItemDeposit = ref('0')

  const chainSymbol = ref('')

  const chain = computed(() =>
    chainPropListOf(chainSymbol.value.toLowerCase() as Prefix),
  )

  const isEnabled = computed(() => prefix.value && isSub(prefix.value))

  watchEffect(async () => {
    if (isEnabled.value) {
      const api = $sdk(prefix.value).api
      const chain = CHAINS[prefix.value]

      if (isAssetHub.value) {
        const [
          existentialDepositValue,
          collectionDepositValue,
          itemDepositValue,
          metadataDepositValue,
          attributeDepositValue,
        ] = await Promise.all([
          api.constants.Balances.ExistentialDeposit(),
          api.constants.Nfts.CollectionDeposit(),
          api.constants.Nfts.ItemDeposit(),
          api.constants.Nfts.MetadataDepositBase(),
          api.constants.Nfts.AttributeDepositBase(),
        ])

        existentialDeposit.value = Number(existentialDepositValue)
        collectionDeposit.value = Number(collectionDepositValue)
        itemDeposit.value = Number(itemDepositValue)
        metadataDeposit.value = Number(metadataDepositValue)
        attributeDeposit.value = Number(attributeDepositValue)
      }
      else {
        existentialDeposit.value = Number(await api.constants.Balances.ExistentialDeposit())
      }

      totalCollectionDeposit.value = format(
        metadataDeposit.value
        + collectionDeposit.value
        + existentialDeposit.value,
        chain.tokenDecimals,
        false,
      )

      totalItemDeposit.value = format(
        metadataDeposit.value + itemDeposit.value + existentialDeposit.value,
        chain.tokenDecimals,
        false,
      )
    }
  })

  return {
    collectionDeposit,
    itemDeposit,
    attributeDeposit,
    metadataDeposit,
    existentialDeposit,
    totalCollectionDeposit,
    totalItemDeposit,
    chainSymbol,
    chain,
  }
}
