<script setup lang="ts">
const { drop, amountToMint } = storeToRefs(useDropStore())

const { decimals, chainSymbol } = useChain()
const { usd: usdPrice, formatted: formattedTokenPrice } = useAmount(computed(() => drop.value?.price), decimals, chainSymbol)
</script>

<template>
  <UContainer class="px-4 md:px-6">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
      <!-- Left side - Preview -->
      <div class="order-2 lg:order-1">
        <div class="relative group">
          <!-- Live Drop Badge -->
          <div class="absolute top-4 left-4 z-10">
            <UBadge class="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium" icon="i-heroicons-bolt">
              Live Drop
            </UBadge>
          </div>

          <!-- Action Icons - shows on hover -->
          <div class="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <UButton
              icon="i-heroicons-heart"
              variant="ghost"
              class="bg-background/20 backdrop-blur-sm w-10 h-10"
            />
            <UButton
              icon="i-heroicons-share"
              variant="ghost"
              class="bg-background/20 backdrop-blur-sm w-10 h-10"
            />
            <UButton
              icon="i-heroicons-arrow-top-right-on-square"
              variant="ghost"
              class="bg-background/20 backdrop-blur-sm w-10 h-10"
            />
          </div>

          <!-- Preview Item -->
          <ClientOnly>
            <DropPreviewItem />
          </ClientOnly>
        </div>
      </div>

      <!-- Right side - Content -->
      <div class="order-1 lg:order-2">
        <!-- Badges -->
        <div class="flex gap-2 mb-6">
          <UBadge class="rounded-full bg-secondary text-secondary-foreground px-3 py-1">
            Polkadot
          </UBadge>
          <UBadge class="rounded-full bg-secondary text-secondary-foreground px-3 py-1">
            Generative Art
          </UBadge>
        </div>

        <!-- Title -->
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
          {{ drop?.collectionName || 'ENIGRAMS' }}
        </h1>

        <!-- Artist Info -->
        <div v-if="drop?.creator" class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
            <UserInfo :avatar-size="40" :address="drop?.creator" />
          </div>
          <div class="flex-1">
            <p class="font-medium text-foreground">
              AOWISEONE
            </p>
            <p class="text-sm text-muted-foreground">
              Artist • 2.1K followers
            </p>
          </div>
          <FollowButton :target="drop?.creator" class="px-4 py-2" />
        </div>

        <!-- Description -->
        <div class="text-muted-foreground mb-8">
          <MarkdownPreview
            :source="drop?.collectionDescription || 'ENIGRAMS is a generative art collection that uses coded language getting aid from abstract geometry, creating visual ciphers filled with mysterious glyphs. Each piece feels like a secret waiting to be uncovered, inviting collectors to step into the chaos and find the hidden meaning within.'"
          />
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-4 gap-6 mb-8">
          <div class="text-center">
            <div class="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <UIcon name="i-heroicons-squares-2x2" class="text-muted-foreground" />
            </div>
            <p class="text-2xl font-bold text-foreground">
              {{ drop?.max || '10,000' }}
            </p>
            <p class="text-sm text-muted-foreground">
              Total Supply
            </p>
          </div>
          <div class="text-center">
            <div class="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <UIcon name="i-heroicons-users" class="text-muted-foreground" />
            </div>
            <p class="text-2xl font-bold text-foreground">
              1,234
            </p>
            <p class="text-sm text-muted-foreground">
              Collectors
            </p>
          </div>
          <div class="text-center">
            <div class="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <UIcon name="i-heroicons-chart-bar" class="text-muted-foreground" />
            </div>
            <p class="text-2xl font-bold text-foreground">
              854 DOT
            </p>
            <p class="text-sm text-muted-foreground">
              Volume
            </p>
          </div>
          <div class="text-center">
            <div class="w-8 h-8 mx-auto mb-2 flex items-center justify-center">
              <UIcon name="i-heroicons-clock" class="text-muted-foreground" />
            </div>
            <p class="text-2xl font-bold text-foreground">
              28.47%
            </p>
            <p class="text-sm text-muted-foreground">
              Minted
            </p>
          </div>
        </div>

        <!-- Mint Section -->
        <div class="bg-card border border-border rounded-xl p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-card-foreground">
              Mint {{ drop?.collectionName || 'ENIGRAMS' }}
            </h3>
            <p class="text-sm text-muted-foreground">
              Max 5 per wallet
            </p>
          </div>

          <div class="mb-4">
            <p class="text-sm text-muted-foreground mb-1">
              Mint Price
            </p>
            <div class="flex items-baseline gap-2">
              <p class="text-2xl font-bold text-card-foreground">
                {{ formattedTokenPrice || '0.3 DOT' }}
              </p>
              <p class="text-muted-foreground">
                ${{ usdPrice || '38.40' }}
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-muted-foreground">
              Quantity
            </p>
            <div class="flex items-center gap-3">
              <UButton
                icon="i-heroicons-minus"
                variant="outline"
                size="sm"
                class="w-8 h-8"
                @click="amountToMint = Math.max(1, amountToMint - 1)"
              />
              <span class="text-lg font-medium w-8 text-center text-card-foreground">{{ amountToMint }}</span>
              <UButton
                icon="i-heroicons-plus"
                variant="outline"
                size="sm"
                class="w-8 h-8"
                @click="amountToMint = Math.min(5, amountToMint + 1)"
              />
            </div>
          </div>

          <div class="border-t border-border pt-4 mb-6">
            <div class="flex items-center justify-between">
              <p class="font-semibold text-card-foreground">
                Total
              </p>
              <div class="text-right">
                <p class="text-xl font-bold text-card-foreground">
                  {{
                    formattedTokenPrice
                      ? `${(parseFloat(formattedTokenPrice.split(' ')[0] || '0') * amountToMint).toFixed(1)} DOT`
                      : `${(0.3 * amountToMint).toFixed(1)} DOT`
                  }}
                </p>
                <p class="text-sm text-muted-foreground">
                  ${{
                    usdPrice
                      ? (parseFloat((usdPrice || '').replace('$', '') || '0') * amountToMint).toFixed(2)
                      : (38.40 * amountToMint).toFixed(2)
                  }}
                </p>
              </div>
            </div>
          </div>

          <DropMintButton
            :drop="drop"
            is-drop-page
            class="w-full"
          />
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
