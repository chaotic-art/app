<script setup lang="ts">
import { roundTo } from '@/utils/format/balance'

const props = defineProps<{
  modelValue?: number | string
  check?: boolean
}>()
const emit = defineEmits(['update:modelValue'])
const { currentChain } = useChain()
const balance = ref<number>(0)
const { getBalance } = useBalances()
const fiatStore = useFiatStore()
const { accountId } = useAuth()
const { decimals, chainSymbol } = useChain()

const isSymbolMode = ref(true)
const tokenAmount = ref<string | number | undefined>(props.modelValue || '')

const tokenPrice = computed(() => fiatStore.getCurrentTokenValue(chainSymbol.value as Token) as number)
function switchSymbolMode() {
  isSymbolMode.value = !isSymbolMode.value
}

const { usd: balanceUsd } = useAmount(
  computed(() => balance.value),
  decimals,
  chainSymbol,
)

const formattedOppositeCurrency = computed(() => {
  const value = roundTo(isSymbolMode.value ? Number(tokenAmount.value || 0) * tokenPrice.value : Number(tokenAmount.value || 0) / tokenPrice.value)
  const symbol = isSymbolMode.value ? 'USD' : chainSymbol.value
  return `${value} ${symbol}`
})

const model = computed({
  get: () => tokenAmount.value,
  set: (value) => {
    const newTokenAmount = value === ''
      ? undefined
      : (isSymbolMode.value ? value : (Number(value) / tokenPrice.value))
    emit('update:modelValue', newTokenAmount)
    tokenAmount.value = value
  },
})

onMounted(() => {
  if (fiatStore.incompleteFiatValues) {
    fiatStore.fetchFiatPrice()
  }

  getBalance({ address: accountId.value, prefix: currentChain.value })
    .then((data) => {
      balance.value = Number(data.balance)
    })
})

watch(isSymbolMode, async (isSymbol) => {
  if (isSymbol) {
    model.value = Number(roundTo((Number(model.value) / tokenPrice.value), 4))
  }
  else {
    model.value = Number(roundTo((Number(model.value) * tokenPrice.value), 4))
  }
})
</script>

<template>
  <div>
    <div class="flex gap-4">
      <UInput
        v-model="model"
        size="lg"
        type="number"
        step="0.01"
        min="0.0001"
        class="w-full"
        pattern="[0-9]+([\.,][0-9]+)?"
        :placeholder="$t('offer.typeOffer')"
      />

      <UButton
        class="w-fit rounded-lg"
        variant="secondary"
        @click="switchSymbolMode"
      >
        <div class="flex items-center gap-1">
          <div class="flex items-center">
            {{ isSymbolMode ? chainSymbol : 'USD' }}
          </div>
          <UIcon
            class="text-gray-600 dark:text-gray-400"
            name="tabler:arrows-cross"
          />
        </div>
      </UButton>
    </div>

    <div class="flex justify-between text-xs mt-3">
      <span class="text-gray-600 dark:text-gray-400">
        ~ {{ formattedOppositeCurrency }}
      </span>

      <div class="flex gap-1">
        {{ $t('general.balance') }}:
        <Money v-if="isSymbolMode" :value="balance" inline />
        <span v-else>
          {{ balanceUsd }} USD
        </span>
      </div>
    </div>
  </div>
</template>
