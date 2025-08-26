<script setup lang="ts">
import type { ActionButton } from './ActionButtons.vue'
import type { TransactionStatus } from '@/composables/useTransactionStatus'

export interface ShareProp {
  disabled?: boolean
  text: string
  url: string
  withCopy?: boolean
}
type ActionButtonWithHandler = ActionButton & { onClick: () => void }

export interface ActionButtonsProp {
  primary: ActionButtonWithHandler
  secondary?: ActionButtonWithHandler
}

const props = defineProps<{
  status: TransactionStatus
  txHash?: string
  share: ShareProp
  actionButtons: ActionButtonsProp
}>()

function handleSecondaryActionClick() {
  if (props.actionButtons.secondary) {
    props.actionButtons.secondary.onClick()
  }
}
</script>

<template>
  <div>
    <TransactionSection
      v-if="txHash"
      :tx-hash="txHash"
      :status="status"
    />

    <div class="mt-5">
      <slot />
    </div>

    <USeparator class="my-5" />

    <ShareSocialsSection
      :disabled="share.disabled"
      :text="share.text"
      :url="share.url"
      :with-copy="share.withCopy"
    />

    <slot name="actions">
      <ActionButtons
        :primary="actionButtons.primary"
        :secondary="actionButtons.secondary"
        @primary="actionButtons.primary.onClick"
        @secondary="handleSecondaryActionClick"
      />
    </slot>
  </div>
</template>
