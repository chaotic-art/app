import type { TxInBestBlocksFound } from 'polkadot-api'
import { Binary } from 'polkadot-api'
import useDropMassmint from '@/composables/drop/massmint/useDropMassmint'
import { updateGenartMetadata } from '@/composables/drop/useGenerativeDropMint'

const isModalOpen = ref(false)

export default function useDropMint() {
  const { doAfterLogin } = useDoAfterlogin()
  const { $i18n, $sdk } = useNuxtApp()
  const { accountId } = useAuth()
  const { prefix } = usePrefix()

  const { getConnectedSubAccount } = storeToRefs(useWalletStore())
  const dropStore = useDropStore()
  const { drop, loading, isCapturingImage, toMintNFTs, walletConnecting } = storeToRefs(dropStore)

  const blockNumber = ref<number>()
  const txHash = ref<string>()
  const isError = ref(false)

  const { massGenerate, clearMassMint } = useDropMassmint()
  const { status, resolveStatus, initTransactionLoader, isLoading: isTransactionLoading } = useTransactionStatus()

  const transaction = computed(() => ({
    txHash: txHash.value,
    status: status.value,
    isError: isError.value,
    isLoading: isTransactionLoading.value,
  }))

  function openMintModal() {
    massGenerate()
    isModalOpen.value = true
  }

  function mint() {
    if (!accountId.value) {
      walletConnecting.value = true
      doAfterLogin({
        onLoginSuccess: () => {
          walletConnecting.value = false
          openMintModal()
        },
        onCancel: () => {
          walletConnecting.value = false
        },
      })
      return
    }

    openMintModal()
  }

  async function executeSubTransaction() {
    const api = $sdk(prefix.value).api
    const collectionId = drop.value?.collection
    const price = drop.value?.price || null

    const nftsMetadata = toMintNFTs.value.map((nft) => {
      return {
        chain: drop.value.chain,
        collection: drop.value.collection,
        metadata: nft.metadata,
      }
    })

    const calls = toMintNFTs.value.map((allocatedNft) => {
      return api.tx.Nfts.mint({
        collection: Number(collectionId),
        item: allocatedNft.nft,
        mint_to: {
          type: 'Id',
          value: accountId.value!,
        },
        witness_data: {
          mint_price: price ? BigInt(price) : undefined,
        },
      })
    })

    const transactions = [
      ...calls,
      api.tx.System.remark({
        remark: Binary.fromText(JSON.stringify(nftsMetadata)),
      }),
    ]

    const transaction = api.tx.Utility.batch_all({
      calls: transactions.map(transaction => transaction.decodedCall),
    })

    const signer = await getConnectedSubAccount.value?.signer

    if (!signer) {
      return
    }

    isError.value = false
    initTransactionLoader()

    transaction.signSubmitAndWatch(signer)
      .subscribe({
        next: (event) => {
          resolveStatus(event)

          if (isError.value) {
            return
          }

          if (event.type === 'txBestBlocksState' && event.found && !event.ok) {
            const errorType = event.events.find(e => e.type === 'System' && e.value.type === 'ExtrinsicFailed')?.value.value.dispatch_error.type
            errorMessage($i18n.t('drop.mintDropError', [errorType || 'Something went wrong']))
            isError.value = true
            stopMint()
            return
          }

          if (event.type === 'txBestBlocksState' && event.found) {
            txHash.value = event.txHash.toString()
            blockNumber.value = (event as TxInBestBlocksFound).block.number
            submitMints()
          }
        },
        error: (error) => {
          errorMessage($i18n.t('drop.mintDropError', [error?.toString()]))
          if (!error.name.includes('cancelled')) {
            status.value = TransactionStatus.Cancelled
          }
          else {
            isError.value = true
          }
          stopMint()
        },
        complete: () => {
          isTransactionLoading.value = false
        },
      })
  }

  function executeTransaction() {
    executeSubTransaction()
  }

  async function submitMints() {
    try {
      updateGenartMetadata()

      loading.value = false
    }
    catch (error) {
      errorMessage($i18n.t('drop.mintDropError', [error?.toString()]))
      isCapturingImage.value = false
      closeMintModal()
      throw error
    }
  }

  const clearMint = () => {
    clearMassMint()
  }

  function closeMintModal() {
    isModalOpen.value = false
    clearMint()
  }

  function stopMint() {
    closeMintModal()
    loading.value = false
    clearMint()
  }

  return {
    mint,
    executeTransaction,
    isModalOpen,
    transaction,
  }
}
