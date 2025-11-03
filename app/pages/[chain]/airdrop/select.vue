<script setup lang="ts">
import ProfileNftsList from '@/components/profile/tabs/ProfileNftsList.vue'

const { accountId } = useAuth()
const { currentChain } = useChain()
const address = computed(() => getss58AddressByPrefix(accountId.value, currentChain.value))
</script>

<template>
  <UContainer>
    <div class="space-y-6 my-6">
      <div class="space-y-3">
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-medium font-serif italic text-foreground">
          Airdrop
        </h1>

        <div class="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
          <p>
            The airdrop feature lets you send NFTs to multiple addresses. Please note that the NFTs must already be minted on-chain. If they are not minted yet, please mint them first.
          </p>
          <p class="mt-4">
            Select the NFTs you want to airdrop and continue to the next step for airdrop configuration.
          </p>
        </div>
      </div>
    </div>
    <USeparator class="my-4" />
    <ProfileNftsList :extra-variables="{ owner: address }" />
    <LazyActionCart :enable-actions="{ airdrop: true }" />
  </UContainer>
</template>
