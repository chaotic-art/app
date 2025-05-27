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
          Neurotica
        </h1>

        <!-- creator section -->
        <div class="flex justify-between items-center my-10">
          <div class="p-1 bg-gray-100 inline-block rounded-full">
            <UserInfo :avatar-size="40" address="16dBfC3PW1KsDwXTEQzN66EPccPRMEwPJPoAvTyCYx3ubZkL" />
          </div>

          <UButton
            class="px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-100"
          >
            + Follow
          </UButton>
        </div>

        <!-- description section -->
        <div>
          <p class="mb-2">
            some subheading text about the drop, something interesting, maybe about the process of making the drop,
          </p>
          <p>some subheading text about the drop, something interesting, maybe about the process of making the drop,</p>
        </div>
      </div>

      <!-- right side -->
      <div>
        <!-- preview section -->
        <div class="border p-4 rounded-2xl border-gray-100">
          <iframe class="aspect-square w-full" src="https://image.w.kodadot.xyz/ipfs/bafybeibxtwbumkxx45ldbfwsjtwrqd32c52lrmnlmjtwvy55ljuokc5zwm/?hash=0x6ad4114aab0fcbb53b532bb0e48d73291d435ee6a43a7ea5689ec7570108360b" frameborder="0" />
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
      <div v-for="i in 10" :key="i" class="border rounded-xl border-gray-300 overflow-hidden">
        <img src="https://image.w.kodadot.xyz/type/endpoint/https://dyndata.koda.art/v1/image/ahp/461/260002839" alt="NFT" class="aspect-square">

        <div class="p-4">
          <p class="font-bold mb-2">
            Neurotica #99
          </p>

          <div class="flex items-center justify-between">
            <p>20 DOT</p>
            <UBadge label="1 minute" variant="soft" class="bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </UContainer>
</template>
