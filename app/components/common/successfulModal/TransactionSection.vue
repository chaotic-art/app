<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { TransactionStatus } from '@/composables/useTransactionStatus'

const props = defineProps<{
  txHash?: string
  status: TransactionStatus
}>()

const { add: toast } = useToast()
const { getTransactionUrl } = useExplorer()
const { prefix } = usePrefix()

const txUrl = computed(() =>
  getTransactionUrl(props.txHash || '', prefix.value),
)
const { copy } = useClipboard({ source: txUrl })

const isFinalized = computed(() => props.status === TransactionStatus.Finalized)
</script>

<template>
  <div
    class="border border-gray-200 dark:border-gray-700 rounded-[4rem] py-[7px] px-2 flex items-center justify-between"
  >
    <div
      class="flex px-2 py-[6px] rounded-full gap-2"
      :class="[
        isFinalized
          ? 'text-green-600 bg-green-50'
          : 'text-gray-600 bg-gray-200',
      ]"
    >
      <UIcon
        v-if="isFinalized"
        name="i-mdi:check-circle-outline"
      />

      <p class="text-xs">
        {{ isFinalized ? $t('confirmed') : `${$t('finalazing')}...` }}
      </p>
    </div>

    <div class="flex items-center">
      <a
        :href="txUrl"
        class="ml-3 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        {{ $t('general.viewTx') }}
        <UIcon name="i-mdi:arrow-top-right" />
      </a>

      <UIcon
        name="i-mdi:circle"
        class="text-gray-500 opacity-20 mx-2 text-[0.5rem]"
        size="small"
      />

      <UButton
        variant="ghost"
        size="md"
        @click="() => {
          copy()
          toast({ title: $t('general.copyToClipboard') })
        }"
      >
        <UIcon
          name="i-mdi:content-copy"
          class="text-gray-500 cursor-pointer"
        />
      </UButton>
    </div>
  </div>
</template>
