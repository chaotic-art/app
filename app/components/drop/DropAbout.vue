<script setup lang="ts">
import type { SocialLink } from '~/services/profile'
import type { DropItem } from '~/types'
import { unlimited } from '~/utils/math'
import { getSocialPlatform, getSocialUrl } from '~/utils/social'

interface Props {
  drop?: DropItem
  formattedTokenPrice?: string
  socials?: SocialLink[]
  artistDescription?: string
  followersCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  drop: undefined,
  formattedTokenPrice: undefined,
})

// Technical details
const technicalDetails = computed(() => [
  {
    left: [
      { label: 'Blockchain', value: 'Polkadot' },
      { label: 'Token Standard', value: 'PSP-34' },
      { label: 'Total Supply', value: unlimited(props.drop?.max?.toString()) ? '∞' : (props.drop?.max?.toString() || '10,000') },

    ],
    right: [
      { label: 'Mint Price', value: props.formattedTokenPrice || '0.3 DOT' },
      {
        label: 'Launch Date',
        value: props.drop?.dropStartTime
          ? new Date(props.drop.dropStartTime).toLocaleDateString()
          : props.drop?.start_at
            ? new Date(props.drop.start_at).toLocaleDateString()
            : 'TBA',
      },
      { label: 'Minted', value: props.drop?.minted?.toString() || '0' },
    ],
  },
])
</script>

<template>
  <div class="space-y-8">
    <!-- About Header -->
    <div class="text-center">
      <h2 class="text-2xl md:text-3xl font-medium font-serif italic mb-4">
        About {{ drop?.collectionName }}
      </h2>
      <p class="text-muted-foreground max-w-2xl mx-auto">
        Learn more about this generative art collection, its concept, and the artist behind it.
      </p>
    </div>

    <!-- 2/3 Layout Container -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Main Content (2/3) -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Collection Description -->
        <div class="bg-card border border-border rounded-xl p-6">
          <h3 class="text-xl font-semibold text-card-foreground mb-4">
            Collection Description
          </h3>
          <div class="leading-relaxed">
            <MarkdownPreview
              :source="drop?.collectionDescription"
            />
          </div>
        </div>

        <!-- Technical Details -->
        <div class="bg-card border border-border rounded-xl p-6">
          <h3 class="text-xl font-semibold text-card-foreground mb-6">
            Technical Details
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div
                v-for="detail in technicalDetails[0]?.left"
                :key="detail.label"
                class="flex justify-between items-center py-2 border-b border-border"
              >
                <span class="text-muted-foreground">{{ detail.label }}</span>
                <span class="font-medium text-card-foreground">{{ detail.value }}</span>
              </div>
            </div>

            <div class="space-y-4">
              <div
                v-for="detail in technicalDetails[0]?.right"
                :key="detail.label"
                class="flex justify-between items-center py-2 border-b border-border"
              >
                <span class="text-muted-foreground">{{ detail.label }}</span>
                <span class="font-medium text-card-foreground">{{ detail.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Content (1/3) -->
      <div class="space-y-8">
        <!-- Artist Information -->
        <div class="bg-card border border-border rounded-xl p-6">
          <h3 class="text-xl font-semibold text-card-foreground mb-6">
            Artist
          </h3>

          <div class="space-y-4">
            <!-- Artist Avatar and Name -->
            <div class="flex items-center gap-4">
              <UserInfo
                :avatar-size="64"
                :address="drop?.creator"
                custom-name
                transparent-background
                class="flex items-center gap-4 flex-1"
              >
                <template #name="{ addressName }">
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <h4 class="text-lg font-semibold text-card-foreground">
                        {{ addressName }}
                      </h4>
                    </div>
                    <p class="text-sm text-muted-foreground">
                      {{ followersCount }} followers
                    </p>
                  </div>
                </template>
              </UserInfo>
            </div>

            <!-- Artist Description -->
            <p class="leading-relaxed">
              {{ artistDescription }}
            </p>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <FollowButton
                v-if="drop?.creator"
                :target="drop.creator"
                class="flex-1 *:w-full"
              >
                Follow
              </FollowButton>
              <UButton
                v-for="social in socials"
                :key="social.platform"
                :to="getSocialUrl(social.platform, social.handle || '')"
                target="_blank"
                variant="outline"
                :title="`Visit ${getSocialPlatform(social.platform).name}`"
                class="size-9"
                :icon="getSocialPlatform(social.platform).icon"
                :class="getSocialPlatform(social.platform).color"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
