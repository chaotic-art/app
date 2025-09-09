<script setup lang="ts">
import type { ButtonConfig } from '@/components/common/button/FollowButton.client.vue'
import type { Profile } from '@/services/profile'
import { computed } from 'vue'
import ProfileAvatar from '@/components/common/ProfileAvatar.vue'
import ProfileShareDropdown from '@/components/profile/ProfileShareDropdown.vue'
import { fetchFollowersOf, fetchFollowing } from '@/services/profile'
import { copyAddress, getSubscanAccountUrl, shortenAddress } from '@/utils/format/address'

const props = defineProps<{ address: string, profile?: Profile | null, bannerUrl?: string }>()
const { isCurrentAccount } = useAuth()
const followButton = ref()
const followModalTab = ref<'followers' | 'following'>('followers')
const isFollowModalActive = ref(false)
const isEditProfileModalActive = ref(false)

const tabsItems = ref([
  {
    label: 'Owned',
    name: 'Owned',
    slot: 'owned',
  },
  {
    label: 'Created',
    name: 'Created',
    slot: 'created',
  },
  {
    label: 'Collections',
    name: 'Collections',
    slot: 'collections',
  },
])

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
}

const createProfileConfig: ButtonConfig = {
  label: 'Create Profile',
  icon: 'i-heroicons-sparkles',
  onClick: () => isEditProfileModalActive.value = true,
}

const profileButtonConfig = computed<ButtonConfig>(() =>
  props.profile ? editProfileConfig : createProfileConfig,
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

function onTotalCountChange(slot: string, totalCount: number) {
  const tab = tabsItems.value.find(tab => tab.slot === slot)
  if (tab) {
    tab.label = totalCount > 0 ? `${tab.name} (${totalCount})` : tab.name
  }
}
</script>

<template>
  <div>
    <div class="relative w-full min-h-[340px] flex flex-col justify-end rounded-xl overflow-hidden">
      <div
        class="absolute inset-0 w-full h-full bg-muted"
        :style="bannerUrl ? { backgroundImage: `url('${bannerUrl}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}"
      />

      <div class="relative flex items-center px-8 py-8 z-10">
        <div class="flex flex-col items-center">
          <ClientOnly>
            <ProfileAvatar :address="props.address" :profile-image="profile?.image" :size="140" />
          </ClientOnly>
        </div>
      </div>
    </div>

    <div class="w-full border-b border-border">
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
              <div class="flex items-center gap-1 text-sm text-muted-foreground">
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
                  :to="getSubscanAccountUrl(address, 'ahp')"
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
            <UButton
              v-if="isCurrentAccount(address)"
              :label="profileButtonConfig.label"
              :icon="profileButtonConfig.icon"
              @click="profileButtonConfig.onClick"
            />
            <FollowButton v-else ref="followButton" :target="address" @follow-action="refresh" />

            <!-- <UButton
              icon="i-lucide-dollar-sign"
              variant="outline"
            >
              Transfer
            </UButton> -->

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

      <ProfileCuratedDrops :id="address" />

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

    <UTabs color="neutral" :items="tabsItems" class="w-full my-4">
      <template #owned>
        <ProfileNftsList :extra-variables="{ owner: address }" @total-count-change="onTotalCountChange('owned', $event)" />
      </template>
      <template #created>
        <ProfileNftsList :extra-variables="{ issuer: address }" @total-count-change="onTotalCountChange('created', $event)" />
      </template>
      <template #collections>
        <ProfileCollectionsList :issuer="address" @total-count-change="onTotalCountChange('collections', $event)" />
      </template>
    </UTabs>
  </div>
</template>
