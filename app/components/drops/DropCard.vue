<script setup lang="ts">
import type { DropItem } from '@/types'
import { useMintedDropsStore } from '@/stores/dropsMinted'
import { getDropAttributes } from './utils'

const props = defineProps<{
  drop: DropItem
  showMinted?: boolean
}>()

const { prefix } = usePrefix()
const formattedDrop = ref<DropItem>()

const shouldShowDrop = computed(() =>
  props.showMinted || (formattedDrop.value && !formattedDrop.value.isMintedOut),
)

onBeforeMount(async () => {
  formattedDrop.value = await getDropAttributes(props.drop.alias)

  if (formattedDrop.value?.isMintedOut) {
    useMintedDropsStore().addMintedDrop(formattedDrop.value)
  }
})
</script>

<template>
  <NuxtLink v-if="shouldShowDrop" :to="`/${prefix}/drops/${drop.alias}`" class="border rounded-xl border-gray-300 overflow-hidden hover:shadow-lg transition-shadow">
    <img :src="sanitizeIpfsUrl(drop.image)" :alt="drop.name" class="aspect-square w-full object-cover">

    <div class="p-3 md:p-4">
      <p class="font-bold text-base md:text-lg mb-1 md:mb-2 line-clamp-2">
        {{ drop.name }}
      </p>

      <div class="text-sm text-gray-500 rounded-full p-0.5">
        <UserInfo :avatar-size="16" :address="drop.creator" :transparent-background="true" />
      </div>
    </div>
  </NuxtLink>
</template>
