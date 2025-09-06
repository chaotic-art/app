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

const emit = defineEmits(['reload', 'hash'])

const fullscreenRef = ref<HTMLElement | null>(null)

const { toggle: toggleFullscreen, isFullscreen } = useFullscreen(fullscreenRef)

const variationOptions = config.varaitionsOptions

const hash = ref('')
const count = ref(0)
const variationCounter = ref(0)
const selectedVariation = ref(variationOptions[0])

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

onMounted(newHash)

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
    class="border bg-white dark:bg-gray-900 shadow-lg p-5 pb-6 w-full max-w-[490px] flex flex-col gap-5"
  >
    <div ref="fullscreenRef">
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

      <SandboxIFrame
        v-if="render"
        v-model:count="count"
        :custom-class="{ border: !isFullscreen }"
        :hash="hash"
        :assets="assets"
      />
      <div
        v-else
        class="border border-gray-200 dark:border-gray-700 rounded-lg h-96 flex items-center justify-center bg-gray-50 dark:bg-gray-800"
      >
        <UIcon name="i-heroicons-photo" class="text-4xl text-gray-400" />
      </div>
    </div>

    <div class="pb-5 flex w-full gap-3 border-b border-gray-200 dark:border-gray-700 flex-wrap">
      <UButton
        rounded
        class="px-5 flex-1 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
        icon-right="i-heroicons-arrow-path"
        @click="newHash"
      >
        {{ $t('codeChecker.newHash') }}
      </UButton>
      <UButton
        rounded
        class="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 w-28"
        :disabled="!selectedFile"
        @click="replay"
      >
        {{ $t('codeChecker.replay') }}
      </UButton>
      <UButton
        rounded
        :loading="!codeShareLink && !!selectedFile"
        :disabled="!codeShareLink"
        class="border-gray-300 dark:border-gray-600 px-4 hover:bg-gray-50 dark:hover:bg-gray-800"
        icon="i-heroicons-arrow-top-right-on-square"
        @click="openInNewTab"
      />
      <UButton
        rounded
        :disabled="!render"
        class="border-gray-300 dark:border-gray-600 px-4 hover:bg-gray-50 dark:hover:bg-gray-800"
        icon="i-heroicons-arrows-pointing-out"
        @click="toggleFullscreen"
      />
    </div>

    <div>
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t('codeChecker.currentHash') }}</span>
      <UInput
        v-model="hash"
        class="w-full mt-2"
        placeholder="hash value"
      />
    </div>

    <div v-if="selectedFile">
      <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
          v-model="selectedVariation"
          :options="variationOptions"
          :disabled="!kodaRendererUsed"
          class="w-20"
        />
      </div>
    </div>
  </div>
</template>
