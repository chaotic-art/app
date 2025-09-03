<script setup lang="ts">
import type { TargetAddress } from './Transfer.client.vue'

defineProps<{
  targetAddresses: TargetAddress[]
  displayTotalValue: string[]
}>()

defineEmits<{
  (e: 'confirm'): void
}>()

const { decimals, chainSymbol, chainName } = useChain()
const { accountId } = useAuth()
const isOpen = defineModel<boolean>({ required: true })
const showMore = ref(false)
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="`${$t('transfer.send')} ${chainSymbol}`"
    :ui="{ content: 'max-w-md w-full' }"
  >
    <template #body>
      <div>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="font-bold">{{ $t('transfer.network') }}</span>
            <span>{{ chainName }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="font-bold">{{ $t('transfer.from') }}</span>
            <UserInfo
              v-if="accountId"
              :address="accountId"
              :avatar-size="24"
              transparent-background
            />
          </div>

          <div class="flex items-center justify-between">
            <span class="font-bold">{{ $t('transfer.sendingTo') }}</span>
            <UserInfo
              v-if="targetAddresses.length === 1"
              :address="targetAddresses[0]?.address"
              :avatar-size="24"
              transparent-background
            />

            <UButton
              v-else
              :label="$t('transfer.recipients', { count: targetAddresses.length })"
              variant="subtle"
              :trailing-icon="showMore ? 'material-symbols:keyboard-arrow-up' : 'material-symbols:keyboard-arrow-down'"
              size="sm"
              @click="showMore = !showMore"
            />
          </div>

          <div v-if="showMore" class="space-y-3 max-h-80 overflow-y-scroll">
            <div
              v-for="({ address, token, usd }, index) in targetAddresses"
              :key="index"
              class="flex flex-col gap-2"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400">{{ $t('transfer.recipientCount', { count: index + 1 }) }}</span>
                <UserInfo
                  v-if="address"
                  :address="address"
                  :avatar-size="24"
                  transparent-background
                />
              </div>

              <div class="flex items-center justify-between">
                <span class="text-xs text-gray-400">{{ $t('transfer.amount') }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-gray-400">(<Money :value="amountToNative(token, decimals)" inline class="mt-auto" />)</span>
                  <span class="text-sm">${{ usd }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <USeparator class="my-3" />

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-bold">{{ $t('transfer.totalAmount') }}</span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-400">({{ displayTotalValue[0] }})</span>
              <span class="text-bold">{{ displayTotalValue[1] }}</span>
            </div>
          </div>

          <UButton
            class="w-full"
            color="neutral"
            :label="$t('transfer.send')"
            size="xl"
            @click="$emit('confirm')"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>
