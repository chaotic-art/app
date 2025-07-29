<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    text: string
    url: string
    withCopy?: boolean
    showFarcaster?: boolean
    social?: SocialMediaProps
  }>(),
  {
    withCopy: true,
    showFarcaster: true,
    social: undefined,
  },
)

export interface SocialMediaProps {
  farcaster?: { embeds: string[] }
}

const toast = useToast()
const { shareOnX, shareOnTelegram, shareOnFarcaster } = useSocialShare()
const { copy } = useClipboard()

function handleShareOnX() {
  shareOnX(props.text, props.url, null)
}

function handleShareOnTelegram() {
  shareOnTelegram(props.text, props.url)
}
function handleShareOnFarcaster() {
  shareOnFarcaster(props.text, props.social?.farcaster?.embeds ?? [props.url])
}
</script>

<template>
  <div class="my-5">
    <div
      class="flex justify-around px-8 items-center w-full gap-6" :class="[
        { 'gap-4!': withCopy },
      ]"
    >
      <UTooltip text="X">
        <UButton
          variant="ghost"
          size="lg"
          @click="handleShareOnX"
        >
          <UIcon
            name="i-simple-icons:x"
            class="text-gray-500"
          />
        </UButton>
      </UTooltip>
      <UTooltip
        v-if="showFarcaster"
        text="Farcaster"
      >
        <UButton
          variant="ghost"
          size="lg"
          @click="handleShareOnFarcaster"
        >
          <UIcon
            name="simple-icons:farcaster"
            class="text-gray-500"
          />
        </UButton>
      </UTooltip>

      <UTooltip text="Telegram">
        <UButton
          variant="ghost"
          size="lg"
          @click="handleShareOnTelegram"
        >
          <UIcon
            class="text-gray-500"
            name="i-simple-icons:telegram"
          />
        </UButton>
      </UTooltip>
      <UTooltip
        v-if="withCopy"
        :text="$t('general.copy')"
      >
        <UButton
          variant="ghost"
          size="lg"
          @click="() => {
            copy(url)
            toast.add({ title: $t('general.copyToClipboard') })
          }"
        >
          <UIcon
            name="i-mdi:link"
            class="text-gray-500"
          />
        </UButton>
      </UTooltip>
    </div>
  </div>
</template>
