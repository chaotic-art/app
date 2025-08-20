<script lang="ts" setup>
import type {
  Follower,
} from '@/services/profile'
import { useElementHover } from '@vueuse/core'
import {
  fetchFollowersOf,
} from '@/services/profile'
import { shortenAddress } from '@/utils/format/address'

const props = defineProps<{
  user: Follower
}>()

const buttonRef = ref<HTMLElement>()
const isHovered = useElementHover(buttonRef)
const showFollowing = ref(false)

const { prefix } = usePrefix()

const prefixUserAddress = computed(() =>
  getss58AddressByPrefix(props.user.address, prefix.value),
)

const { data: followersCount, refresh: refreshCount } = useAsyncData(
  `followerCountOf/${props.user.address}`,
  () =>
    fetchFollowersOf(props.user.address, { limit: 0 }).then(
      res => res.totalCount,
    ),
)

watch(isHovered, (newHover, oldHover) => {
  const curserExited = newHover === false && oldHover === true
  if (curserExited) {
    showFollowing.value = false
  }
})
</script>

<template>
  <div class="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-neutral-700 bg-secondary hover:shadow-sm transition-shadow">
    <NuxtLink
      class="flex items-center flex-1 min-w-0 gap-4"
      :to="`/${prefix}/u/${prefixUserAddress}`"
    >
      <ProfileAvatar
        :address="user.address"
        :size="48"
      />
      <div class="flex flex-col gap-1 min-w-0 flex-1">
        <span
          class="text-gray-900 dark:text-white font-semibold truncate"
        >{{ user.name || shortenAddress(prefixUserAddress) }}</span>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ followersCount }}
          <span class="text-gray-400 dark:text-gray-500">{{
            followersCount === 1 ? 'Follower' : 'Followers'
          }}</span>
        </p>
      </div>
    </NuxtLink>

    <div ref="buttonRef" class="flex-shrink-0">
      <FollowButton
        :target="user.address"
        @follow-action="refreshCount"
      />
    </div>
  </div>
</template>
