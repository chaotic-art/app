<script setup lang="ts">
import type { SwapSurcharge } from '@/composables/onchain/useNftPallets'
import { fetchOdaToken } from '~/services/oda'
import SurchargeTag from './SurchargeTag.vue'

interface ItemMedia { image: string, animationUrl: string }

const props = defineProps<{
  item: { id: string, name: string } | undefined
  surcharge: SwapSurcharge | undefined
}>()

const { $sdk } = useNuxtApp()
const image = ref()
const animationUrl = ref()

const { currentChain } = useChain()

const itemPath = computed(() => `/${currentChain.value}/gallery/${props.item?.id}`)

async function getItem(id: string): Promise<ItemMedia> {
  const [collectionId = '', tokenId = ''] = id.split('-')

  const nft = await fetchOdaToken(currentChain.value, collectionId, tokenId).catch(() => null)

  if (!nft?.metadata) {
    return {
      image: '',
      animationUrl: '',
    }
  }

  const { api } = $sdk(currentChain.value)

  const meta = await api.query.Nfts.ItemMetadataOf.getValue(Number(collectionId), Number(tokenId))
  const metadataUri = meta?.data.asText()

  if (!metadataUri) {
    return {
      image: '',
      animationUrl: '',
    }
  }

  const metadata = await fetchTokenMetadata(metadataUri)

  return {
    image: metadata?.image || '',
    animationUrl: metadata?.animation_url || '',
  }
}

watch(() => props.item?.id, async (id) => {
  if (id) {
    const item = await getItem(id)
    image.value = item.image
    animationUrl.value = item.animationUrl
  }
}, { immediate: true })
</script>

<template>
  <div
    v-if="item"
    class="flex items-center justify-between w-min gap-5"
  >
    <nuxt-link
      :to="itemPath"
      class="h-[50px]"
    >
      <div class="w-12 h-12 bg-gray-200 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg overflow-hidden flex-shrink-0">
        <img
          v-if="image"
          :src="sanitizeIpfsUrl(image)"
          :alt="item.name || 'NFT'"
          class="w-full h-full object-cover"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        >
        <div
          v-else
          class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-neutral-700"
        >
          <UIcon name="i-heroicons-photo" class="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </nuxt-link>

    <div class="flex flex-col justify-between">
      <nuxt-link
        class="is-ellipsis inline-block"
        :to="itemPath"
      >
        <span class="font-bold overflow-hidden">
          {{ item.name }}
        </span>
      </nuxt-link>

      <SurchargeTag :value="surcharge" />
    </div>
  </div>
</template>
