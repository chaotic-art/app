<script setup lang="ts">
import type { SupportedChain } from '~/plugins/sdk.client'
import { isValidAddressByss58Format } from '~/utils/format/address'

const props = defineProps<{ address: string }>()
const emit = defineEmits<{
  (e: 'check', valid: boolean): void
  (e: 'change', address: string): void
}>()

interface AddressCheckResult {
  valid: boolean
  wrongAddressType?: 'unknown' | 'wrongChain'
  value?: string
}

const chains = ['ahk', 'ahp'] as SupportedChain[]

const showSuccess = ref(false)
const addressCheck = ref<AddressCheckResult>()

const { t } = useI18n()
const { ss58Format, chainSymbol, currentChain, chainName } = useChain()

const details = computed<{ title: string, description: string }>(() => {
  if (!addressCheck.value || addressCheck.value.valid) {
    return { title: '', description: '' }
  }

  if (addressCheck.value.wrongAddressType === 'wrongChain') {
    return {
      title: t('addressChecker.error.wrongChain.title'),
      description: t('addressChecker.error.wrongChain.message', {
        addressChainToken: addressCheck.value.value,
        currentChainToken: chainSymbol.value,
      }),
    }
  }

  return {
    title: t('addressChecker.error.unknown.title'),
    description: t('addressChecker.error.unknown.message'),
  }
})

function getAddressCheck(address: string): AddressCheckResult {
  if (isValidAddressByss58Format(address, ss58Format.value)) {
    return { valid: true }
  }

  const checks = chains.map(chain => isValidAddressByss58Format(address, chainSpec[chain].ss58Format))

  if (checks.some(Boolean)) {
    const chain = chains[chains.findIndex(Boolean)]

    return { valid: false, wrongAddressType: 'wrongChain', value: chainSpec[chain!].tokenSymbol }
  }

  const isValidGeneric = isValidAddressByss58Format(props.address, 42)

  if (isValidGeneric) {
    return { valid: false, wrongAddressType: 'wrongChain', value: 'generic' }
  }

  return {
    valid: false,
    wrongAddressType: 'unknown',
  }
}

function change() {
  emit('change', formatAddress({
    address: props.address,
    prefix: currentChain.value,
  }))
  showSuccess.value = true
}

watch(() => props.address, (address) => {
  if (address === '') {
    emit('check', true)
    addressCheck.value = undefined
    return
  }

  addressCheck.value = getAddressCheck(address)

  if (!addressCheck.value.valid) {
    showSuccess.value = false
  }

  emit('check', addressCheck.value.valid)
})
</script>

<template>
  <div>
    <UAlert
      v-if="showSuccess"
      :title="$t('addressChecker.changed.title', [chainName])"
      :description="$t('addressChecker.changed.message', [chainName])"
      color="success"
      variant="subtle"
      :ui="{
        title: 'text-primary md:text-lg font-bold capitalize',
        description: 'text-primary',
      }"
      close
      @update:open="showSuccess = false"
    />

    <UAlert
      v-if="addressCheck && !addressCheck.valid"
      :title="details.title"
      :description="details.description"
      color="error"
      variant="subtle"
      close
      :ui="{
        title: 'text-primary md:text-lg font-bold capitalize',
        description: 'text-primary',
      }"
      @update:open="addressCheck = undefined"
    >
      <template v-if="addressCheck.wrongAddressType === 'wrongChain'" #actions>
        <div class="flex gap-1">
          <UButton
            variant="outline"
            :label="$t('addressChecker.changeTo', { chainSymbol })"
            color="primary"
            size="sm"
            @click="change"
          />

          <UButton
            as="a"
            href="https://www.youtube.com/watch?v=3gPvGym8H7I"
            variant="link"
            :label="$t('general.learnMore')"
            color="info"
            size="sm"
          />
        </div>
      </template>
    </UAlert>
  </div>
</template>
