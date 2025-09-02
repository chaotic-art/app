<script setup lang="ts">
import { getSubscanExtrinsicUrl } from '~/utils/format/address'

const props = defineProps<{
  result: TransferTransactionResult
  status: TransactionStatus
}>()

const txUrl = computed(() =>
  getSubscanExtrinsicUrl(props.result.hash || '', props.result.prefix),
)
</script>

<template>
  <div>
    <img src="/congrats-message-header.svg" alt="Success transfer" class="h-[200px] w-full grayscale">

    <div class="flex items-center flex-col gap-4">
      <p class="text-center">
        Your transfer was successful!
      </p>

      <UButton
        as="a"
        :href="txUrl"
        variant="outline"
        color="primary"
        label="Show Transaction"
      />
    </div>
  </div>
</template>
