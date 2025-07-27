import type { Prefix } from '@kodadot1/static'

import { CHAINS } from '@kodadot1/static'
// import { balanceOf } from '@kodadot1/sub-api'
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'
import { chainPropListOf } from '@/utils/chain'
import format from '@/utils/format/balance'

export default function (prefix: Ref<Prefix>) {
  const { $api } = useNuxtApp()

  const { accountId } = useAuth()
  const { isAssetHub } = useIsChain(prefix)

  const balance = ref()

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
      const api = $api(prefix.value)
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

  watchEffect(async () => {
    if (isEnabled.value) {
      const api = $api(prefix.value)

      // get chain symbol and decimals
      // const chainInfo = await api.registry.getChainProperties()
      // chainSymbol.value = chainInfo?.tokenSymbol.toHuman()?.[0]

      // set balance
      if (accountId.value) {
        const chain = CHAINS[prefix.value]
        const publicKey = decodeAddress(accountId.value)
        const prefixAddress = encodeAddress(publicKey, chain.ss58Format)

        // balance.value = await balanceOf(api, prefixAddress)
        // balance.value = format(balance.value, chain.tokenDecimals, false)
      }
    }
  })

  return {
    balance,
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
