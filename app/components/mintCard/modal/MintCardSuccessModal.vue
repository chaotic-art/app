<script setup lang="ts">
const props = defineProps<{
  isOnChain?: boolean
  previewUrl?: string
  name?: string
  id?: string
  prefix?: string
}>()

const emit = defineEmits(['share'])
const open = defineModel<boolean>('open')
const router = useRouter()

function handleViewInGallery() {
  if (props.id) {
    router.push(`/${props.prefix}/gallery/${props.id}`)
  }
  open.value = false
}

function handleShareOnX() {
  emit('share')
}
</script>

<template>
  <UModal
    v-model:open="open"
    :dismissible="false"
    :close="isOnChain"
    :ui="{
      content: 'max-w-2xs md:max-w-xl w-full bg-black',
    }"
  >
    <template #header>
      <div class="w-full flex justify-center gap-2 items-center relative">
        <UIcon
          name="i-mdi:stars"
          class="w-5 h-5"
        />
        <span class="text-xl italic font-serif">It's Yours.</span>
        <UButton
          v-if="props.isOnChain"
          variant="ghost"
          color="neutral"
          class="absolute right-0"
          icon="i-heroicons-x-mark"
          size="sm"
          @click="open = false"
        />
      </div>
    </template>
    <template #body>
      <!-- Header -->

      <!-- Main Content -->
      <div class="px-2 flex flex-col items-center">
        <!-- Success Message -->
        <p class="text-muted-foreground text-center text-sm md:text-base mb-4 w-full">
          Your Chaotic Card Has Been Minted And Delivered.
        </p>

        <IframePreview
          :src="previewUrl"
        />
        <div class="space-y-3 mt-4">
          <UButton
            v-if="isOnChain"
            class="w-full"
            variant="soft"
            @click="handleViewInGallery"
          >
            View In Gallery
          </UButton>
          <UTooltip
            v-else
            text="Finalizing on-chain ~ few minutes" :content="{
              side: 'top',
            }"
          >
            <UButton
              class="w-full"
              variant="soft"
            >
              <UIcon
                name="i-mdi:loading"
                class="animate-spin"
              />
              View In Gallery
            </UButton>
          </UTooltip>

          <UButton
            class="w-full"
            variant="solid"
            @click="handleShareOnX"
          >
            Share On X
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
