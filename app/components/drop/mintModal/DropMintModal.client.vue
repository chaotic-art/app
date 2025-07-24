<script setup lang="ts">
const emits = defineEmits(['confirm'])
const isModalOpen = defineModel<boolean>({ required: true })
const { formattedMinimumFunds, formattedMinimumFundsUSD } = useDropMinimumFunds()
const { toMintNFTs, drop, loading } = storeToRefs(useDropStore())

function onSubmit() {
  emits('confirm')
}
</script>

<template>
  <UModal
    v-model:open="isModalOpen"
    title="Mint Drop"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <div class="flex justify-between">
        <USkeleton v-if="loading" class="h-4 w-full rounded" />
        <template v-else>
          <span class="font-bold">{{ drop.name }}</span>

          <div>
            {{ toMintNFTs.length }} x
            <Money :value="toMintNFTs[0]?.price" inline />
          </div>
        </template>
      </div>

      <USeparator class="my-4" />

      <div class="flex justify-between">
        <USkeleton v-if="loading" class="h-4 w-full rounded" />
        <template v-else>
          <span>You Will Pay:</span>

          <div class="flex items-center gap-2">
            <div class="text-gray-500">
              {{ formattedMinimumFunds }}
            </div>
            <div>
              {{ formattedMinimumFundsUSD }}
            </div>
          </div>
        </template>
      </div>

      <UButton class="rounded-full px-4 md:px-6 py-2 md:py-3 w-full mt-10" @click="onSubmit">
        Proceed to Signing
      </UButton>
    </template>
  </UModal>
</template>
