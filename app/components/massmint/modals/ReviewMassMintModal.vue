<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  numNfts: number
  numMissingDescriptions: number
  numMissingPrices: number
}>()

const emit = defineEmits<{
  close: []
  mint: []
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    if (!value) {
      emit('close')
    }
  },
})

const mintButtonVariant = computed(() =>
  props.numMissingDescriptions ? 'outline' : 'solid',
)

const cancelButtonVariant = computed(() =>
  props.numMissingDescriptions ? 'solid' : 'outline',
)
</script>

<template>
  <UModal
    v-model="isOpen" title="Review Mass Mint"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <div class="space-y-4">
        <p class="text-base text-foreground">
          <span class="font-bold">{{ numNfts }} NFTs</span> will be minted to your collection
        </p>

        <div
          v-if="numMissingDescriptions || numMissingPrices"
          class="p-4 bg-destructive/10 border border-destructive/30 rounded-lg"
        >
          <p class="font-semibold text-destructive mb-2">
            Note:
          </p>
          <ul class="space-y-1 text-destructive/90">
            <li v-if="numMissingDescriptions" class="pl-3">
              • {{ numMissingDescriptions }} NFT{{ numMissingDescriptions > 1 ? 's' : '' }} missing description
            </li>
            <li v-if="numMissingPrices" class="pl-3">
              • {{ numMissingPrices }} NFT{{ numMissingPrices > 1 ? 's' : '' }} missing price
            </li>
          </ul>
        </div>

        <p class="text-sm text-muted-foreground">
          Are you sure you want to proceed with minting these NFTs? This action cannot be undone.
        </p>
      </div>
      <footer>
        <div class="flex gap-3 justify-end">
          <UButton
            :variant="cancelButtonVariant"
            color="neutral"
            size="lg"
            @click="emit('close')"
          >
            Cancel
          </UButton>
          <UButton
            :variant="mintButtonVariant"
            size="lg"
            @click="emit('mint')"
          >
            Yes, Mint NFTs
          </UButton>
        </div>
      </footer>
    </template>
  </UModal>
</template>
