<script setup lang="ts">
import { formatDetailedTimeToNow } from '~/utils/format/time'

const { drop, amountToMint } = storeToRefs(useDropStore())

const { decimals, chainSymbol, currentChain } = useChain()
const { usd: usdPrice, formatted: formattedTokenPrice } = useAmount(computed(() => drop.value?.price), decimals, chainSymbol)

const dropStartRelativeTime = computed(() => {
  let targetDate: Date | null = null

  if (drop.value?.dropStartTime) {
    targetDate = new Date(drop.value.dropStartTime)
  }
  else if (drop.value?.start_at) {
    targetDate = new Date(drop.value.start_at)
  }

  if (!targetDate) {
    return null
  }

  // Don't show time if it's already in the past
  const now = new Date()
  if (targetDate.getTime() < now.getTime()) {
    return null
  }

  return formatDetailedTimeToNow(targetDate)
})
</script>

<template>
  <UContainer class="max-w-7xl px-4 md:px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 pt-15">
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
        <h1 class="text-3xl md:text-4xl lg:text-6xl font-medium font-serif italic text-center lg:text-left mb-6 lg:mb-0">
          {{ drop.collectionName ?? '---' }}
        </h1>

        <div class="flex flex-col items-start md:flex-row md:items-center gap-4 justify-between my-6 lg:my-8">
          <div v-if="drop.creator" class="flex flex-col gap-2">
            <p class="text-sm text-gray-500">
              Created By
            </p>
            <div class="flex justify-between items-center gap-1">
              <div class="p-1 bg-secondary inline-block rounded-full">
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

        <div v-if="drop.collection" class="flex w-full justify-end my-4">
          <UButton
            :to="`/${currentChain}/collection/${drop.collection}`"
            variant="outline"
          >
            View Collection
            <template #trailing>
              <UIcon name="i-heroicons-arrow-right" />
            </template>
          </UButton>
        </div>

        <!-- drop start at section -->
        <div v-if="dropStartRelativeTime" class="mt-6 p-4 bg-muted rounded-lg border border-border">
          <h3 class="text-lg font-semibold text-foreground mb-2">
            Drop Start Time
          </h3>
          <div class="flex items-center gap-2 text-muted-foreground">
            <UIcon name="i-heroicons-clock" class="w-4 h-4" />
            <time
              v-if="drop?.dropStartTime"
              :datetime="drop.dropStartTime.toISOString()"
              class="capitalize"
            >
              {{ dropStartRelativeTime }}
            </time>
            <time
              v-else-if="drop?.start_at"
              :datetime="drop.start_at"
              class="capitalize"
            >
              {{ dropStartRelativeTime }}
            </time>
          </div>
        </div>
      </div>

      <!-- right side -->
      <div class="order-1 lg:order-2">
        <!-- preview section -->
        <ClientOnly>
          <DropPreviewItem />
        </ClientOnly>

        <!-- stats section -->
        <div class="border p-6 rounded-2xl border-border mt-4">
          <div class="flex flex-col md:flex-row items-center justify-between gap-4">
            <div class="flex flex-col gap-1">
              <div v-if="drop.isFree" class="flex items-center gap-1">
                <div class="flex items-end gap-3">
                  <p class="font-serif font-medium text-2xl md:text-3xl italic">
                    Free
                  </p>
                  <DropMintedCounter :drop="drop" />
                </div>
              </div>
              <div v-else class="text-center md:text-left">
                <p class="font-serif font-medium text-2xl md:text-3xl italic">
                  {{ formattedTokenPrice }}
                </p>
                <div class="flex items-center gap-2 text-sm text-gray-500">
                  <span>{{ usdPrice }} USD</span>
                  <span class="font-medium text-muted-foreground">·</span>
                  <DropMintedCounter :drop="drop" />
                </div>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 md:gap-4 w-full md:w-auto">
              <UInputNumber
                v-if="!drop?.isMintedOut"
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
