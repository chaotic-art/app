<script setup lang="ts">
interface Props {
  nftCount: number
  addressCount: number
  distributionMode: string
}

const props = defineProps<Props>()
const emit = defineEmits(['confirm'])

const isOpen = defineModel<boolean>({ required: true })
const title = computed(() => `Airdrop ${props.nftCount} NFT${props.nftCount > 1 ? 's' : ''}`)

function handleConfirm() {
  emit('confirm')
  isOpen.value = false
}

function handleClose() {
  isOpen.value = false
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="title"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <div class="space-y-4">
        <!-- Summary Section -->
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-primary">Selected NFTs</span>
            <span class="font-medium">{{ nftCount }} {{ $t('airdrop.nfts') }}</span>
          </div>

          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-primary">Distribution Method</span>
            <span class="font-medium">{{ distributionMode }}</span>
          </div>

          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-primary">Recipients</span>
            <span class="font-medium">{{ addressCount }} {{ $t('airdrop.addresses') }}</span>
          </div>
        </div>

        <!-- Warning Section -->
        <UAlert
          variant="soft"
          color="warning"
          :title="$t('airdrop.incorrectAddresses')"
        />
      </div>
    </template>

    <template #footer>
      <div class="flex w-full justify-between gap-3">
        <UButton
          variant="outline"
          @click="handleClose"
        >
          Cancel
        </UButton>
        <UButton
          variant="solid"
          color="primary"
          @click="handleConfirm"
        >
          Confirm Airdrop
        </UButton>
      </div>
    </template>
  </UModal>
</template>
