<script setup lang="ts">
import useDropMassMintState from '@/composables/drop/massmint/useDropMassMintState'
import StepOverview from './StepOverview.vue'

const emits = defineEmits(['confirm'])

const ModalSteps = {
  Overview: 'overview',
  Signing: 'signing',
  Succeded: 'succeded',
} as const

type ModalStep = typeof ModalSteps[keyof typeof ModalSteps]

const isModalOpen = defineModel<boolean>({ required: true })
const modalStep = ref<ModalStep>(ModalSteps.Overview)

const { $i18n } = useNuxtApp()
const { canMint } = useDropMassMintState()
const { minimumFunds } = useDropMinimumFunds()
const { toMintNFTs, mintingSession } = storeToRefs(useDropStore())

const status = computed(() => mintingSession.value.status)

const { isTransactionSuccessful } = useTransactionSuccessful({
  status,
  isError: computed(() => mintingSession.value.failed),
  isLoading: computed(() => mintingSession.value.isLoading),
})

const loading = computed(() => !canMint.value)

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
  emits('confirm')
  modalStep.value = ModalSteps.Signing
}

watch(isModalOpen, (open) => {
  if (open) {
    modalStep.value = ModalSteps.Overview
  }
})

watchEffect(() => {
  if (
    moveSuccessfulDrop.value
  ) {
    modalStep.value = ModalSteps.Succeded
  }
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
