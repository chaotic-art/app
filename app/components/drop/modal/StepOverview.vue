<script setup lang="ts">
import type { ToMassmintNFT } from '@/composables/drop/massmint/types'

const props = defineProps<{
  loading: boolean
  toMintNfts: ToMassmintNFT[]
  minimumFunds: number
  mintButton: { label: string, disabled: boolean, loading?: boolean, alert?: string }
}>()

defineEmits(['confirm'])

const { chainSymbol, decimals } = useChain()

const { usd: priceUSD } = useAmount(
  computed(() => props.minimumFunds),
  decimals,
  chainSymbol,
)
</script>

<template>
  <div>
    <div class="flex justify-between">
      <USkeleton v-if="loading" class="h-4 w-full rounded" />
      <template v-else>
        <span class="font-bold">{{ toMintNfts[0]?.collectionName }}</span>

        <div>
          {{ toMintNfts.length }} x
          <Money :value="toMintNfts[0]?.price" inline />
        </div>
      </template>
    </div>

    <USeparator class="my-4" />

    <div class="flex justify-between">
      <USkeleton v-if="loading" class="h-4 w-full rounded" />
      <template v-else>
        <span>You Will Pay:</span>

        <div class="flex items-center gap-2">
          <Money
            class="text-gray-500"
            :value="minimumFunds"
            :inline="false"
          />
          <div>
            {{ priceUSD }}
          </div>
        </div>
      </template>
    </div>

    <div class="mt-8">
      <ParaportButton
        :loading="loading"
        :amount="minimumFunds"
        :disabled="mintButton.disabled"
        :label="mintButton.label"
        @confirm="$emit('confirm')"
      />
    </div>
  </div>
</template>
