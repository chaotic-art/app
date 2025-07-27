<script setup lang="ts">
import useDropMassMintState from '@/composables/drop/massmint/useDropMassMintState'
import StepOverview from './StepOverview.vue'

defineProps<{ status: TransactionStatus }>()
const emits = defineEmits(['confirm'])

const ModalSteps = {
  Overview: 'overview',
  Signing: 'signing',
  Succeded: 'succeded',
} as const

type ModalStep = typeof ModalSteps[keyof typeof ModalSteps]

const isModalOpen = defineModel<boolean>({ required: true })
const modalStep = ref<ModalStep>(ModalSteps.Overview)

const { canMint } = useDropMassMintState()
const { minimumFunds } = useDropMinimumFunds()
const { toMintNFTs } = storeToRefs(useDropStore())

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

function onSubmit() {
  emits('confirm')
  modalStep.value = ModalSteps.Signing
}

watch(isModalOpen, (open) => {
  if (open) {
    modalStep.value = ModalSteps.Overview
  }
})
</script>

<template>
  <UModal
    v-model:open="isModalOpen"
    title="Mint Drop"
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
      <div v-else-if="isSigningStep">
        isSigningStep: {{ status }}
      </div>
      <div v-else-if="isSuccessfulDropStep">
        isSuccessfulDropStep
      </div>
    </template>
  </UModal>
</template>
