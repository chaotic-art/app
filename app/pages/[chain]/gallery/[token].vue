<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { formatBalance } from '@polkadot/util'

const { token, chain } = useRoute().params
const [collectionId, tokenId] = token?.toString().split('-') ?? []

const { $api } = useNuxtApp()

const tokenDetail = reactive({
  owner: '',
  price: '',
  metadata: {
    name: '',
    description: '',
    image: '',
    animation_url: '',
  },
})

const formattedPrice = computed(() => {
  if (!tokenDetail.price)
    return ''

  const pricesString = formatBalance(tokenDetail.price, { decimals: 10, withSi: false })
  let float = Number.parseFloat(pricesString)
  float = float > 1 ? Number(float.toFixed(0)) : Number(float.toFixed(4))

  return `${float} DOT`
})

onMounted(async () => {
  const api = $api(chain as Prefix)

  const [queryItem, queryMetadata, queryPrice] = await Promise.all([
    api.query.Nfts.Item.getValue(Number(collectionId), Number(tokenId)),
    api.query.Nfts.ItemMetadataOf.getValue(Number(collectionId), Number(tokenId)),
    api.query.Nfts.ItemPriceOf.getValue(Number(collectionId), Number(tokenId)),
  ])

  tokenDetail.owner = queryItem?.owner.toString() ?? ''
  tokenDetail.price = queryPrice?.[0].toString() ?? ''

  if (queryMetadata?.data.asText()) {
    const metadata = await $fetch(sanitizeIpfsUrl(queryMetadata.data.asText())) as {
      name: string
      description: string
      image: string
      animation_url: string
    }

    tokenDetail.metadata.name = metadata.name
    tokenDetail.metadata.description = metadata.description
    tokenDetail.metadata.image = metadata.image
    tokenDetail.metadata.animation_url = metadata.animation_url
  }
})
</script>

<template>
  <UContainer class="max-w-7xl px-4 md:px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <!-- left side - image -->
      <div class="order-2 lg:order-1">
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100">
          <iframe
            v-if="tokenDetail.metadata.animation_url"
            :src="sanitizeIpfsUrl(tokenDetail.metadata.animation_url)"
            :alt="tokenDetail.metadata.name"
            class="aspect-square w-full object-cover rounded-xl"
          />
          <img
            v-else
            :src="sanitizeIpfsUrl(tokenDetail.metadata.image)"
            :alt="tokenDetail.metadata.name"
            class="aspect-square w-full object-cover rounded-xl"
          >
        </div>
      </div>

      <!-- right side - details -->
      <div class="order-1 lg:order-2">
        <!-- badge section -->
        <div class="flex gap-2 mb-4 justify-center lg:justify-start">
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-heroicons-star">
            NFT
          </UBadge>
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-token-polkadot">
            Polkadot
          </UBadge>
        </div>

        <!-- title -->
        <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center lg:text-left mb-6 lg:mb-8">
          {{ tokenDetail.metadata.name || '---' }}
        </h1>

        <!-- owner section -->
        <div class="flex justify-between items-center gap-4 my-6 lg:my-10">
          <div class="p-1 bg-gray-100 inline-block rounded-full">
            <UserInfo :avatar-size="40" :address="tokenDetail.owner" />
          </div>

          <FollowButton
            v-if="tokenDetail.owner"
            :target="tokenDetail.owner"
            class="px-4 py-2 w-full sm:w-auto"
          />
        </div>

        <!-- description section -->
        <div class="text-sm md:text-base mb-6 lg:mb-8">
          <p class="text-gray-600">
            {{ tokenDetail.metadata.description || '---' }}
          </p>
        </div>

        <!-- price and actions section -->
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <p class="font-serif font-bold text-2xl md:text-3xl italic">
                {{ formattedPrice || 'Not for sale' }}
              </p>
              <p v-if="formattedPrice" class="text-sm text-gray-500">
                Current Price
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <UButton
                v-if="formattedPrice"
                class="rounded-full px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto"
                color="primary"
              >
                Buy Now
              </UButton>
              <UButton
                class="rounded-full px-4 md:px-6 py-2 md:py-3 w-full sm:w-auto"
                variant="outline"
              >
                Make Offer
              </UButton>
            </div>
          </div>
        </div>

        <!-- token info -->
        <div class="mt-6 space-y-3">
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">Collection ID</span>
            <span class="font-medium">{{ collectionId }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">Token ID</span>
            <span class="font-medium">{{ tokenId }}</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-gray-500">Chain</span>
            <span class="font-medium capitalize">{{ chain }}</span>
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
