<script setup lang="ts">
const props = defineProps<{
  header: string
  src: string
  nftName: string
  collectionName: string
  collectionId: string
  mediaMimeType?: string
  price?: string | undefined
  showPrice?: boolean
}>()

const { decimals, chainSymbol, currentChain } = useChain()

const { usd, formatted } = useAmount(
  computed(() => props.price),
  decimals,
  chainSymbol,
)
</script>

<template>
  <div class="flex flex-col items-center">
    <img
      class="border rounded-xl border-gray-200 dark:border-gray-700 w-[200px] h-[200px]"
      :src="src"
    >

    <div class="mt-5 border-b-k-shade">
      <p class="text-base capitalize font-bold text-center">
        {{ header }}
      </p>
      <p
        v-if="showPrice"
        class="capitalize text-center mt-2"
      >
        {{ formatted }} ~ {{ usd }}
      </p>
      <p
        v-else
        class="capitalize text-xs text-center mt-2"
      >
        {{ $t('drop.artBy', [nftName]) }}
        <nuxt-link
          :to="`/${currentChain}/collection/${collectionId}`"
          class="has-text-link"
          target="_blank"
          rel="nofollow noopener noreferrer"
        >
          {{ collectionName }}
        </nuxt-link>
      </p>
    </div>
  </div>
</template>
