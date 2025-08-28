<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { watchDebounced } from '@vueuse/core'
import { decodeAddress, encodeAddress } from 'dedot/utils'
import { useBalancesPallets } from '@/composables/onchain/useBalancePallets'

interface TargetAddress {
  address: string
  usd: number
  token: number
  isInvalid?: boolean
}

type DisplayUnit = 'token' | 'usd'

const { balance, isLoading: isBalanceLoading } = useBalance()
const { chainSymbol, decimals } = useChain()
const { accountId } = useAuth()
const { prefix } = usePrefix()
const { getCurrentTokenValue } = useFiatStore()
const { existentialDeposit } = useDeposit(prefix)
const { usd: balanceUsd, formatted: balanceFormatted } = useAmount(balance, decimals, chainSymbol)
const { transfer } = useBalancesPallets()
const currentTokenValue = computed(() => Number(getCurrentTokenValue(chainSymbol as any)))

const sendSameAmount = ref(false)
const displayUnit = ref<DisplayUnit>('token')
const targetAddresses = ref<TargetAddress[]>([getDefaultAddress()])

const txFee: {
  native: number
  token: number
  usd: number
} = reactive({
  native: ref(1e9),
  token: computed(() => nativeToAmount(txFee.native, decimals.value)),
  usd: computed(() => calculateUsdFromToken(txFee.token, currentTokenValue.value)),
})

const totalValues: {
  withoutFee: {
    token: number
    usd: number
  }
  withFee: {
    token: number
    usd: number
  }
} = reactive({
  withoutFee: {
    usd: computed<number>(() => sum(targetAddresses.value.map(({ usd }) => usd))),
    token: computed<number>(() => sum(targetAddresses.value.map(({ token }) => token))),
  },
  withFee: {
    usd: computed<number>(() => totalValues.withoutFee.usd + calculateUsdFromToken(txFee.token, currentTokenValue.value)),
    token: computed<number>(() => totalValues.withoutFee.token + txFee.token),
  },
})

const displayValues = computed(() => ({
  fee: getDisplayUnitBasedValues(
    calculateExactUsdFromToken(
      txFee.token,
      currentTokenValue.value,
    ),
    txFee.token,
  ),
  total: {
    withoutFee: getDisplayUnitBasedValues(
      totalValues.withoutFee.usd,
      totalValues.withoutFee.token,
    ),
    withFee: getDisplayUnitBasedValues(
      totalValues.withFee.usd,
      totalValues.withFee.token,
    ),
  },
}))

const {
  usd: transferableBalanceUsd,
  formatted: transferableBalanceFormatted,
} = useAmount(
  computed(() => Math.max(balance.value - existentialDeposit.value, 0)),
  decimals,
  chainSymbol,
)

const isDisabled = computed(() => (
  targetAddresses.value.some(address =>
    address.isInvalid
    || (!address.usd && !address.token),
  )
  || isBalanceLoading.value
))

const tabs = computed(() => {
  return [
    {
      label: 'Token',
      value: 'token',
    },
    {
      label: 'USD',
      value: 'usd',
    },
  ]
})

function getDefaultAddress(): TargetAddress {
  return { address: '', usd: 0, token: 0, isInvalid: true }
}

function addRecipient() {
  targetAddresses.value.push(getDefaultAddress())
}

function onAmountChnage(target: TargetAddress) {
  target.usd = calculateUsdFromToken(target.token, Number(getCurrentTokenValue(chainSymbol.value as any)))

  if (sendSameAmount.value) {
    unifyAddressAmount(target)
  }
}

function getDisplayUnitBasedValues(usdValue: number, tokenAmount: number): [string, string] {
  return displayUnit.value === 'token'
    ? [`$${usdValue}`, `${tokenAmount} ${chainSymbol.value}`]
    : [`${tokenAmount} ${chainSymbol.value}`, `$${usdValue}`]
}

function unifyAddressAmount(target: TargetAddress) {
  targetAddresses.value = targetAddresses.value.map(address => ({
    ...address,
    token: target.token,
    usd: target.usd,
  }))
}

async function handleTransfer() {
  try {
    await transfer({
      chain: prefix.value as AssetHubChain,
      targets: targetAddresses.value.map(address => ({
        address: address.address,
        amount: amountToNative(address.token, decimals.value),
      })),
    })
  }
  catch (error) {
    console.error('Transfer failed:', error)
  }
}

watchDebounced(
  targetAddresses,
  () => {
    targetAddresses.value.forEach((address) => {
      try {
        decodeAddress(encodeAddress(address.address))
        address.isInvalid = false
      }
      catch {
        address.isInvalid = true
      }
    })
  },
  { debounce: 200, deep: true },
)
</script>

<template>
  <UContainer class="max-w-3xl px-4 md:px-6 py-10">
    <div class="border border-gray-300 rounded-xl p-5">
      <h1 class="font-bold text-4xl mb-4">
        Transfer
      </h1>

      <div class="flex justify-between">
        <div class="flex flex-col">
          <span class="font-bold mb-2">Sender</span>

          <UserInfo
            v-if="accountId"
            :address="accountId"
            :avatar-size="40"
            transparent-background
          />
          <UButton
            v-else
            label="Connect Wallet"
          />
        </div>

        <div class="flex flex-col items-end">
          <span class="font-bold mb-2">Balance</span>
          <span>{{ balanceFormatted }}</span>
          <span class="text-gray-600 dark:text-gray-400"> = {{ balanceUsd }}</span>
        </div>
      </div>

      <USeparator class="my-4" />

      <!-- Recipient -->
      <div class="flex flex-col gap-2 mb-5">
        <div class="flex justify-between">
          <span class="font-bold">Recipient</span>
          <span class="font-bold">Amount</span>
        </div>

        <!-- Multi Address Input -->
        <div class="flex flex-col gap-2">
          <div
            v-for="(targetAddress, index) in targetAddresses" :key="index"
            class="flex gap-2"
          >
            <UInput
              v-model="targetAddress.address"
              placeholder="Enter wallet address"
              class="w-full"
              size="xl"
            />

            <div class="flex items-center gap-2">
              <UInput
                v-model.number="targetAddress.token"
                type="number"
                size="xl"
                @update:model-value="() => onAmountChnage(targetAddress)"
              >
                <template #trailing>
                  <div class="text-gray-400 flex items-center">
                    <UIcon v-if="displayUnit === 'usd'" name="i-material-symbols-attach-money" />
                    <span v-else class="text-sm">{{ chainSymbol }}</span>
                  </div>
                </template>
              </UInput>

              <UButton
                v-if="targetAddresses.length > 1"
                variant="ghost"
                trailing-icon="i-lucide-trash"
                @click="targetAddresses.splice(index, 1)"
              />
            </div>
          </div>

          <div class="flex justify-center">
            <UButton
              label="Add recipient"
              variant="ghost"
              trailing-icon="i-lucide-plus"
              @click="addRecipient"
            />
          </div>
        </div>
      </div>

      <!-- Send same amount -->
      <div class="flex justify-between items-end mb-5">
        <span>Send same amount</span>
        <USwitch v-model="sendSameAmount" size="xl" />
      </div>

      <!-- Display Unit -->
      <div class="flex justify-between items-end mb-5">
        <span>Display units</span>
        <div class="flex gap-1">
          <span>Transferable:</span>
          <span class="font-bold">{{ displayUnit === 'usd' ? transferableBalanceUsd : transferableBalanceFormatted }}</span>
        </div>
      </div>

      <UTabs v-model="displayUnit" :content="false" :items="tabs" class="w-full mb-4" />

      <div class="flex flex-col gap-2 mb-6">
        <div class="flex justify-between items-end">
          <span class="text-xs">Network Fee</span>
          <div class="flex gap-2 items-center">
            <span class="text-xs text-gray-400">({{ displayValues.fee[0] }})</span>
            <span>{{ displayValues.fee[1] }}</span>
          </div>
        </div>

        <div class="flex justify-between items-end">
          <span class="font-bold">Total</span>
          <div class="flex gap-2 items-center">
            <span class="text-xs text-gray-400">({{ displayValues.total.withFee[0] }})</span>
            <span class="font-bold">{{ displayValues.total.withFee[1] }}</span>
          </div>
        </div>
      </div>

      <UButton
        class="w-full"
        color="neutral"
        :disabled="isDisabled"
        label="Continue"
        size="xl"
        @click="handleTransfer"
      />
    </div>
  </UContainer>
</template>
