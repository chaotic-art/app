<script setup lang="ts">
import { formatBalance } from 'dedot/utils'
import useDropMassMintState from '@/composables/drop/massmint/useDropMassMintState'
import useDropMint from '~/composables/drop/useDropMint'
import StepOverview from './StepOverview.vue'

const ModalSteps = {
  Overview: 'overview',
  Signing: 'signing',
  Succeded: 'succeded',
} as const

type ModalStep = typeof ModalSteps[keyof typeof ModalSteps]

const modalStep = ref<ModalStep>(ModalSteps.Overview)

const { $i18n } = useNuxtApp()
const { canMint } = useDropMassMintState()
const { minimumFunds } = useDropMinimumFunds()
const { decimals: tokenDecimals, chainSymbol: tokenSymbol, currentChain } = useChain()
const { existentialDeposit } = useDeposit(currentChain)
const { toMintNFTs, mintingSession } = storeToRefs(useDropStore())
const { executeTransaction, isModalOpen, transaction } = useDropMint()
const { balance, isLoading: isBalanceLoading } = useBalance({ enabled: isModalOpen })

const status = computed(() => mintingSession.value.status)

const { isTransactionSuccessful } = useTransactionSuccessful({
  status,
  isError: computed(() => mintingSession.value.failed),
  isLoading: computed(() => mintingSession.value.isLoading),
})

const loading = computed(() => !canMint.value || isBalanceLoading.value)

const isMintOverviewStep = computed(() => modalStep.value === ModalSteps.Overview)
const isSigningStep = computed(() => modalStep.value === ModalSteps.Signing)
const isSuccessfulDropStep = computed(() => modalStep.value === ModalSteps.Succeded)

const mintButton = computed(() => {
  if (loading.value) {
    return {
      label: 'Loading...',
      disabled: true,
    }
  }

  const deosntHaveEnoughBalance = balance.value < minimumFunds.value
  const isEdSlash = (balance.value - minimumFunds.value) < existentialDeposit.value

  // TODO add tx calculation
  if (deosntHaveEnoughBalance || isEdSlash) {
    return {
      label: $i18n.t('balance.insufficient'),
      alert: isEdSlash ? `You need to keep a minimum balance of ${formatBalance(existentialDeposit.value, { decimals: tokenDecimals.value, symbol: tokenSymbol.value })} in your account` : undefined,
      disabled: true,
    }
  }

  return {
    label: 'Proceed to Signing',
    disabled: false,
  }
})

const transactionStatus = computed(() => {
  if (status.value === TransactionStatus.Unknown) {
    return $i18n.t('transactionSteps.waiting')
  }

  return $i18n.t('transactionSteps.loading')
})

const moveSuccessfulDrop = computed<boolean>(
  () =>
    Boolean(mintingSession.value.items.length)
    && Boolean(mintingSession.value.txHash)
    && isTransactionSuccessful.value,
)

const title = computed(() => {
  if (isMintOverviewStep.value) {
    return $i18n.t('drop.mint')
  }

  if (isSigningStep.value) {
    return $i18n.t('signing.transaction')
  }

  return $i18n.t('general.success')
})

function onSubmit() {
  modalStep.value = ModalSteps.Signing
  executeTransaction()
}

watch(isModalOpen, (open) => {
  if (open) {
    modalStep.value = ModalSteps.Overview
  }
})

watchEffect(() => {
  if (moveSuccessfulDrop.value) {
    modalStep.value = ModalSteps.Succeded
  }
})

watchEffect(() => {
  mintingSession.value.isLoading = transaction.value.isLoading
  mintingSession.value.txHash = transaction.value.txHash
  mintingSession.value.failed = transaction.value.isError
  mintingSession.value.status = transaction.value.status
})
</script>

<template>
  <UModal
    v-model:open="isModalOpen"
    :title="title"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <StepOverview
        v-if="isMintOverviewStep"
        :loading="loading"
        :to-mint-nfts="toMintNFTs"
        :minimum-funds="minimumFunds"
        :mint-button="mintButton"
        @confirm="onSubmit"
      />
      <SigningModalBody
        v-else-if="isSigningStep"
        title="Minting NFT"
        :subtitle="transactionStatus"
        :status="status"
      />
      <SuccessfulDrop
        v-else-if="isSuccessfulDropStep"
        :minting-session="mintingSession"
      />
    </template>
  </UModal>
</template>
