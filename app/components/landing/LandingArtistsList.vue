<script setup lang="ts">
// TODO: need to be updated or fetch artists from backend
const { data: dropItems } = useFetch('/api/genart/list', {
  query: {
    limit: 50,
  },
})

const allArtists = computed(() => [...new Set(dropItems.value?.data.map(drop => drop.creator).filter(Boolean))])
const randomSixArtist = computed(() => allArtists.value?.slice().sort(() => Math.random() - 0.5).slice(0, 6))

const { currentChain } = useChain()
</script>

<template>
  <section class="py-16 bg-muted">
    <UContainer>
      <div class="text-2xl md:text-[50px] font-serif italic font-medium mb-4 md:mb-8 px-4 text-center md:text-left text-foreground">
        {{ $t('artist.curated') }} <span class="text-ring">&lt;</span>{{ $t('artist.all') }}<span class="text-ring">&gt;</span>
      </div>
      <ClientOnly>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0">
          <NuxtLink
            v-for="artist in randomSixArtist"
            :key="artist"
            :to="`/${currentChain}/u/${artist}`"
            class="flex items-center justify-between rounded-xl px-4 py-3 md:px-6 md:py-4 border border-border hover-card-effect bg-card"
          >
            <UserInfo :address="artist" :avatar-size="56" :custom-name="true" :transparent-background="true" class="md:hidden">
              <template #name="{ addressName }">
                <span class="text-lg font-serif italic font-medium ml-3 text-foreground">
                  {{ addressName }}
                </span>
              </template>
            </UserInfo>
            <UserInfo :address="artist" :avatar-size="72" :custom-name="true" :transparent-background="true" class="hidden md:flex">
              <template #name="{ addressName }">
                <span class="text-[32px] font-serif italic font-medium ml-4 text-foreground">
                  {{ addressName }}
                </span>
              </template>
            </UserInfo>
            <FollowButton :target="artist!" class="text-sm md:text-base hidden md:block" @click.prevent />
          </NuxtLink>
        </div>
      </ClientOnly>
      <div class="flex justify-center mt-6 md:mt-8">
        <UButton variant="outline" class="rounded-full" to="/ahp/artists">
          {{ $t('collection.viewMore') }}
        </UButton>
      </div>
    </UContainer>
  </section>
</template>
