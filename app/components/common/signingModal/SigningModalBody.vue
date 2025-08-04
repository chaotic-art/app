<script setup lang="ts">
import type { TransactionStatus } from '@/composables/useTransactionStatus'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle: string
    failed?: boolean
    status?: TransactionStatus
    customFormattedEstimation?: string
  }>(),
  {
    failed: false,
    customFormattedEstimation: undefined,
  },
)
defineEmits(['retry'])

const { formattedState, isTransactionInProgress } = useTransactionEstimatedTime(
  computed(() => props.status),
)

const showEstimation = computed(() =>
  props.customFormattedEstimation
    ? true
    : isTransactionInProgress.value && !props.failed,
)

const formattedEstimation = computed(
  () => props.customFormattedEstimation || formattedState.value,
)
</script>

<template>
  <slot>
    <div class="pb-5 flex items-start">
      <UIcon
        name="i-mdi:lightbulb"
        size="small"
        class="mr-2"
      />
      <p
        class="text-xs capitalize"
        v-html="$t('signing.tip')"
      />
    </div>
  </slot>

  <div class="h-[200px]">
    <SkeletonLoader
      :title="title"
      :subtitle="subtitle"
      solid
    >
      <template v-if="failed">
        <UIcon
          name="i-heroicons-x-mark"
          class="text-k-red mr-6 w-6 h-6"
        />

        <div>
          <p class="capitalize font-bold text-base">
            {{ title }}
          </p>
          <div class="flex items-center">
            <p class="capitalize text-base text-gray-500">
              {{ $t('transactionSteps.error') }}
            </p>

            <UButton
              class="ml-4"
              variant="outline"
              size="xs"
              @click="() => $emit('retry')"
            >
              {{ $t('helper.tryAgain') }}
            </UButton>
          </div>
        </div>
      </template>

      <template
        v-if="showEstimation"
        #footer
      >
        <SkeletonLoaderFooterPill
          :full-width="Boolean(customFormattedEstimation)"
        >
          {{ formattedEstimation }}
        </SkeletonLoaderFooterPill>
      </template>
    </SkeletonLoader>
  </div>
</template>
