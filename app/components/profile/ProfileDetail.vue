<script setup lang="ts">
import type { ButtonConfig } from '~/components/common/button/CommonButtonConfig.vue'
import { computed } from 'vue'
import ProfileAvatar from '@/components/common/ProfileAvatar.vue'
import ProfileShareDropdown from '@/components/profile/ProfileShareDropdown.vue'
import useFetchProfile from '@/composables/useFetchProfile'
import { fetchFollowersOf, fetchFollowing } from '@/services/profile'
import { copyAddress, getSubscanUrl, shortenAddress } from '@/utils/format/address'
import { sanitizeIpfsUrl } from '@/utils/ipfs'

const props = defineProps<{ address: string }>()
const { isCurrentAccount } = useAuth()
const { prefix } = usePrefix()
const { profile } = useFetchProfile(computed(() => props.address))
const bannerUrl = computed(() => sanitizeIpfsUrl(profile?.value?.banner || ''))
const followButton = ref()
const followModalTab = ref<'followers' | 'following'>('followers')
const isFollowModalActive = ref(false)
const isEditProfileModalActive = ref(false)

const { data: followers, refresh: refreshFollowers } = useAsyncData(
  `followersof${props.address}`,
  () =>
    fetchFollowersOf(props.address, {
      limit: 3,
    }),
)

const editProfileConfig: ButtonConfig = {
  label: 'Edit Existing Profile',
  icon: 'i-heroicons-pencil-square',
  onClick: () => isEditProfileModalActive.value = true,
  classes: 'rounded-full',
}

const createProfileConfig: ButtonConfig = {
  label: 'Create Profile',
  icon: 'i-heroicons-sparkles',
  onClick: () => isEditProfileModalActive.value = true,
  variant: 'solid',
  classes: 'rounded-full',
}

const profileButtonConfig = computed<ButtonConfig>(() =>
  profile.value ? editProfileConfig : createProfileConfig,
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

  <div class="w-full border-b border-gray-200 dark:border-gray-700">
    <div class="flex justify-between flex-col md:flex-row gap-12 px-4">
      <div class="flex flex-col flex-1">
        <div class="my-4 flex flex-col md:flex-row justify-between items-start gap-2 w-full">
          <div class="">
            <div class="text-2xl font-bold">
              <span v-if="profile?.name">
                {{ profile?.name }}
              </span>
              <span v-else>
                {{ shortenAddress(address) }}
              </span>
            </div>
            <div class="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              {{ shortenAddress(address) }}
              <UButton
                icon="i-lucide-copy"
                size="xs"
                color="neutral"
                variant="ghost"
                class="opacity-60 hover:opacity-100 transition-opacity"
                @click.prevent="copyAddress(address)"
              />

              <UButton
                :to="getSubscanUrl(address, prefix)"
                target="_blank"
                size="sm"
                variant="ghost"
                class="opacity-60 hover:opacity-100 transition-opacity"
              >
                Subscan
              </UButton>
            </div>
          </div>
          <ProfileSocialsLinks
            v-if="profile"
            :profile="profile"
          />
        </div>

        <div class="flex items-center gap-2">
          <CommonButtonConfig
            v-if="isCurrentAccount(address)"
            :button="profileButtonConfig"
          />
          <FollowButton v-else ref="followButton" :target="address" @follow-action="refresh" />

          <UButton
            icon="i-lucide-dollar-sign"
            variant="outline"
            size="lg"
            class="rounded-full"
          >
            Transfer
          </UButton>

          <ProfileShareDropdown />
        </div>
        <MarkdownPreview class="mt-6" :source="profile?.description || ''" />
      </div>

      <ProfileActivitySummery
        class="pt-4 w-auto md:w-40 "
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
    <ProfileEditModal
      v-model:open="isEditProfileModalActive"
      :address="address"
      @success="refresh()"
      @deleted="refresh()"
      @close="isEditProfileModalActive = false"
    />
  </div>
</template>
