<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    withDots?: boolean
    solid?: boolean
  }>(),
  {
    withDots: false,
    solid: false,
  },
)

const DOTS_PLUS_MARGIN_WIDTH = 20// px

const titleRef = ref<HTMLElement>()
const subtitleRef = ref<HTMLElement>()
const textContainerWidth = ref()

const showDots = computed(() => props.withDots || !props.subtitle)

function calculateTextContainerWidth() {
  if (!showDots.value) {
    return
  }

  textContainerWidth.value = undefined

  nextTick(() => {
    const title = titleRef.value?.clientWidth || 0
    const subtitle = subtitleRef.value?.clientWidth || 0
    const subtitlePlusDots = subtitle + DOTS_PLUS_MARGIN_WIDTH

    if (subtitle && subtitlePlusDots > title) {
      textContainerWidth.value = `${subtitlePlusDots}px`
    }
  })
}

watch([() => props.title, () => props.subtitle], calculateTextContainerWidth, {
  immediate: true,
})
</script>

<template>
  <div class="w-full h-full relative">
    <div v-if="solid" class="w-full h-full rounded-[20px]" />
    <USkeleton
      v-else
      id="skeleton-backdrop"
      class="z-2 w-full h-full rounded-[20px]"
    />

    <div
      class="flex justify-center w-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-3"
    >
      <slot>
        <UIcon
          name="i-mdi:loading"
          class="spinner text-gray-500 mr-6 animate-spin"
          size="large"
        />

        <div :style="{ width: textContainerWidth }">
          <p
            ref="titleRef"
            class="capitalize font-bold text-base"
          >
            {{ title || $t('general.doingSomeMagic') }}
          </p>
          <p class="capitalize text-base text-gray-500">
            <span
              ref="subtitleRef"
              class="inline-block"
            >{{
              subtitle || $t('general.pleaseWait')
            }}</span>
            <span
              v-if="showDots"
              class="dots ml-1"
            />
          </p>
        </div>
      </slot>
    </div>
    <slot name="footer" />
  </div>
</template>
