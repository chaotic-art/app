<script setup lang="ts">
import type { AssetHubChain } from '~/plugins/sdk.client'
import { useClipboard, whenever } from '@vueuse/core'
import { useBalancesPallets } from '@/composables/onchain/useBalancePallets'
import useQueryBalance from '~/composables/useQueryBalance'
import { isValidAddress } from '~/utils/format/address'

export interface TargetAddress {
  address: string
  usd: number
  token: number
  isInvalid?: boolean
}

type DisplayUnit = 'token' | 'usd'

const { t } = useI18n()
const { balance, transferableBalance, isLoading: isBalanceLoading } = useQueryBalance()
const { chainSymbol, decimals } = useChain()
const { accountId, isCurrentAccount } = useAuth()
const { prefix } = usePrefix()
const { getCurrentTokenValue } = useFiatStore()
const router = useRouter()
const route = useRoute()
const { usd: balanceUsd, formatted: balanceFormatted } = useAmount(balance, decimals, chainSymbol)
const { transfer } = useBalancesPallets()
const { walletConnectModalOpen } = storeToRefs(usePreferencesStore())
const currentTokenValue = computed(() => Number(getCurrentTokenValue(chainSymbol.value as any)))
const { copy } = useClipboard()

const isConfirmModalOpen = ref(false)
const sendSameAmount = ref(false)
const displayUnit = ref<DisplayUnit>('token')
const targetAddresses = ref<TargetAddress[]>([getDefaultAddress()])

const txFee: {
  native: number
  token: number
  usd: number
} = reactive({
  native: ref(0),
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
  transferableBalance,
  decimals,
  chainSymbol,
)

const insufficientBalance = computed(() => transferableBalance.value < amountToNative(totalValues.withFee.token, decimals.value))
const hasSelfTransfer = computed(() => targetAddresses.value.some(address => address.address && isCurrentAccount(address.address)))

const isDisabled = computed(() => (
  targetAddresses.value.some(address =>
    address.isInvalid
    || address.address === ''
    || insufficientBalance.value
    || (!address.usd && !address.token),
  )
  || !accountId.value
  || isBalanceLoading.value
  || hasSelfTransfer.value
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

const label = computed(() => {
  if (!accountId.value) {
    return t('general.connectWalletFirst')
  }

  if (hasSelfTransfer.value) {
    return t('transfer.selfTransfer')
  }

  if (insufficientBalance.value) {
    return t('balance.insufficient')
  }

  return t('transfer.continue')
})

function getDefaultAddress(): TargetAddress {
  return { address: '', usd: 0, token: 0, isInvalid: false }
}

function addRecipient() {
  targetAddresses.value.push(getDefaultAddress())
}

function onAmountChange(target: TargetAddress) {
  target.usd = target.token ? calculateUsdFromToken(target.token, currentTokenValue.value) : 0

  if (sendSameAmount.value) {
    unifyAddressAmount(target)
  }
}

function onUsdChange(target: TargetAddress) {
  target.token = target.usd ? calculateTokenFromUsd(target.usd, currentTokenValue.value) : 0

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

function onAddressCheck(target: TargetAddress, valid: boolean) {
  target.isInvalid = !valid
}

function onAddressFormatChange(target: TargetAddress, address: string) {
  target.address = address
}

async function handleTransfer() {
  try {
    isConfirmModalOpen.value = false

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

function generatePaymentLink(targets: TargetAddress[]): string {
  const url = new URL(`${location.origin}${location.pathname}`)

  targets.forEach((addr, i) => {
    const suffix = i === 0 ? '' : i

    url.searchParams.append(`target${suffix}`, addr.address)

    if (displayUnit.value === 'usd') {
      url.searchParams.append(`usdamount${suffix}`, String(addr.usd))
    }
    else {
      url.searchParams.append(`amount${suffix}`, String(addr.token))
    }
  })

  return url.toString()
}

function getPaymentQueryValues(queryKey: string, validate: ({ key, value }: { key: string, value: any }) => boolean) {
  return Object.entries(route.query)
    .filter(([key]) => key.startsWith(queryKey))
    .filter(([key, value]) => validate({ key, value }))
    .map(([, value]) => value as string)
}

const moreActions = computed(() => ([
  {
    label: t('transfer.payMeLink'),
    icon: 'heroicons:currency-dollar',
    onClick: () => {
      successMessage(t('general.copyToClipboard'))
      copy(generatePaymentLink([targetAddresses.value[0]] as TargetAddress[]))
    },
  },
  {
    label: t('transfer.recurringPaymentLink'),
    icon: 'heroicons:arrow-path-rounded-square-16-solid',
    onClick: () => {
      successMessage(t('general.copyToClipboard'))
      copy(generatePaymentLink(targetAddresses.value))
    },
  },
]))

watch([sendSameAmount, () => targetAddresses.value.length], ([value]) => {
  if (value) {
    const tokenAmount = targetAddresses.value[0]?.token as number
    const usdAmount = targetAddresses.value[0]?.usd as number
    targetAddresses.value = targetAddresses.value.map(address => ({
      ...address,
      token: tokenAmount,
      usd: usdAmount,
    }))
  }
})

watch(() => targetAddresses.value.length, async () => {
  try {
    txFee.native = 0

    const fee = await transfer({
      type: 'estimate',
      chain: prefix.value as AssetHubChain,
      targets: targetAddresses.value.map(() => ({
        address: CHAOTIC_MINTER,
        amount: amountToNative(1, decimals.value),
      })),
    })

    txFee.native = Number(fee || 0)
  }
  catch (error) {
    console.error('Failed getting fee:', error)
  }
}, { immediate: true })

whenever(() => Boolean(currentTokenValue.value), () => {
  const targets = getPaymentQueryValues('target', ({ value: address }) => isValidAddress(address))
  const amounts = getPaymentQueryValues('amount', ({ value }) => Boolean(Number(value)))
  const usdamount = getPaymentQueryValues('usdamount', ({ value }) => Boolean(Number(value)))

  if (targets.length === 0) {
    router.replace({ query: undefined })
    return
  }

  targetAddresses.value = targets.map((address, index) => {
    let token = Number(amounts[index] || '')
    let usd = Number(usdamount[index] || '')

    if (token) {
      usd = calculateUsdFromToken(token, currentTokenValue.value)
    }
    else if (usd) {
      token = calculateTokenFromUsd(usd, currentTokenValue.value)
    }

    return {
      address,
      usd,
      token,
    } as TargetAddress
  })

  displayUnit.value = amounts[0] ? 'token' : 'usd'

  if (targetAddresses.value.length > 1) {
    sendSameAmount.value = targetAddresses.value.map(({ token }) => token).every(Boolean)
  }
}, { once: true, immediate: true })
</script>

<template>
  <UContainer class="max-w-3xl px-4 md:px-6 py-10">
    <div class="border border-gray-300 rounded-xl p-5">
      <div class="flex items-center justify-between mb-5">
        <h1 class="font-bold text-4xl">
          {{ t('transfer.title') }}
        </h1>

        <UDropdownMenu
          :items="moreActions"
          :content="{ align: 'end', side: 'bottom', sideOffset: 8 }"
        >
          <UButton
            color="neutral"
            size="sm"
            class="h-7 w-7"
            icon="i-heroicons-ellipsis-horizontal"
          />
        </UDropdownMenu>
      </div>

      <div class="flex justify-between">
        <div class="flex flex-col">
          <span class="font-bold mb-2">{{ t('transfer.sender') }}</span>

          <UserInfo
            v-if="accountId"
            :address="accountId"
            :avatar-size="40"
            transparent-background
          />
          <UButton
            v-else
            :label="t('general.connectWallet')"
            @click="walletConnectModalOpen = true"
          />
        </div>

        <div class="flex flex-col items-end">
          <span class="font-bold mb-2">{{ t('general.balance') }}</span>
          <template v-if="isBalanceLoading">
            <USkeleton class="h-5 w-20 rounded mb-2" />
            <USkeleton class="h-5 w-16 rounded" />
          </template>
          <template v-else>
            <span>{{ balanceFormatted }}</span>
            <span class="text-gray-600 dark:text-gray-400"> = {{ balanceUsd }}</span>
          </template>
        </div>
      </div>

      <USeparator class="my-4" />

      <!-- Recipient -->
      <div class="flex flex-col gap-2 mb-5">
        <div class="flex justify-between max-md:hidden">
          <span class="font-bold">{{ t('transfer.recipient') }}</span>
          <span class="font-bold">{{ t('transfer.amount') }}</span>
        </div>

        <!-- Multi Address Input -->
        <div class="flex flex-col gap-3">
          <div
            v-for="(targetAddress, index) in targetAddresses" :key="index"
            class="flex flex-col gap-2"
          >
            <div class="flex items-center justify-between md:hidden">
              <span class="font-bold">{{ t('transfer.recipient') }} {{ index + 1 }}</span>
              <UButton
                v-if="targetAddresses.length > 1"
                variant="ghost"
                trailing-icon="i-lucide-trash"
                @click="targetAddresses.splice(index, 1)"
              />
            </div>

            <div class="flex flex-col md:flex-row gap-2">
              <UInput
                v-model="targetAddress.address"
                :placeholder="t('transfer.enterWalletAddress')"
                class="w-full"
                size="xl"
                :color="targetAddress.isInvalid ? 'error' : 'primary'"
                :trailing-icon="!targetAddress.isInvalid && targetAddress.address ? 'material-symbols:check-rounded' : undefined"
                :ui="{ base: targetAddress.isInvalid ? 'ring-2 ring-error' : undefined }"
              />

              <AddressChecker
                class="md:hidden"
                :address="targetAddress.address"
                @check="valid => onAddressCheck(targetAddress, valid)"
                @change="address => onAddressFormatChange(targetAddress, address)"
              />

              <div class="flex items-center gap-2">
                <UInput
                  v-if="displayUnit === 'token'"
                  v-model.number="targetAddress.token"
                  class="w-full"
                  type="number"
                  size="xl"
                  :min="0"
                  @update:model-value="onAmountChange(targetAddress)"
                >
                  <template #trailing>
                    <div class="text-gray-400 flex items-center">
                      <span class="text-sm">{{ chainSymbol }}</span>
                    </div>
                  </template>
                </UInput>

                <UInput
                  v-else
                  v-model.number="targetAddress.usd"
                  type="number"
                  class="w-full"
                  trailing-icon="i-material-symbols-attach-money"
                  size="xl"
                  :min="0"
                  @update:model-value="onUsdChange(targetAddress)"
                />

                <UButton
                  v-if="targetAddresses.length > 1"
                  class="max-md:hidden"
                  variant="ghost"
                  trailing-icon="i-lucide-trash"
                  @click="targetAddresses.splice(index, 1)"
                />
              </div>
            </div>

            <AddressChecker
              class="max-md:hidden"
              :address="targetAddress.address"
              @check="valid => onAddressCheck(targetAddress, valid)"
              @change="address => onAddressFormatChange(targetAddress, address)"
            />
          </div>

          <div class="flex justify-center">
            <UButton
              :label="t('transfer.addRecipient')"
              variant="ghost"
              trailing-icon="i-lucide-plus"
              @click="addRecipient"
            />
          </div>
        </div>
      </div>

      <!-- Send same amount -->
      <div class="flex justify-between items-end mb-5">
        <span>{{ t('transfer.sendSameAmount') }}</span>
        <USwitch v-model="sendSameAmount" size="xl" />
      </div>

      <!-- Display Unit -->
      <div class="flex justify-between items-end mb-5">
        <span>{{ t('transfer.displayUnits') }}</span>
        <div class="flex items-center gap-1">
          <span>{{ t('transfer.transferable') }}:</span>
          <USkeleton v-if="isBalanceLoading" class="h-5 w-20 rounded ml-1" />
          <span v-else class="font-bold">{{ displayUnit === 'usd' ? transferableBalanceUsd : transferableBalanceFormatted }}</span>
        </div>
      </div>

      <UTabs v-model="displayUnit" :content="false" :items="tabs" class="w-full mb-4" />

      <div class="flex flex-col gap-2 mb-6">
        <div class="flex justify-between items-end">
          <span class="text-xs">{{ t('transfer.networkFee') }}</span>
          <div class="flex gap-2 items-center">
            <span class="text-xs text-gray-400">({{ displayValues.fee[0] }})</span>
            <span>{{ displayValues.fee[1] }}</span>
          </div>
        </div>

        <div class="flex justify-between items-end">
          <span class="font-bold">{{ t('general.total') }}</span>
          <div class="flex gap-2 items-center">
            <span class="text-xs text-gray-400">({{ displayValues.total.withFee[0] }})</span>
            <span class="font-bold">{{ displayValues.total.withFee[1] }}</span>
          </div>
        </div>
      </div>

      <UButton
        class="w-full capitalize"
        color="neutral"
        :disabled="isDisabled"
        :label="label"
        size="xl"
        @click="isConfirmModalOpen = true"
      />
    </div>

    <LazyTransferConfirmModal
      v-model="isConfirmModalOpen"
      :target-addresses="targetAddresses"
      :display-total-value="displayValues.total.withFee"
      @confirm="handleTransfer"
    />
  </UContainer>
</template>
