<script setup lang="ts">
import type { AssetMessage, Passed } from './types'
import { useFullscreen } from '@vueuse/core'
import config from './codechecker.config'
import { downloadBase64Image } from './massPreview/utils'
import { generateRandomHash } from './utils'

const props = defineProps<{
  selectedFile: File | null
  assets: Array<AssetMessage>
  fileName?: string
  render: boolean
  kodaRendererUsed: Passed
  reloadTrigger: number
  indexUrl: string
}>()

const emit = defineEmits(['reload', 'hash', 'fpsCheck', 'fpsValue'])

const fullscreenRef = ref<HTMLElement>()

const { toggle: toggleFullscreen, isFullscreen } = useFullscreen(fullscreenRef)

const variationOptions = config.variationOptions.map(option => ({
  label: `${option}X`,
  value: option,
}))

const hash = ref('')
const count = ref(0)
const variationCounter = ref(0)
const selectedVariation = ref(5)

const codeShareLink = computed<string | null>(() =>
  props.indexUrl ? `${props.indexUrl}?hash=${hash.value}` : null,
)

function openInNewTab() {
  if (codeShareLink.value) {
    window.open(codeShareLink.value, '_blank')
  }
}

function newHash() {
  hash.value = generateRandomHash()
  emit('reload')
}

function replay() {
  count.value++
  emit('reload')
}

// FPS monitoring - continuous real-time tracking
const currentFps = ref(0)
const fpsHistory = ref<number[]>([])
let fpsCheckTimeout: NodeJS.Timeout | null = null
let fpsMonitoringActive = false
let animationFrameId: number | null = null
let lastFrameTime = 0
const MAX_FPS_HISTORY = 60 // Keep last 60 frames for smoothing

function startFpsMonitoring() {
  // Clear any existing monitoring
  stopFpsMonitoring()

  // Start monitoring after 1 second (wait for art to render)
  fpsCheckTimeout = setTimeout(() => {
    fpsMonitoringActive = true
    lastFrameTime = performance.now()
    fpsHistory.value = []

    function measureFrame() {
      if (!fpsMonitoringActive)
        return

      const currentTime = performance.now()
      const deltaTime = currentTime - lastFrameTime

      if (deltaTime > 0 && lastFrameTime > 0) {
        const instantFps = 1000 / deltaTime

        // Add to history for smoothing
        fpsHistory.value.push(instantFps)
        if (fpsHistory.value.length > MAX_FPS_HISTORY) {
          fpsHistory.value.shift()
        }

        // Calculate smoothed FPS (average of recent frames)
        const avgFps = fpsHistory.value.reduce((a, b) => a + b, 0) / fpsHistory.value.length
        const roundedFps = Math.round(avgFps)

        // Update current FPS
        currentFps.value = roundedFps
        emit('fpsValue', roundedFps)

        // After collecting enough samples, emit validation result
        if (fpsHistory.value.length >= 30) {
          const fpsValid = avgFps >= 60
          emit('fpsCheck', fpsValid)
        }
      }

      lastFrameTime = currentTime
      animationFrameId = requestAnimationFrame(measureFrame)
    }

    animationFrameId = requestAnimationFrame(measureFrame)
  }, 1000)
}

function stopFpsMonitoring() {
  fpsMonitoringActive = false
  currentFps.value = 0
  fpsHistory.value = []

  if (fpsCheckTimeout) {
    clearTimeout(fpsCheckTimeout)
    fpsCheckTimeout = null
  }

  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
}

watch(() => props.render, (isRendering) => {
  if (isRendering && props.selectedFile) {
    // Start FPS monitoring when render starts
    startFpsMonitoring()
  }
  else {
    stopFpsMonitoring()
  }
})

onMounted(newHash)

onUnmounted(() => {
  stopFpsMonitoring()
})

function handleRenderComplete(ev: MessageEvent<{ type: string, payload: { image?: string } }>) {
  if (
    ev.origin === window.location.origin
    && ev.data?.type === 'kodahash/render/completed'
    && ev.data.payload?.image
  ) {
    const imageName = `${props.fileName}-variation_${variationCounter.value + 1}-hash_${hash.value}.png`

    downloadBase64Image(ev.data.payload.image, imageName)

    variationCounter.value++
    if (selectedVariation.value && variationCounter.value < selectedVariation.value) {
      newHash()
    }
    else {
      variationCounter.value = 0
      window.removeEventListener('message', handleRenderComplete)
    }
  }
}

async function exportAsPNG() {
  window.addEventListener('message', handleRenderComplete)
  emit('reload')
  count.value++
}

function emitHashUpdate() {
  emit('hash', hash.value)
}

watch(() => props.reloadTrigger, replay)
watch(hash, emitHashUpdate)
</script>

<template>
  <div
    class="border bg-card shadow-lg p-5 pb-6 w-full max-w-[490px] flex flex-col gap-5"
  >
    <div ref="fullscreenRef" class="relative">
      <UButton
        v-if="isFullscreen"
        class="fixed top-12 left-12 z-10"
        icon-left="i-heroicons-arrow-left"
        @click="toggleFullscreen"
      >
        <div class="mr-2">
          {{ $t('codeChecker.goBack') }}
        </div>
      </UButton>

      <!-- Real-time FPS counter -->
      <div
        v-if="render && currentFps > 0"
        class="absolute top-0 right-full w-24 text-center z-10 px-3 py-1.5 shadow-lg"
        :class="currentFps >= 60 ? 'bg-green-500/90' : 'bg-red-500/90'"
      >
        <span class="text-white font-mono font-semibold text-sm">
          {{ currentFps }} FPS
        </span>
      </div>

      <SandboxIFrame
        v-if="render"
        v-model:count="count"
        :custom-class="{ border: !isFullscreen }"
        :hash="hash"
        :assets="assets"
      />
      <div
        v-else
        class="border border-border rounded-lg h-96 flex items-center justify-center bg-muted"
      >
        <UIcon name="i-heroicons-photo" class="text-4xl text-muted-foreground" />
      </div>
    </div>

    <div class="pb-5 flex w-full gap-3 border-b border-border flex-wrap">
      <UButton
        rounded
        class="px-5 flex-1 border-border"
        icon-right="i-heroicons-arrow-path"
        @click="newHash"
      >
        {{ $t('codeChecker.newHash') }}
      </UButton>
      <UButton
        rounded
        class="border-border w-28"
        :disabled="!selectedFile"
        @click="replay"
      >
        {{ $t('codeChecker.replay') }}
      </UButton>
      <UButton
        rounded
        :loading="!codeShareLink && !!selectedFile"
        :disabled="!codeShareLink"
        class="border-border px-4"
        icon="i-heroicons-arrow-top-right-on-square"
        @click="openInNewTab"
      />
      <UButton
        rounded
        :disabled="!render"
        class="border-border px-4"
        icon="i-heroicons-arrows-pointing-out"
        @click="toggleFullscreen"
      />
    </div>

    <div>
      <span class="text-sm font-medium text-foreground">{{ $t('codeChecker.currentHash') }}</span>
      <UInput
        v-model="hash"
        class="w-full mt-2"
        placeholder="hash value"
      />
    </div>

    <div v-if="selectedFile">
      <p class="text-sm font-medium text-foreground mb-2">
        {{ $t('codeChecker.exportVariations') }}
      </p>
      <div class="flex gap-4">
        <UButton
          class="flex-1 text-ellipsis overflow-hidden"
          :disabled="!kodaRendererUsed"
          @click="exportAsPNG"
        >
          <span>{{ `Export ${fileName} as PNG` }}</span>
        </UButton>
        <USelectMenu
          :model-value="selectedVariation"
          :items="variationOptions"
          value-key="value"
          :disabled="!kodaRendererUsed"
          class="w-20"
          :search-input="false"
          @update:model-value="selectedVariation = $event"
        />
      </div>
    </div>
  </div>
</template>
