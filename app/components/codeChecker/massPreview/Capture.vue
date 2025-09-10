<script lang="ts" setup>
import type { AssetMessage, CapturePreviewItem } from '../types'
import { IFRAME_BLOB_URI } from '@/services/capture'
import { getObjectUrl, getUpload, uploadFile } from '@/services/playground'
import { generateRandomHash, getDocumentFromString } from '../utils'
import CodeCheckerMassPreviewControls from './Controls.vue'
import CodeCheckerMassPreviewGrid from './Grid.vue'
import { AssetElementMap, AssetReplaceElement } from './utils'

const props = withDefaults(
  defineProps<{
    assets: Array<AssetMessage>
    indexContent: string
    previews?: number
  }>(),
  {
    previews: 12,
  },
)
const emit = defineEmits(['upload'])
const { $i18n } = useNuxtApp()

const previewItems = ref<CapturePreviewItem[]>([])
const previewAmount = ref(props.previews)
const active = ref(false)
const uploading = ref(false)
const indexKey = ref<string>()

async function replaceAssetContent(doc: Document, asset: AssetMessage) {
  const response = await $fetch<string>(asset.src)

  const { src: srcAttribute, tag } = AssetElementMap[asset.type]

  const element = doc.querySelector(
    `${tag}[${srcAttribute}="${asset.originalSrc}"]`,
  )

  if (!element) {
    return
  }

  const assetReplace = AssetReplaceElement[asset.type] ?? null

  assetReplace?.({ doc, content: response, element })
}

async function buildIndexFile(): Promise<Blob> {
  const doc = getDocumentFromString(props.indexContent)

  await Promise.all(
    props.assets.map(asset => replaceAssetContent(doc, asset)),
  )

  return new Blob([doc.documentElement.outerHTML], {
    type: 'text/html',
  })
}

async function uploadIndex() {
  try {
    uploading.value = true
    const file = await buildIndexFile()
    const { key } = await uploadFile({
      file,
      fileName: 'index.html',
      prefix: 'codeChecker',
    })
    await exponentialBackoff(() => getUpload(key)).catch(console.warn)
    indexKey.value = key
    emit('upload', getObjectUrl(key))
  }
  catch (error) {
    errorMessage(`${$i18n.t('codeChecker.failedUploadingIndex')}: ${error}`)
  }
  finally {
    uploading.value = false
  }
}

function updatePreview(preview: CapturePreviewItem) {
  previewItems.value = previewItems.value.map(p =>
    p.hash === preview.hash ? preview : p,
  )
}

function initScreenshot() {
  if (!indexKey.value) {
    return
  }

  previewItems.value.forEach(async (preview) => {
    try {
      let previewUrl = getObjectUrl(indexKey.value!)
      previewUrl += `?hash=${preview.hash}`

      const iframeUrl = new URL(IFRAME_BLOB_URI)
      iframeUrl.searchParams.set('url', previewUrl)

      preview = {
        ...preview,
        image: iframeUrl.toString(),
      }
    }
    catch (error) {
      console.error(error)
    }
    finally {
      preview = { ...preview, loading: false }
    }

    updatePreview(preview)
  })
}

async function generateMassPreview() {
  previewItems.value = Array.from({ length: previewAmount.value }).map(() => ({
    hash: generateRandomHash(),
    loading: true,
  }))

  initScreenshot()
}

watch(
  [() => props.assets, () => props.indexContent],
  ([assets, indexContent]) => {
    if (assets.length && indexContent) {
      uploadIndex()
    }
  },
  { immediate: true },
)

watch(active, (active) => {
  if (active) {
    generateMassPreview()
  }
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center">
      <p class="font-bold capitalize">
        {{ $t('codeChecker.testOutCapture') }}
      </p>

      <span
        v-if="uploading"
        class="text-sm text-k-grey capitalize"
      >
        {{ $t('codeChecker.uploadingFile') }}</span>
      <USwitch
        v-else-if="indexKey"
        v-model="active"
      />
    </div>

    <transition name="slide">
      <div
        v-if="active"
        class="flex flex-col gap-4 mt-6!"
      >
        <CodeCheckerMassPreviewControls
          v-model="previewAmount"
          :previews="previewItems"
          hide-average
          @retry="generateMassPreview"
        />

        <CodeCheckerMassPreviewGrid :items="previewItems.map((p) => p.loading)">
          <template #default="{ index }">
            <iframe
              title="preview"
              :src="previewItems[index]?.image"
              class="w-full h-full border border-primary border-solid"
            />
          </template>
        </CodeCheckerMassPreviewGrid>
      </div>
    </transition>
  </div>
</template>
