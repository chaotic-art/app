<script setup lang="ts">
import { computed } from 'vue'
import ProfileAvatar from '@/components/common/ProfileAvatar.vue'
import useFetchProfile from '@/composables/useFetchProfile'
import { fetchFollowersOf, fetchFollowing } from '@/services/profile'
import { shortenAddress } from '@/utils/format/address'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

const props = defineProps<{ address: string }>()

const { profile } = useFetchProfile(computed(() => props.address))
const bannerUrl = computed(() => sanitizeIpfsUrl(profile?.value?.banner || ''))
const followButton = ref()
const followModalTab = ref<'followers' | 'following'>('followers')
const isFollowModalActive = ref(false)

const { data: followers, refresh: refreshFollowers } = useAsyncData(
  `followersof${props.address}`,
  () =>
    fetchFollowersOf(props.address, {
      limit: 3,
    }),
)

function onFollowersClick() {
  followModalTab.value = 'followers'
  isFollowModalActive.value = true
}

function onFollowingClick() {
  followModalTab.value = 'following'
  isFollowModalActive.value = true
}

const { data: following, refresh: refreshFollowing } = useAsyncData(
  `following${props.address}`,
  () => fetchFollowing(props.address, { limit: 1 }),
)

function refresh({ fetchFollowing = true } = {}) {
  refreshFollowers()
  refreshFollowing()
  fetchFollowing && followButton.value?.refresh()
}
const followersCount = computed(() => followers.value?.totalCount ?? 0)
const followingCount = computed(() => following.value?.totalCount ?? 0)
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

  <div class="w-full ">
    <div class="flex justify-between gap-2 px-4">
      <div>
        <div class="my-4 text-2xl font-bold">
          <span v-if="profile?.name">
            {{ profile?.name }}
          </span>
          <span v-else>
            {{ shortenAddress(address) }}
            <div class="flex items-center gap-2">
              <div class="my-4 text-2xl font-bold">
                <span v-if="profile?.name">
                  {{ profile?.name }}
                </span>
                <span v-else>
                  {{ shortenAddress(address) }}
                </span>
              </div>
            </div>

          </span>
        </div>
        <FollowButton ref="followButton" :target="address" @follow-action="refresh" />
        <MarkdownPreview class="mt-6" :source="profile?.description || ''" />
      </div>

      <ProfileActivitySummery
        class="pt-4 max-md:hidden w-50"

        :followers-count="followersCount"
        :following-count="followingCount"
        @click-followers="onFollowersClick"
        @click-following="onFollowingClick"
      />
    </div>
    <LazyProfileFollowModal
      :key="`${followersCount}-${followingCount}`"
      v-model="isFollowModalActive"
      :initial-tab="followModalTab"
      :followers-count="followersCount"
      :following-count="followingCount"
      @close="isFollowModalActive = false;refresh()"
    />
  </div>
</template>
