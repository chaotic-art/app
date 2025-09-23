<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core'
import { decodeAddress, encodeAddress, isEvmAddress } from 'dedot/utils'
import { DistributionMode } from '@/components/airdrop/types'
import { downloadAirdropTemplate } from '@/components/airdrop/utils'
import { useAirdropStore } from '@/stores/airdrop'
import { CHAOTIC_MINTER } from '@/utils/support'
import AddressFormatWarning from '~/components/airdrop/AddressFormatWarning.client.vue'
import { useNftPallets } from '~/composables/onchain/useNftPallets'

const router = useRouter()
const { $i18n } = useNuxtApp()
const { isCurrentAccount } = useAuth()
const airdropStore = useAirdropStore()
const { currentChain } = useChain()
const ss58Format = computed(() => chainSpec[currentChain.value].ss58Format)
const { airdropNfts } = useNftPallets()
const { open: isTransactionModalOpen, close: closeTransactionModal, isSuccess: isTransactionSuccess } = useTransactionModal()

const batchAddressesInput = ref('')
const airdropItems = computed(() => airdropStore.itemsInChain)
const addressList = ref<string[]>([])
const validAddressList = ref<string[]>([])
const invalidAddressList = ref<{ address: string, index: number, invalidReason: string }[]>([])
const invalidAddressExpanded = ref<boolean>(false)
const isAirdropModalOpen = ref<boolean>(false)
const distributionMode = ref<DistributionMode>(DistributionMode.ONE_PER_ADDRESS)
const fileInput = ref<HTMLInputElement | null>(null)
const addressPairNeedToBeFixed = ref<[string, string][]>([])
const { accountId } = useAuth()

const DISTRIBUTION_MODES = computed(() => [
  {
    label: $i18n.t('airdrop.onePerAddress'),
    value: DistributionMode.ONE_PER_ADDRESS,
    description: $i18n.t('airdrop.onePerAddressDescription'),
  },
  {
    label: $i18n.t('airdrop.random'),
    value: DistributionMode.RANDOM,
    description: $i18n.t('airdrop.randomDescription'),
  },
])

const validAddressCount = computed(() => validAddressList.value.length)
const totalNftCount = computed(() => airdropItems.value.length)

const addressMoreThanNftWarning = computed<boolean>(() =>
  distributionMode.value === DistributionMode.ONE_PER_ADDRESS
  && validAddressCount.value > totalNftCount.value,
)

const submitButtonLabel = computed(() => {
  if (addressPairNeedToBeFixed.value.length) {
    return $i18n.t('airdrop.wrongAddressFormatError')
  }
  if (addressMoreThanNftWarning.value) {
    return $i18n.t('airdrop.moreThanNftWarning')
  }
  if (invalidAddressList.value.length) {
    return $i18n.t('airdrop.fixErrorsFirst')
  }
  if (!validAddressList.value.length) {
    return $i18n.t('airdrop.noAddressesEntered')
  }
  return $i18n.t('airdrop.reviewAirdrop')
})

const addressLessThanNftWarning = computed<boolean>(() => Boolean(
  distributionMode.value === DistributionMode.ONE_PER_ADDRESS
  && validAddressCount.value
  && validAddressCount.value < totalNftCount.value,
))

const disabledButton = computed(() => Boolean(
  !validAddressList.value.length
  || invalidAddressList.value.length
  || !airdropItems.value.length
  || addressPairNeedToBeFixed.value.length
  || addressMoreThanNftWarning.value,
))

const addressCounterClass = computed(() => {
  if (distributionMode.value === DistributionMode.ONE_PER_ADDRESS) {
    if (validAddressCount.value > totalNftCount.value) {
      return 'text-red-600 bg-red-100 dark:bg-red-950'
    }
    else if (validAddressCount.value === totalNftCount.value) {
      return 'text-green-600 bg-green-100 dark:bg-green-950'
    }
    return 'text-blue-600 bg-blue-100 dark:bg-blue-950'
  }
  return 'text-blue-600 bg-blue-100 dark:bg-blue-950'
})

const handleBatchAddressesInput = useDebounceFn(() => {
  addressPairNeedToBeFixed.value = []
  const addresses = batchAddressesInput.value === ''
    ? []
    : batchAddressesInput.value
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(addr => addr.trim())

  addressList.value = addresses
  const allValidAddressList: string[] = []
  const allInvalidAddressList: { address: string, index: number, invalidReason: string }[] = []

  addresses.forEach((addr, index) => {
    let invalidReason = ''

    if (addr) {
      const formattedAddress = correctAddressFormat(addr)
      if (formattedAddress) {
        const isSelfAddress = isCurrentAccount(formattedAddress)
        const isDuplicate = allValidAddressList.includes(formattedAddress)
        if (formattedAddress !== addr) {
          invalidReason = $i18n.t('airdrop.addressWrongNetworkError')
          addressPairNeedToBeFixed.value.push([addr, formattedAddress])
        }
        else if (isSelfAddress) {
          invalidReason = $i18n.t('airdrop.ownAddressError')
        }
        else if (isDuplicate) {
          invalidReason = $i18n.t('airdrop.duplicateAddressError')
        }
        else {
          allValidAddressList.push(formattedAddress)
          return
        }
      }
      else {
        invalidReason = $i18n.t('airdrop.invalidAddressError')
      }
    }
    else {
      invalidReason = $i18n.t('airdrop.emptyLineError')
    }

    allInvalidAddressList.push({ address: addr, index, invalidReason })
  })

  validAddressList.value = allValidAddressList
  invalidAddressList.value = allInvalidAddressList
}, 1000)

function handleAddressAutoCorrection() {
  let addressesText = batchAddressesInput.value

  addressPairNeedToBeFixed.value.forEach(([addr, formattedAddress]) => {
    addressesText = addressesText.replaceAll(addr, formattedAddress)
  })

  batchAddressesInput.value = addressesText
  handleBatchAddressesInput()
}

function correctAddressFormat(address: string) {
  try {
    if (isEvmAddress(address)) {
      return null
    }
    const publicKey = decodeAddress(address)
    return encodeAddress(publicKey, ss58Format.value)
  }
  catch {
    return null
  }
}

function handleConfirm() {
  isTransactionModalOpen.value = true
  airdropNfts({
    items: {
      addresses: validAddressList.value,
      nfts: airdropItems.value.map(item => ({
        sn: item.sn,
        collectionId: item.collection.id,
      })),
      distributionMode: distributionMode.value,
    },
    chain: currentChain.value,
    type: 'submit',

  })
}

function handleSubmit() {
  isAirdropModalOpen.value = true
}

function goBack() {
  router.back()
}

function triggerFileInput() {
  fileInput.value?.click()
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (file) {
    try {
      const text = await file.text()
      batchAddressesInput.value = text
      handleBatchAddressesInput()
    }
    catch (error) {
      warningMessage(`${$i18n.t('airdrop.errorReadingCsvFile')}: ${error}`)
      console.warn('Error reading CSV file:', error)
    }
    finally {
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }
  }
}

watch(isTransactionSuccess, (isSuccess) => {
  if (isSuccess) {
    closeTransactionModal()
    successMessage('Airdrop successful! There is a 1 minute indexer and worker delay for this action to appear in the website.')
    setTimeout(() => {
      router.push(`/${currentChain.value}/u/${accountId.value}`)
    }, 5000)
  }
})

onBeforeUnmount(() => {
  airdropStore.clear()
})
</script>

<template>
  <div class="max-w-[480px] mx-auto p-4">
    <UButton
      class="mb-6 md:absolute md:top-[120px] md:left-[40px]"
      variant="outline"
      icon="i-lucide-arrow-left"
      @click="goBack"
    >
      {{ $t('airdrop.back') }}
    </UButton>

    <div>
      <div class="text-3xl font-semibold mb-6">
        {{ $t('airdrop.airdropNfts') }}
      </div>

      <div class="mb-4">
        <div class="flex justify-between items-center gap-2 mb-4">
          <div class="">
            {{ $t('airdrop.selected') }}
          </div>

          <div class="text-sm px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
            {{ totalNftCount }} {{ $t('airdrop.nfts') }}
          </div>
        </div>

        <div class="text-[14px] flex items-center gap-2 opacity-50">
          <UIcon name="i-lucide-arrow-right" class="w-4 h-4" />
          {{ $t('airdrop.upTo', [totalNftCount]) }}
        </div>
      </div>
      <UDivider class="my-5" />

      <div class="mb-6">
        <div class="font-semibold mb-3">
          {{ $t('airdrop.distributionMethod') }}
        </div>
        <div class="space-y-6">
          <label
            v-for="mode in DISTRIBUTION_MODES"
            :key="mode.value"
            class="flex items-center cursor-pointer"
          >
            <input
              v-model="distributionMode"
              type="radio"
              :value="mode.value"
              class="mr-3  accent-primary cursor-pointer"
            >
            <div class="text-sm">
              <div class="font-semibold mb-1">
                {{ mode.label }}
              </div>
              <div class="opacity-50">
                {{ mode.description }}
              </div>
            </div>
          </label>
        </div>
        <USeparator class="my-6" />

        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <div class="font-semibold">
              {{ $t('airdrop.recipientAddresses') }}
            </div>
            <div
              :class="addressCounterClass"
              class="text-sm px-2 rounded-full"
            >
              <div v-if="distributionMode === DistributionMode.ONE_PER_ADDRESS">
                {{ $t('airdrop.max', [validAddressCount, totalNftCount]) }}
              </div>
              <div v-if="distributionMode === DistributionMode.RANDOM">
                {{ validAddressCount }} {{ $t('airdrop.addresses') }}
              </div>
            </div>
          </div>
          <div class="text-sm opacity-50 mb-5">
            {{ $t('airdrop.enterOneWalletAddressPerLine') }}
          </div>
          <UTextarea
            v-model="batchAddressesInput"
            class="w-full"
            autosize
            :rows="5"
            :placeholder="`${CHAOTIC_MINTER}\n${CHAOTIC_MINTER}`"
            @input="handleBatchAddressesInput"
          />

          <div
            v-if="invalidAddressList.length"
            class="mb-4"
          >
            <div class="flex items-center justify-between my-4">
              <div class="font-medium">
                {{ $t('airdrop.addressValidation') }}
              </div>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-alert-triangle" class="w-4 h-4 text-red-500" />
                {{ invalidAddressList.length }} {{ $t(invalidAddressList.length > 1 ? 'airdrop.errors' : 'airdrop.error') }}
                <UButton
                  variant="outline"
                  class="!w-[30px] !h-[30px] !min-w-[unset] p-0"
                  :icon="invalidAddressExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                  size="sm"
                  @click="invalidAddressExpanded = !invalidAddressExpanded"
                />
              </div>
            </div>

            <div
              v-if="invalidAddressExpanded"
              class="space-y-2"
            >
              <div
                v-for="({ index, invalidReason }, idx) in invalidAddressList"
                :key="idx"
                class="flex items-center gap-4 p-2 bg-red-50 dark:bg-red-950 text-sm"
              >
                <UIcon
                  name="i-lucide-alert-circle"
                  class="text-red-500"
                />

                <div>
                  {{ $t('airdrop.line') }} {{ index + 1 }}: {{ invalidReason }}
                </div>
              </div>
            </div>
          </div>

          <AddressFormatWarning
            v-if="addressPairNeedToBeFixed.length"
            @change="handleAddressAutoCorrection"
          />

          <div
            v-if="addressMoreThanNftWarning"
            class="flex gap-4 px-2 py-1 my-2 bg-red-50 dark:bg-red-950"
          >
            <UIcon
              name="i-lucide-alert-circle"
              class="text-red-500 w-10"
            />

            <div class="text-sm">
              {{ $t('airdrop.onePerAddressWarning', [validAddressCount, totalNftCount, validAddressCount - totalNftCount]) }}
            </div>
          </div>
          <div
            v-if="addressLessThanNftWarning"
            class="flex gap-4 px-2 py-1 mt-2 bg-blue-50 dark:bg-blue-950"
          >
            <UIcon
              name="i-lucide-info"
              class="text-blue-500 w-15"
            />
            <div class="text-sm">
              {{ $t('airdrop.onePerAddressLessWarning', [validAddressCount, totalNftCount, validAddressCount, totalNftCount - validAddressCount]) }}
            </div>
          </div>
          <div class="flex gap-3 mt-4">
            <UButton
              variant="outline"
              icon="i-lucide-file"
              size="sm"
              class="text-sm px-2"
              @click="triggerFileInput"
            >
              {{ $t('Import CSV') }}
            </UButton>
            <input
              ref="fileInput"
              type="file"
              accept=".csv"
              class="hidden"
              @change="handleFileSelect"
            >
            <UButton
              variant="ghost"
              icon="i-lucide-download"
              size="sm"
              class="text-sm px-2"
              @click="downloadAirdropTemplate"
            >
              {{ $t('airdrop.template') }}
            </UButton>
          </div>
        </div>

        <UDivider class="my-5" />

        <div class="flex items-center gap-2 text-sm mb-4">
          <UIcon
            name="i-lucide-info"
            class="w-4 h-4"
          />
          {{ $t('airdrop.incorrectAddresses') }}
        </div>

        <div class="flex justify-between items-center gap-2">
          <UButton
            variant="outline"
            @click="goBack"
          >
            {{ $t('general.cancel') }}
          </UButton>
          <UButton
            variant="solid"
            color="primary"
            class="capitalize"
            :disabled="disabledButton"
            @click="handleSubmit"
          >
            {{ submitButtonLabel }}
          </UButton>
        </div>
      </div>
    </div>

    <AirdropConfirmModal
      v-model="isAirdropModalOpen"
      :nft-count="totalNftCount"
      :address-count="validAddressCount"
      :distribution-mode="DISTRIBUTION_MODES.find(mode => mode.value === distributionMode)?.label!"
      @confirm="handleConfirm"
    />
  </div>
</template>
