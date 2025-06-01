<script setup lang="ts">
import type { Prefix } from '@kodadot1/static'
import { getDropById } from '~/services/fxart'
import { fetchOdaCollection } from '~/services/oda'

const { slug, chain } = useRoute().params
const { $api } = useNuxtApp()
const chainPrefix = computed(() => chain?.toString() as Prefix)

const { data: drop } = await useAsyncData(`drop:${slug}`, () => getDropById(slug?.toString() ?? ''))

const collection = ref<Awaited<ReturnType<typeof fetchOdaCollection>> | null>(null)
const items = ref<number[]>([])

onMounted(async () => {
  collection.value = await fetchOdaCollection(chainPrefix.value, drop.value?.collection ?? '')

  if (drop.value?.collection) {
    const api = $api(chainPrefix.value)
    const apiResult = await api.query.Nfts.Item.getEntries(Number(drop.value.collection))
    items.value = apiResult.map(item => item.keyArgs[1]).sort((a, b) => b - a)
  }
})
</script>

<template>
  <UContainer class="max-w-7xl">
    <div class="grid grid-cols-2 gap-16">
      <!-- left side -->
      <div>
        <!-- badge section -->
        <div class="flex gap-2 mb-4">
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-heroicons-star">
            Featured
          </UBadge>
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-token-polkadot">
            Polkadot
          </UBadge>
        </div>
        <h1 class="text-6xl font-bold font-serif italic">
          {{ collection?.metadata.name ?? '---' }}
        </h1>

        <!-- creator section -->
        <div class="flex justify-between items-center my-10">
          <div class="p-1 bg-gray-100 inline-block rounded-full">
            <UserInfo :avatar-size="40" :address="drop?.creator" />
          </div>

          <FollowButton
            v-if="drop?.creator"
            :target="drop.creator" class="px-4 py-2"
          />
        </div>

        <!-- description section -->
        <MarkdownPreview :source="collection?.metadata.description ?? '---'" />
      </div>

      <!-- right side -->
      <div>
        <!-- preview section -->
        <div class="border p-4 rounded-2xl border-gray-100">
          <iframe class="aspect-square w-full" :src="sanitizeIpfsUrl(collection?.metadata.generative_uri)" frameborder="0" />
          <div class="flex gap-2 mt-4 justify-center">
            <UButton class="rounded-full bg-gray-100" variant="soft" trailing-icon="i-lucide-refresh-cw">
              Preview Variation
            </UButton>
            <UButton class="rounded-full bg-gray-100" variant="soft" trailing-icon="i-lucide-joystick">
              Controls
            </UButton>
          </div>
        </div>

        <!-- stats section -->
        <div class="border p-4 rounded-2xl border-gray-100 mt-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-serif font-bold text-3xl italic">
                0.5 DOT
              </p>
              <p class="text-sm text-gray-500">
                ~$20 USD
              </p>
            </div>

            <div class="flex gap-4">
              <UInputNumber
                class="w-24" :min="1" :ui="{
                  base: 'rounded-full px-6 py-3',
                }"
              />
              <UButton class="rounded-full px-6 py-3">
                Mint Drop
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>

    <USeparator class="my-20" />

    <div class="flex justify-between items-center">
      <p class="text-3xl font-bold font-serif italic">
        Latest NFT Mints
      </p>

      <div class="flex gap-4">
        <UButton class="rounded-full px-4 py-2" label="Newest" variant="outline" />
        <UButton class="rounded-full px-4 py-2" label="Buy Now" variant="outline" />
      </div>
    </div>

    <!-- items -->
    <div class="grid grid-cols-5 gap-6 mt-10">
      <LazyTokenCard v-for="id in items" :key="id" :token-id="id" :collection-id="Number(drop?.collection ?? 0)" :chain="chainPrefix" />
    </div>
  </UContainer>
</template>
