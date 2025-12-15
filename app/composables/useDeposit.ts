import type { AssetHubChain, SupportedChain } from '~/plugins/sdk.client'

export async function getAssethubDeposit(chain: AssetHubChain) {
  const { $sdk } = useNuxtApp()
  const api = $sdk(chain).api

  const [
    existentialDeposit,
    collectionDeposit,
    itemDeposit,
    metadataDeposit,
    attributeDeposit,
  ] = await Promise.all([
    api.constants.Balances.ExistentialDeposit(),
    api.constants.Nfts.CollectionDeposit(),
    api.constants.Nfts.ItemDeposit(),
    api.constants.Nfts.MetadataDepositBase(),
    api.constants.Nfts.AttributeDepositBase(),
  ])

  return {
    existentialDeposit,
    collectionDeposit,
    itemDeposit,
    metadataDeposit,
    attributeDeposit,
  }
}

export default function (prefix: Ref<SupportedChain>) {
  const collectionDeposit = ref(0)
  const itemDeposit = ref(0)
  const metadataDeposit = ref(0)
  const existentialDeposit = ref(0)
  const attributeDeposit = ref(0)

  const totalCollectionDeposit = ref(0)
  const totalItemDeposit = ref(0)

  const chainSymbol = ref('')

  watchEffect(async () => {
    if (import.meta.server) {
      return
    }

    if (isAssetHubChain(prefix.value)) {
      const {
        existentialDeposit: existentialDepositValue,
        collectionDeposit: collectionDepositValue,
        itemDeposit: itemDepositValue,
        metadataDeposit: metadataDepositValue,
        attributeDeposit: attributeDepositValue,
      } = await getAssethubDeposit(prefix.value)

      existentialDeposit.value = Number(existentialDepositValue)
      collectionDeposit.value = Number(collectionDepositValue)
      itemDeposit.value = Number(itemDepositValue)
      metadataDeposit.value = Number(metadataDepositValue)
      attributeDeposit.value = Number(attributeDepositValue)
    }
    else {
      const { $sdk } = useNuxtApp()
      const api = $sdk(prefix.value).api
      existentialDeposit.value = Number(await api.constants.Balances.ExistentialDeposit())
    }

    totalCollectionDeposit.value = metadataDeposit.value + collectionDeposit.value + existentialDeposit.value
    totalItemDeposit.value = metadataDeposit.value + itemDeposit.value + existentialDeposit.value
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
