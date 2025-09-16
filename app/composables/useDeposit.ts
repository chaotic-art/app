import type { SupportedChain } from '~/plugins/sdk.client'
import format from '@/utils/format/balance'

export default function (prefix: Ref<SupportedChain>) {
  const { $sdk } = useNuxtApp()

  const collectionDeposit = ref(0)
  const itemDeposit = ref(0)
  const metadataDeposit = ref(0)
  const existentialDeposit = ref(0)
  const attributeDeposit = ref(0)

  const totalCollectionDeposit = ref('0')
  const totalItemDeposit = ref('0')

  const chainSymbol = ref('')

  watchEffect(async () => {
    if (isAssetHubChain(prefix.value)) {
      const api = $sdk(prefix.value).api
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
      const api = $sdk(prefix.value).api
      existentialDeposit.value = Number(await api.constants.Balances.ExistentialDeposit())
    }

    totalCollectionDeposit.value = format(
      metadataDeposit.value
      + collectionDeposit.value
      + existentialDeposit.value,
      chainSpec[prefix.value].tokenDecimals,
      false,
    )

    totalItemDeposit.value = format(
      metadataDeposit.value + itemDeposit.value + existentialDeposit.value,
      chainSpec[prefix.value].tokenDecimals,
      false,
    )
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
  }
}
