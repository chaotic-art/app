<script setup lang="ts">
const { data: dropItems, pending } = await useFetch('/api/genart/list', {
  query: {
    limit: 200,
  },
})

const allArtists = computed(() => [...new Set(dropItems.value?.data.map(drop => drop.creator).filter(Boolean))] as string[])

const refreshKey = ref(0)
</script>

<template>
  <UContainer>
    <div class="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-8 px-4 md:px-0">
      <h1 class="text-2xl md:text-[50px] font-serif italic font-medium text-center md:text-left text-foreground">
        {{ $t('artist.curated') }} <span class="text-ring">&lt;</span>{{ $t('artist.all') }}<span class="text-ring">&gt;</span>
      </h1>

      <FollowAllButton :artists="allArtists" @success="refreshKey++" />
    </div>

    <div :key="refreshKey" class="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 px-4 md:px-0 pb-6">
      <template v-if="pending">
        <div
          v-for="i in 12"
          :key="i"
          class="flex flex-col h-[190px] gap-4 items-start md:gap-0 md:flex-row md:items-center justify-between bg-background rounded-xl px-4 py-3 md:px-6 md:py-4 border border-border hover-card-effect animate-pulse"
        >
          <div class="flex items-center">
            <USkeleton class="w-[72px] h-[72px] rounded-full" />
            <div class="flex flex-col gap-2 ml-4 max-w-full">
              <USkeleton class="h-8 w-48 mb-2" />
              <USkeleton class="h-4 w-64 mb-1" />
              <USkeleton class="h-4 w-64 mb-1" />
              <USkeleton class="h-4 w-40" />
            </div>
          </div>
          <USkeleton class="h-10 w-24 rounded-full" />
        </div>
      </template>
      <template v-else>
        <div
          v-for="artist in allArtists"
          :key="artist"
          class="flex flex-col gap-4 items-start md:gap-0 md:flex-row md:items-center justify-between bg-card rounded-xl px-4 py-3 md:px-6 md:py-4 border border-border hover-card-effect"
        >
          <UserInfo :address="artist" :avatar-size="72" :custom-name="true" :transparent-background="true">
            <template #name="{ addressName, description }">
              <div class="flex flex-col gap-2 ml-4 max-w-full">
                <span class="text-[32px] font-serif italic font-medium text-nowrap max-w-[220px] md:max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-foreground">
                  {{ addressName }}
                </span>
                <div class="text-ring break-all line-clamp-4 min-h-[100px]">
                  <MarkdownPreview :source="description || ''" />
                </div>
              </div>
            </template>
          </UserInfo>
          <FollowButton :target="artist" class="text-sm md:text-base" />
        </div>
      </template>
    </div>
  </UContainer>
</template>
