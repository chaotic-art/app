<script setup lang="ts">
import type { DropItem } from '@/types'
import { useMintedDropsStore } from '@/stores/dropsMinted'
import { getDropAttributes, isTBA } from './utils'

const props = defineProps<{
  drop: DropItem
  showMinted?: boolean
}>()

const { prefix } = usePrefix()
const formattedDrop = ref<DropItem>()
const { decimals, chainSymbol } = useChain()

const shouldShowDrop = computed(() =>
  props.showMinted || (formattedDrop.value && !formattedDrop.value.isMintedOut),
)
const isUnlimited = computed(() => formattedDrop.value?.max && formattedDrop.value.max >= Number.MAX_SAFE_INTEGER)
const { usd: usdPrice } = useAmount(computed(() => formattedDrop.value?.price), decimals, chainSymbol)

onBeforeMount(async () => {
  formattedDrop.value = await getDropAttributes(props.drop.alias)

  if (formattedDrop.value?.isMintedOut) {
    useMintedDropsStore().addMintedDrop(formattedDrop.value)
  }
})
</script>

<template>
  <NuxtLink v-if="shouldShowDrop" :to="`/${prefix}/drops/${drop.alias}`" class="border rounded-xl border-gray-300 overflow-hidden hover:shadow-lg transition-shadow hover-card-effect">
    <img :src="sanitizeIpfsUrl(drop.image)" :alt="drop.name" class="aspect-square w-full object-cover">

    <div class="p-3 md:p-4">
      <p class="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-2">
        {{ drop.name }}
      </p>

      <div class="text-sm text-gray-500 rounded-full p-0.5">
        <UserInfo :avatar-size="16" :address="drop.creator" :transparent-background="true" />
      </div>

      <div class="flex items-center justify-between mt-2">
        <div class="text-xs text-gray-500 rounded-full p-0.5 flex items-end">
          <span class="text-[var(--text-color)] text-sm">{{ formattedDrop?.minted }}</span>
          /
          <UIcon v-if="isUnlimited" name="mdi:infinity" class="self-center" />
          <span v-else>{{ formattedDrop?.max }}</span>

          <div class="ml-2 text-xs">
            <div v-if="isTBA(formattedDrop?.price)">
              TBA
            </div>
            <div v-else-if="Number(formattedDrop?.price)" class="flex items-end gap-1">
              <span class="text-sm text-[var(--text-color)]">{{ usdPrice }}
              </span>
              <span class="text-xs">USD</span>
            </div>
            <div v-else class="text-[var(--text-color)]">
              Free
            </div>
          </div>
        </div>

        <DropCollectedBy :chain="prefix" :collection-id="drop.collection" :max-address-count="3" size="small" no-background />
      </div>
    </div>
  </NuxtLink>
</template>
