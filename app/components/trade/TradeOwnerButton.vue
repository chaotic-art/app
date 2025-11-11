<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { ButtonConfig } from '../common/button/FollowButton.client.vue'
import type { TradeNftItem, TradeType } from '@/components/trade/types'
import { TradeTypes } from '@/components/trade/types'

const props = defineProps<{
  trade: TradeNftItem
  loading?: boolean
  disabled?: boolean
  label?: string
  mainClass?: string
}>()
const emit = defineEmits(['clickMain'])
const { accountId } = useAuth()
const { $i18n } = useNuxtApp()

const { isTargetOfTrade, isCreatorOfTrade } = useIsTrade(computed(() => props.trade), accountId)

const onClick = () => emit('clickMain', props.trade)

const details: Record<TradeType, { cancel: string, accept: string, withdraw: string }> = {
  [TradeTypes.Swap]: {
    cancel: 'swap.cancelSwap',
    accept: 'general.accept',
    withdraw: 'swap.withdrawSwap',
  },
  [TradeTypes.Offer]: {
    cancel: 'offer.cancelOffer',
    accept: 'general.accept',
    withdraw: 'offer.withdrawOffer',
  },
}

type TradeButtonConfig = ButtonConfig & { color?: ButtonProps['color'] }

const tradeButtonConfig = computed<TradeButtonConfig | null>(() => {
  if (props.trade.isExpired) {
    return isCreatorOfTrade.value
      ? {
          label: $i18n.t(details[props.trade.type].withdraw),
          onClick,
        }
      : null
  }

  if (isCreatorOfTrade.value) {
    return {
      label: $i18n.t(details[props.trade.type].cancel),
      color: 'error',
      onClick,
    }
  }

  if (isTargetOfTrade.value) {
    return {
      label: $i18n.t(details[props.trade.type].accept),
      onClick,
    }
  }

  return null
})

const buttonConfig = computed<ButtonConfig | null>(() => {
  if (!tradeButtonConfig.value) {
    return null
  }

  const config = { ...tradeButtonConfig.value }

  Object.assign(config, { disabled: props.disabled })

  props.label && Object.assign(config, { label: props.label })

  return config
})
</script>

<template>
  <div class="flex items-center gap-2">
    <UButton
      v-if="buttonConfig"
      :class="mainClass"
      :label="buttonConfig.label"
      :loading="loading"
      variant="outline"
      :disabled="buttonConfig.disabled"
      :color="buttonConfig.color"
      @click="buttonConfig.onClick"
    />

    <!-- Conter swap here -->
  </div>
</template>
