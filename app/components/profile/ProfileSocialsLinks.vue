<script setup lang="ts">
import type { Profile } from '@/services/profile'
import { Socials } from '@/services/profile'
import { removeHttpFromUrl } from '@/utils/format/url'

const props = defineProps<{
  profile: Profile
}>()

const socials = {
  [Socials.Farcaster]: {
    icon: 'i-simple-icons:farcaster',
    order: 1,
  },
  [Socials.Twitter]: {
    icon: 'i-simple-icons:x',
    order: 2,
  },
  [Socials.Website]: {
    icon: 'i-mdi:globe',
    order: 3,
  },
}
const socialItems = computed(() => {
  return props.profile.socials
    .map(({ handle, platform, link }) => {
      const socialConfig = socials[platform as Socials]
      const { icon, order } = socialConfig!
      return {
        label: removeHttpFromUrl(handle || link),
        icon,
        url: link,
        order,
      }
    })
    .sort((a, b) => a.order - b.order)
})
</script>

<template>
  <div v-if="socialItems?.length" class="flex items-center gap-2">
    <UTooltip v-for="social in socialItems" :key="social.label" :text="social.label">
      <UButton
        variant="ghost"
        size="sm"
        class="p-2"
        :href="social.url"
        target="_blank"
      >
        <UIcon
          :name="social.icon"
          class="w-5 h-5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        />
      </UButton>
    </UTooltip>
  </div>
</template>
