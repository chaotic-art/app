<script setup lang="ts">
import { computed } from 'vue'
import ProfileAvatar from '@/components/common/ProfileAvatar.vue'
import useFetchProfile from '@/composables/useFetchProfile'
import { shortenAddress } from '@/utils/format/address'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

const props = defineProps<{ address: string }>()

const { profile } = useFetchProfile(computed(() => props.address))

const bannerUrl = computed(() => sanitizeIpfsUrl(profile?.value?.banner || ''))
</script>

<template>
  <div class="relative w-full min-h-[340px] flex flex-col justify-end rounded-xl overflow-hidden">
    <div
      class="absolute inset-0 w-full h-full bg-gray-200 dark:bg-neutral-800"
      :style="bannerUrl ? { backgroundImage: `url('${bannerUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
    />

    <div class="relative flex items-center px-8 py-8 z-10">
      <div class="flex flex-col items-center">
        <ProfileAvatar :address="props.address" :profile-image="profile?.image" :size="140" />
      </div>
    </div>
  </div>

  <div class="w-full px-4">
    <div class="my-4 text-2xl font-bold">
      <span v-if="profile?.name">
        {{ profile?.name }}
      </span>
      <span v-else>
        {{ shortenAddress(address) }}
      </span>
    </div>
    <MarkdownPreview :source="profile?.description || ''" />
  </div>
</template>
