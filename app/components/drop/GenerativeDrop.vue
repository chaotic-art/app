<script setup lang="ts">
const { drop, amountToMint } = storeToRefs(useDropStore())

const { decimals, chainSymbol, currentChain } = useChain()
const { usd: usdPrice, formatted: formattedTokenPrice } = useAmount(computed(() => drop.value?.price), decimals, chainSymbol)
</script>

<template>
  <UContainer class="max-w-7xl px-4 md:px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <!-- left side -->
      <div>
        <!-- badge section -->
        <div class="flex gap-2 mb-4 justify-center lg:justify-start">
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-heroicons-star">
            Featured
          </UBadge>
          <UBadge class="rounded-full bg-gray-100 text-black" icon="i-token-polkadot">
            Polkadot
          </UBadge>
        </div>
        <h1 class="text-3xl md:text-4xl lg:text-6xl font-bold font-serif italic text-center lg:text-left mb-6 lg:mb-0">
          {{ drop.collectionName ?? '---' }}
        </h1>

        <div class="flex flex-col items-start md:flex-row md:items-center gap-4 justify-between my-6 lg:my-10">
          <div v-if="drop.creator" class="flex flex-col gap-2">
            <p class="text-sm text-gray-500">
              Created By
            </p>
            <div class="flex justify-between items-center gap-1">
              <div class="p-1 bg-gray-100 inline-block rounded-full">
                <UserInfo :avatar-size="40" :address="drop?.creator" />
              </div>

              <FollowButton
                :target="drop.creator"
                class="px-4 py-2 w-full sm:w-auto ml-0"
              />
            </div>
          </div>

          <div v-if="Number(drop?.minted)" class="flex flex-col gap-2">
            <p class="text-sm text-gray-500">
              Collected By
            </p>

            <DropCollectedBy
              :chain="currentChain"
              :collection-id="drop?.collection ?? ''"
              :max-address-count="5"
              size="medium"
            />
          </div>
        </div>

        <!-- description section -->
        <div class="text-sm md:text-base">
          <MarkdownPreview :source="drop?.collectionDescription ?? '---'" />
        </div>
      </div>

      <!-- right side -->
      <div class="order-1 lg:order-2">
        <!-- preview section -->
        <ClientOnly>
          <DropPreviewItem />
        </ClientOnly>

        <!-- stats section -->
        <div class="border p-3 md:p-4 rounded-2xl border-gray-100 mt-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="text-center md:text-left">
              <p class="font-serif font-bold text-2xl md:text-3xl italic">
                {{ formattedTokenPrice }}
              </p>
              <p class="text-sm text-gray-500">
                {{ usdPrice }} USD
              </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <UInputNumber
                v-model="amountToMint"
                class="w-full sm:w-24" :min="1" :ui="{
                  base: 'rounded-full px-4 md:px-6 py-2 md:py-3',
                }"
              />
              <DropMintButton
                :drop="drop"
                is-drop-page
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <USeparator class="my-12 md:my-20" />

    <DropItemsGrid
      v-if="drop.collection"
      :key="drop.collection"
      :collection-id="drop.collection"
    />
  </UContainer>

  <DropMintModal />
</template>
