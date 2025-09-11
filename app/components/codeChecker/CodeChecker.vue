<script lang="ts" setup>
import type { AssetMessage, Validity } from './types'
import { useEventListener } from '@vueuse/core'
import config from './codechecker.config'
import CodeCheckerIssueHintAutomaticResize from './issueHint/AutomaticResize.vue'
import CodeCheckerIssueHintConsistentArt from './issueHint/ConsistentArt.vue'
import CodeCheckerIssueHintCorrectHTMLName from './issueHint/CorrectHTMLName.vue'
import CodeCheckerIssueHintKodaHashCalledOnce from './issueHint/KodaHashCalledOnce.vue'
import CodeCheckerIssueHintNotUsingExternalResources from './issueHint/NotUsingExternalResources.vue'
import CodeCheckerIssueHintUsingKodaHash from './issueHint/UsingKodaHash.vue'
import CodeCheckerIssueHintUsingParamHash from './issueHint/UsingParamHash.vue'
import CodeCheckerIssueHintValidImage from './issueHint/ValidImage.vue'
import CodeCheckerIssueHintVariationLoadingTime from './issueHint/VariationLoadingTime.vue'
import CodeCheckerTestItem from './TestItem.vue'
import { createSandboxAssets, extractAssetsFromZip } from './utils'
import { validate } from './validate'

const RESOURCES_LIST = [
  {
    title: 'codeChecker.kodahashTemplate',
    url: 'https://github.com/vikiival/kodahash',
  },
  // {
  //   title: 'codeChecker.learnAboutGenArt',
  //   url: '',
  // },
  // {
  //   title: 'codeChecker.codeChecker',
  //   url: '',
  // },
]

const validtyDefault: Validity = {
  canvasSize: '',
  localP5jsUsed: false,
  kodaRendererUsed: 'unknown',
  kodaRendererCalledOnce: 'unknown',
  resizerUsed: 'unknown',
  usesHashParam: 'unknown',
  validTitle: 'unknown',
  renderDurationValid: 'loading',
  title: '-',
  validKodaRenderPayload: 'loading',
  consistent: 'loading',
  externalResourcesNotUsed: 'unknown',
}

const selectedFile = ref<File | null>(null)
const assets = ref<AssetMessage[]>([])
const indexContent = ref<string>()
const indexUrl = ref<string>()
const fileName = computed(() => selectedFile.value?.name)
const fileValidity = reactive<Validity>({ ...validtyDefault })
const errorMessage = ref('')
const renderStartTime = ref(0)
const renderEndTime = ref(0)
const renderCount = ref(0)
const reloadTrigger = ref(0)
const firstImage = ref<string>()
const previewHash = ref()

async function onFileSelected(file: File) {
  clear()
  startClock()
  selectedFile.value = file
  const { indexFile, sketchFile, p5File, entries } = await extractAssetsFromZip(file)

  if (!indexFile) {
    errorMessage.value = `Index file not found: Please make sure that "index.html" is in the root directory`
    return
  }

  if (!sketchFile) {
    errorMessage.value = `Sketch file not found: ${config.sketchFile}`
    return
  }

  if (!p5File) {
    errorMessage.value = `p5 file not found: Please make sure that "p5.min.js" is in the root directory`
    return
  }

  const valid = validate(indexFile.content, sketchFile.content)
  if (!valid.isSuccess) {
    errorMessage.value = valid.error ?? 'Unknown error'
  }
  else {
    Object.assign(fileValidity, valid.value)
  }

  if (!fileValidity.kodaRendererUsed) {
    fileValidity.renderDurationValid = 'unknown'
    fileValidity.validKodaRenderPayload = 'unknown'
    fileValidity.consistent = 'unknown'
  }

  indexContent.value = indexFile.content
  assets.value = await createSandboxAssets(indexFile, entries)
}

function clear() {
  selectedFile.value = null
  assets.value = []
  errorMessage.value = ''
  reloadTrigger.value = 0
  renderCount.value = 0
  indexUrl.value = undefined
  indexContent.value = undefined
  Object.assign(fileValidity, validtyDefault)
}

function startClock() {
  renderCount.value = 0
  renderStartTime.value = performance.now()
  fileValidity.renderDurationValid = 'loading'
}

function hasImage(dataURL: string): boolean {
  const regex = /^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/
  return regex.test(dataURL)
}

function consistencyField(payload: any) {
  const version: number = Number.parseFloat(payload?.version ?? '0')
  return version >= 1.0 ? payload.base64Details : payload.image
}

useEventListener('message', async (res: MessageEvent) => {
  if (
    res.data?.type === 'kodahash/render/completed'
    && previewHash.value === res.data.payload.hash
  ) {
    renderCount.value++
    fileValidity.kodaRendererCalledOnce = renderCount.value === 1

    const payload = res.data?.payload
    renderEndTime.value = performance.now()
    const duration = renderEndTime.value - renderStartTime.value
    fileValidity.renderDurationValid = duration < config.maxAllowedLoadTime
    fileValidity.validKodaRenderPayload
      = Boolean(payload?.image) && hasImage(payload.image)
    if (fileValidity.validKodaRenderPayload) {
      if (reloadTrigger.value === 0) {
        firstImage.value = consistencyField(payload)
        reloadTrigger.value = 1
      }
      else if (
        fileValidity.consistent === 'loading'
        || fileValidity.consistent === 'unknown'
      ) {
        fileValidity.consistent = firstImage.value === consistencyField(payload)
      }
    }
    else {
      fileValidity.consistent = 'unknown'
    }
  }
})
</script>

<template>
  <UContainer class="flex flex-wrap pb-44 gap-10 lg:gap-0">
    <div class="lg:w-1/2 flex flex-col gap-10">
      <!-- Content of the first column -->
      <div class="">
        <h1 class="text-3xl font-bold mb-4">
          {{ $t('codeChecker.title') }}
        </h1>
        <div class="w-2/3">
          {{ $t('codeChecker.description') }}
        </div>
      </div>

      <div class="py-4 px-5 border border-border rounded-lg">
        <h2 class="mb-3 text-lg font-semibold">
          {{ $t('codeChecker.resources') }}:
        </h2>
        <div class="flex flex-col gap-3">
          <a
            v-for="item in RESOURCES_LIST"
            :key="item.title"
            :href="item.url"
            class="flex items-center w-fit"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            <div
              class="text-primary hover:text-primary/80 flex items-center mr-2"
            >
              {{ $t(item.title) }}
            </div>
            <UIcon
              name="i-heroicons-arrow-top-right-on-square"
              class="text-muted-foreground text-sm"
            />
          </a>
        </div>
      </div>

      <div class="">
        <h2 class="mb-3 text-xl font-semibold">
          {{ $t('codeChecker.upload') }}
        </h2>
        <p class="mb-4">
          {{ $t('codeChecker.uploadInstructions') }}
        </p>
        <FileUploader
          v-model:selected-file="selectedFile"
          :file-name="fileName"
          @file-selected="onFileSelected"
          @clear="clear"
        />
      </div>

      <div class="">
        <h2 class="mb-3 text-xl font-semibold">
          {{ $t('codeChecker.codeValidation') }}
        </h2>
        <p
          v-if="!selectedFile"
          class="text-muted-foreground"
        >
          {{ $t('codeChecker.uploadPrompt') }}
        </p>
        <div v-else>
          <div
            v-if="errorMessage"
            class="text-destructive"
          >
            {{ $t('error') }}: {{ errorMessage }}
          </div>
          <div v-else>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">{{
                $t('codeChecker.canvasSize')
              }}</span>
              <span>{{ fileValidity.canvasSize }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">
                {{ $t('codeChecker.artName') }}
              </span>
              <span>{{ fileValidity.title }}</span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-muted-foreground">{{ $t('codeChecker.local') }} p5js</span>
              <span>{{ fileValidity.localP5jsUsed ? 'Yes' : 'No' }}</span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-if="selectedFile && !errorMessage"
        class="border-t border-border pt-5 flex flex-col gap-5"
      >
        <CodeCheckerTestItem
          :passed="fileValidity.validTitle"
          :description="$t('codeChecker.correctHTMLName')"
        >
          <template #modalContent>
            <CodeCheckerIssueHintCorrectHTMLName />
          </template>
        </CodeCheckerTestItem>
        <CodeCheckerTestItem
          :passed="fileValidity.kodaRendererUsed"
          :description="$t('codeChecker.usingKodaHash')"
        >
          <template #modalContent>
            <CodeCheckerIssueHintUsingKodaHash />
          </template>
        </CodeCheckerTestItem>
        <CodeCheckerTestItem
          :passed="fileValidity.kodaRendererCalledOnce"
          :description="$t('codeChecker.kodaHashCalledOnce')"
        >
          <template #modalContent>
            <CodeCheckerIssueHintKodaHashCalledOnce />
          </template>
        </CodeCheckerTestItem>
        <CodeCheckerTestItem
          :passed="fileValidity.externalResourcesNotUsed"
          :description="$t('codeChecker.notUsingExternalResources')"
        >
          <template #modalContent>
            <CodeCheckerIssueHintNotUsingExternalResources />
          </template>
        </CodeCheckerTestItem>
        <CodeCheckerTestItem
          :passed="fileValidity.usesHashParam"
          :description="$t('codeChecker.usingParamHash')"
        >
          <template #modalContent>
            <CodeCheckerIssueHintUsingParamHash />
          </template>
        </CodeCheckerTestItem>

        <CodeCheckerTestItem
          :passed="fileValidity.validKodaRenderPayload"
          :description="$t('codeChecker.validImage')"
        >
          <template #modalContent>
            <CodeCheckerIssueHintValidImage />
          </template>
        </CodeCheckerTestItem>
        <CodeCheckerTestItem
          :passed="fileValidity.consistent"
          :description="$t('codeChecker.consistentArt')"
        >
          <template #modalContent>
            <CodeCheckerIssueHintConsistentArt />
          </template>
        </CodeCheckerTestItem>
        <CodeCheckerTestItem
          :passed="fileValidity.resizerUsed"
          :description="$t('codeChecker.automaticResize')"
          optional
        >
          <template #modalContent>
            <CodeCheckerIssueHintAutomaticResize />
          </template>
        </CodeCheckerTestItem>
        <CodeCheckerTestItem
          :passed="fileValidity.renderDurationValid"
          :description="
            $t('codeChecker.variationLoadingTime')
          "
          optional
        >
          <template #modalContent>
            <CodeCheckerIssueHintVariationLoadingTime />
          </template>
        </CodeCheckerTestItem>
      </div>
    </div>

    <div
      class="w-full lg:w-1/2 flex flex-col items-center lg:mt-4 lg:items-end"
    >
      <!-- Content of the second column -->
      <PreviewCard
        :selected-file="selectedFile"
        :file-name="fileName"
        :assets="assets"
        :render="Boolean(selectedFile)"
        :koda-renderer-used="fileValidity.kodaRendererUsed"
        :reload-trigger="reloadTrigger"
        :index-url="indexUrl ?? ''"
        @reload="startClock"
        @hash="(hash) => (previewHash = hash)"
      />

      <CodeCheckerMassPreview
        v-if="selectedFile && indexContent"
        class="mt-11"
        :assets="assets"
        :index-content="indexContent"
        @upload="(value) => (indexUrl = value)"
      />

      <div class="max-w-[490px] mt-11">
        <hr
          v-if="selectedFile"
          class="my-2 bg-border w-full mb-11"
        >

        <div class="flex items-center gap-5">
          <div>
            <UIcon
              name="i-heroicons-shield-check"
              class="text-muted-foreground"
              size="lg"
            />
          </div>
          <p class="capitalize text-muted-foreground">
            {{ $t('codeChecker.confidentialCode') }}
          </p>
        </div>
      </div>
    </div>
  </UContainer>
</template>
