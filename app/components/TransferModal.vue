<script setup lang="ts">
import { isAddress } from '@polkadot/util-crypto'
import { useNftPallets } from '~/composables/onchain/useNftPallets'

const emit = defineEmits<{ close: [boolean] }>()

const { currentChain } = useChain()
const { accountId, isCurrentAccount } = useAuth()
const { items } = useActionCartStore()
const { transferNfts } = useNftPallets()

const address = ref('')
const isAddressValid = ref(false)
const acknowledged = ref(false)

function getChainAddress(value: string) {
  try {
    return getss58AddressByPrefix(value, currentChain.value)
  }
  catch {
    return null
  }
}

const isYourAddress = computed(() => isCurrentAccount(getChainAddress(address.value) || ''))

const label = computed(() => {
  if (!address.value) {
    return 'Enter wallet address first'
  }
  if (!isAddressValid.value) {
    return 'Address is incorrect'
  }
  if (isYourAddress.value) {
    return 'Cannot transfer to yourself'
  }
  return `Transfer ${items.length} NFT(s)`
})

const disabled = computed(
  () =>
    !address.value
    || !isAddressValid.value
    || isYourAddress.value
    || !acknowledged.value,
)

function validateAddress() {
  if (!address.value) {
    isAddressValid.value = false
    return
  }

  const chainAddress = getss58AddressByPrefix(address.value, currentChain.value)
  isAddressValid.value = !!chainAddress && isAddress(chainAddress)
}

function transfer() {
  if (!address.value || !isAddressValid.value || isYourAddress.value) {
    return
  }

  const targetAddress = getChainAddress(address.value)
  if (!targetAddress) {
    return
  }

  transferNfts({
    items,
    chain: currentChain.value,
    targetAddress,
    type: 'submit',
  })

  emit('close', false)
}

watch(address, validateAddress)
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    :title="`Transfer ${items.length} NFT${items.length > 1 ? 's' : ''}`"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <div class="flex flex-col">
        <div class="p-3 border border-border rounded-full">
          <UserInfo
            :address="accountId"
            :avatar-size="40"
            transparent-background
          />
        </div>

        <div class="mt-5 flex flex-col gap-4">
          <CartItemDetails
            v-for="item in items"
            :key="item.id"
            :name="item.name"
            :image="item.metadata?.image"
            :collection-name="item.collection.name"
            :price="item.price"
          />
        </div>

        <USeparator class="my-4" />

        <div class="mb-4">
          <h2 class="mb-2 font-bold text-text-color capitalize">
            Transfer To
          </h2>

          <UInput
            v-model="address"
            placeholder="Enter wallet address"
            :error="address && !isAddressValid"
            class="w-full"
          />

          <div v-if="address && !isAddressValid" class="mt-1 text-sm text-red-500">
            Invalid address format
          </div>
          <div v-if="isYourAddress" class="mt-1 text-sm text-red-500">
            Cannot transfer to your own address
          </div>
        </div>

        <USeparator class="my-4" />

        <div class="flex items-start gap-3 mb-6">
          <UCheckbox
            v-model="acknowledged"
            :ui="{ base: 'mt-1' }"
          />
          <span class="text-foreground">
            I understand that items sent to the wrong address cannot be recovered.
          </span>
        </div>

        <UButton
          class="w-full"
          :disabled="disabled"
          variant="outline"
          color="primary"
          size="lg"
          @click="transfer"
        >
          {{ label }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
