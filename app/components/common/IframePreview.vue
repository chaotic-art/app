<script lang="ts" setup>
import { useElementSize, useWindowSize } from '@vueuse/core'

const props = withDefaults(
  defineProps<{
    src?: string
    animationSrc?: string
    alt?: string
    title?: string
    iframeId?: string
    sandbox?: string
    allow?: string
    baseSize?: number
  }>(),
  {
    title: 'html-embed',
    sandbox: 'allow-scripts allow-same-origin allow-modals',
    allow:
      'accelerometer *; camera *; gyroscope *; microphone *; xr-spatial-tracking *;',
    baseSize: 1080,
  },
)

const emit = defineEmits(['load', 'error'])

const wrapper = ref<HTMLDivElement>()
const iframe = ref<HTMLIFrameElement>()
const { width, height } = useElementSize(wrapper)
const { height: windowHeight, width: windowWidth } = useWindowSize()

const iframeSrc = ref('')
const computedSrc = computed(() => props.animationSrc || props.src || '')

const baseSizeStyle = computed(() => ({ width: `${props.baseSize}px`, height: `${props.baseSize}px` }))

function getScale({
  width,
  height,
}: {
  width: number
  height: number
}): number {
  return Math.min(width / props.baseSize, height / props.baseSize)
}

onMounted(() => {
  iframeSrc.value = computedSrc.value
})

watch(computedSrc, (src) => {
  if (iframe.value?.src !== src) {
    iframe.value?.contentWindow?.location.replace(src)
  }
})

watchEffect(() => {
  if (width.value && height.value) {
    if (!iframe.value) {
      return
    }

    const isFullscreenMode = Boolean(document.fullscreenElement)

    const scale = isFullscreenMode
      ? getScale({ width: windowWidth.value, height: windowHeight.value })
      : getScale({ width: width.value, height: height.value })
    const xSpace = windowWidth.value - props.baseSize * scale
    const ySpace = windowHeight.value - props.baseSize * scale

    iframe.value.style.transform = `scale(${scale})`
    iframe.value.style.left
      = isFullscreenMode && xSpace > 0 ? `${Math.ceil(xSpace / 2)}px` : ''
    iframe.value.style.top
      = isFullscreenMode && ySpace > 0 ? `${Math.ceil(ySpace / 2)}px` : ''
  }
})
</script>

<template>
  <div
    ref="wrapper"
    class="relative w-full h-full aspect-square"
  >
    <iframe
      :id="iframeId"
      ref="iframe"
      :title="title"
      class="absolute flex aspect-square origin-top-left"
      :style="baseSizeStyle"
      :src="iframeSrc"
      :alt="alt"
      :sandbox="sandbox"
      :allow="allow"
      frameborder="0"
      @load="emit('load')"
      @error="emit('error')"
    />
  </div>
</template>
