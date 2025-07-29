<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import type { TxInBestBlocksFound } from 'polkadot-api'
import { watchDebounced } from '@vueuse/core'
import { Binary } from 'polkadot-api'
import useDropMassmint from '@/composables/drop/massmint/useDropMassmint'
import { useUpdateMetadata } from '@/composables/drop/useGenerativeDropMint'

const { chain } = useRoute().params
const chainPrefix = computed(() => chain?.toString() as Prefix)
const { prefix } = usePrefix()
const { add: toast } = useToast()
const { $i18n, $api } = useNuxtApp()
const { accountId } = useAuth()
const { getConnectedSubAccount } = storeToRefs(useWalletStore())

const isMintModalOpen = ref(false)
const { drop, loading, amountToMint, mintingSession, isCapturingImage, toMintNFTs } = storeToRefs(useDropStore())

const { decimals, chainSymbol } = useChain()
const { usd: usdPrice, formatted: formattedTokenPrice } = useAmount(computed(() => drop.value?.price), decimals, chainSymbol)

const blockNumber = ref()
const txHash = ref()
const isError = ref()

const { massGenerate, clearMassMint } = useDropMassmint()
const { status, resolveStatus, initTransactionLoader, isLoading: isTransactionLoading } = useTransactionStatus()

function mint() {
  if (!accountId.value) {
    return
  }

  massGenerate()
  isMintModalOpen.value = true
}

async function executeSubTransaction() {
  const api = $api(prefix.value)
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

        if (event.type === 'txBestBlocksState') {
          txHash.value = event.txHash.toString()
          blockNumber.value = (event as TxInBestBlocksFound).block.number
          submitMints()
        }
      },
      error: (error) => {
        toast({ title: $i18n.t('drop.mintDropError', [error?.toString()]) })
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
  execByVm({
    SUB: executeSubTransaction,
  })
}

async function submitMints() {
  try {
    await useUpdateMetadata({ blockNumber })

    loading.value = false
  }
  catch (error) {
    toast({ title: $i18n.t('drop.mintDropError', [error?.toString()]) })
    isCapturingImage.value = false
    closeMintModal()
    throw error
  }
}

function closeMintModal() {
  isMintModalOpen.value = false
  clearMassMint()
}

function stopMint() {
  closeMintModal()
  loading.value = false
  clearMassMint()
}

watchEffect(() => {
  mintingSession.value.isLoading = isTransactionLoading.value
  mintingSession.value.txHash = txHash.value
  mintingSession.value.failed = isError.value
  mintingSession.value.status = status.value
})

watchDebounced(isMintModalOpen, (open) => {
  if (!open) {
    clearMassMint()
  }
}, { debounce: 500 })
</script>

<template>
  <UContainer class="max-w-7xl px-4 md:px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <!-- left side -->
      <div>
        <!-- badge section -->
        <div class="flex gap-2 mb-4 justify-center lg:justify-start">
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-heroicons-star">
            Featured
          </UBadge>
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-token-polkadot">
            Polkadot
          </UBadge>
        </div>
        <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center lg:text-left mb-6 lg:mb-0">
          {{ drop.collectionName ?? '---' }}
        </h1>

        <div class="flex flex-col items-start md:flex-row md:items-center gap-4 justify-between my-6 lg:my-10">
          <div v-if="drop.creator" class="flex flex-col gap-2">
            <p class="text-sm text-gray-500">
              Created By
            </p>
            <div class="flex justify-between items-center gap-1">
              <div class="p-1 bg-gray-100 inline-block rounded-full">
                <UserInfo :avatar-size="40" :address="drop?.creator" />
              </div>

              <FollowButton
                :target="drop.creator"
                class="px-4 py-2 w-full sm:w-auto ml-0"
              />
            </div>
          </div>

          <div v-if="Number(drop?.minted)" class="flex flex-col gap-2">
            <p class="text-sm text-gray-500">
              Collected By
            </p>

            <DropCollectedBy
              :chain="chainPrefix"
              :collection-id="drop?.collection ?? ''"
              :max-address-count="5"
              size="medium"
            />
          </div>
        </div>

        <!-- description section -->
        <div class="text-sm md:text-base">
          <MarkdownPreview :source="drop?.collectionDescription ?? '---'" />
        </div>
      </div>

      <!-- right side -->
      <div class="order-1 lg:order-2">
        <!-- preview section -->
        <DropPreviewItem />

        <!-- stats section -->
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100 mt-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <p class="font-serif font-bold text-2xl md:text-3xl italic">
                {{ formattedTokenPrice }}
              </p>
              <p class="text-sm text-gray-500">
                {{ usdPrice }} USD
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <UInputNumber
                v-model="amountToMint"
                class="w-full sm:w-24" :min="1" :ui="{
                  base: 'rounded-full px-4 md:px-6 py-2 md:py-3',
                }"
              />
              <UButton class="rounded-full px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto" @click="mint">
                Mint Drop
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <USeparator class="my-12 md:my-20" />

    <DropItemsGrid
      v-if="drop"
      :collection-id="drop.collection"
    />
  </UContainer>

  <DropMintModal
    v-model="isMintModalOpen"
    @confirm="executeTransaction"
  />
</template>
