<script setup lang="ts">
import type { NFTToMint } from '~/components/massmint/types'
import type { useMassMintWizard } from '~/composables/massmint/useMassMintWizard'
import type { AssetHubChain } from '~/plugins/sdk.client'
import { useMassMint } from '~/composables/massmint/useMassMint'
import { MintingState } from '~/types/bulkOperations'

const props = defineProps<{
  wizard: ReturnType<typeof useMassMintWizard>
  collectionId: string
  collectionName: string
  chain: AssetHubChain
  returnRoute?: string
}>()

const router = useRouter()
const store = useBulkOperationsStore()

const mintingState = ref<MintingState>(MintingState.PRE_SIGN)
const errorMsg = ref('')

const { massMint, progress, isLoading: _isLoading } = useMassMint()

const totalFiles = computed(() => props.wizard.uploadedFiles.value.length)

const progressPercent = computed(() => {
  if (!progress.value.total)
    return 0
  return Math.round((progress.value.current / progress.value.total) * 100)
})

const stageLabel = computed(() => {
  switch (progress.value.stage) {
    case 'preparing': return 'Preparing'
    case 'uploading': return 'Uploading'
    case 'minting': return 'Signing'
    case 'complete': return 'Complete'
    case 'error': return 'Error'
    default: return ''
  }
})

watch(progress, (p) => {
  if (p.stage === 'uploading' || p.stage === 'preparing') {
    mintingState.value = MintingState.PROCESSING
  }
  else if (p.stage === 'minting') {
    mintingState.value = MintingState.SIGNING
  }
  else if (p.stage === 'complete') {
    mintingState.value = MintingState.SUCCESS
  }
  else if (p.stage === 'error') {
    mintingState.value = MintingState.ERROR
    errorMsg.value = p.message
  }
})

async function handleMint() {
  mintingState.value = MintingState.PROCESSING

  const nfts: NFTToMint[] = props.wizard.uploadedFiles.value.map(f => ({
    name: f.name || f.file.name,
    file: f.file,
    description: f.description,
    price: f.price,
    attributes: f.attributes,
  }))

  try {
    await massMint({
      nfts,
      collectionId: props.collectionId,
      collectionName: props.collectionName,
      blockchain: props.chain,
    })
  }
  catch (err: any) {
    mintingState.value = MintingState.ERROR
    errorMsg.value = err.message || 'An unexpected error occurred'
  }
}

function handleViewCollection() {
  store.reset()
  router.push(props.returnRoute || `/${props.chain}/collection/${props.collectionId}?admin=true`)
}

function handleMintMore() {
  props.wizard.clearFiles()
  store.goToStep(0)
  mintingState.value = MintingState.PRE_SIGN
}

function handleRetry() {
  mintingState.value = MintingState.PRE_SIGN
}

function handleGoBack() {
  store.prevStep()
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[400px] p-6">
    <div class="w-full max-w-md">
      <!-- PRE_SIGN -->
      <div v-if="mintingState === MintingState.PRE_SIGN" class="rounded-2xl border border-border bg-background p-8 text-center space-y-5 shadow-sm">
        <div class="w-12 h-12 mx-auto rounded-xl border border-border bg-muted/50 flex items-center justify-center">
          <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-foreground" />
        </div>

        <div class="space-y-2">
          <h2 class="text-xl font-semibold">
            Ready to mint
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ totalFiles }} item{{ totalFiles !== 1 ? 's' : '' }} will be uploaded and minted into
            <span class="font-medium text-foreground">{{ collectionName }}</span>.
            This may take a few minutes.
          </p>
        </div>

        <div class="border border-border rounded-xl divide-y divide-border text-sm">
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-muted-foreground">Items</span>
            <span class="font-medium font-mono">{{ totalFiles }}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-muted-foreground">Collection</span>
            <span class="font-medium">{{ collectionName }}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3">
            <span class="text-muted-foreground">Network</span>
            <span class="font-medium uppercase">{{ chain }}</span>
          </div>
        </div>

        <UButton
          size="lg"
          color="primary"
          class="w-full"
          @click="handleMint"
        >
          Mint Now
        </UButton>
      </div>

      <!-- PROCESSING (uploading / preparing) -->
      <div v-else-if="mintingState === MintingState.PROCESSING" class="rounded-2xl border border-border bg-background p-8 text-center space-y-5 shadow-sm">
        <div class="w-12 h-12 mx-auto rounded-xl border border-border bg-muted/50 flex items-center justify-center">
          <UIcon name="i-heroicons-arrow-up-tray" class="w-6 h-6 text-foreground" />
        </div>

        <div class="space-y-2">
          <h2 class="text-xl font-semibold">
            Creating items
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Your items are being uploaded to a decentralized server. This may take a few minutes.
          </p>
        </div>

        <div class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5">
          <div class="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span class="text-xs font-semibold uppercase tracking-wide text-primary">{{ stageLabel }}</span>
        </div>

        <div class="space-y-2">
          <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              class="h-full bg-primary rounded-full transition-all duration-700 ease-out"
              :style="{ width: `${progressPercent}%` }"
            />
          </div>
          <div class="flex items-center justify-between text-xs text-muted-foreground">
            <span>{{ progress.current }} of {{ progress.total }} items</span>
            <span class="font-mono">{{ progressPercent }}%</span>
          </div>
        </div>

        <p class="text-xs text-muted-foreground/60">
          Don't close this tab while minting is in progress.
        </p>
      </div>

      <!-- SIGNING (wallet confirmation) -->
      <div v-else-if="mintingState === MintingState.SIGNING" class="rounded-2xl border border-border bg-background p-8 text-center space-y-5 shadow-sm">
        <div class="w-12 h-12 mx-auto rounded-xl border border-border bg-muted/50 flex items-center justify-center">
          <UIcon name="i-heroicons-pencil-square" class="w-6 h-6 text-foreground" />
        </div>

        <div class="space-y-2">
          <h2 class="text-xl font-semibold">
            Confirm in wallet
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Please approve the transaction in your wallet extension to complete the minting process.
          </p>
        </div>

        <div class="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1.5">
          <div class="w-3.5 h-3.5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
          <span class="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Awaiting signature</span>
        </div>

        <p class="text-xs text-muted-foreground/60">
          Don't close this tab while minting is in progress.
        </p>
      </div>

      <!-- SUCCESS -->
      <div v-else-if="mintingState === MintingState.SUCCESS" class="rounded-2xl border border-border bg-background p-8 text-center space-y-5 shadow-sm">
        <div class="w-12 h-12 mx-auto rounded-xl border border-green-500/20 bg-green-500/10 flex items-center justify-center">
          <UIcon name="i-heroicons-check" class="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>

        <div class="space-y-2">
          <h2 class="text-xl font-semibold">
            Minted successfully
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            {{ totalFiles }} item{{ totalFiles !== 1 ? 's' : '' }} {{ totalFiles !== 1 ? 'have' : 'has' }} been minted into
            <span class="font-medium text-foreground">{{ collectionName }}</span>.
          </p>
        </div>

        <div class="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5">
          <UIcon name="i-heroicons-check-circle-solid" class="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span class="text-xs font-semibold uppercase tracking-wide text-green-600 dark:text-green-400">Complete</span>
        </div>

        <div class="flex flex-col gap-2">
          <UButton
            size="lg"
            color="primary"
            class="w-full"
            @click="handleViewCollection"
          >
            View Collection
          </UButton>
          <UButton
            size="lg"
            variant="outline"
            class="w-full"
            @click="handleMintMore"
          >
            Mint More
          </UButton>
        </div>
      </div>

      <!-- ERROR -->
      <div v-else-if="mintingState === MintingState.ERROR" class="rounded-2xl border border-border bg-background p-8 text-center space-y-5 shadow-sm">
        <div class="w-12 h-12 mx-auto rounded-xl border border-red-500/20 bg-red-500/10 flex items-center justify-center">
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>

        <div class="space-y-2">
          <h2 class="text-xl font-semibold">
            Minting failed
          </h2>
          <p class="text-sm text-muted-foreground leading-relaxed">
            Something went wrong while minting your items. You can retry or go back to review.
          </p>
        </div>

        <div class="rounded-lg bg-red-500/5 border border-red-500/20 px-4 py-3">
          <p class="text-xs text-red-600 dark:text-red-400 font-mono break-all">
            {{ errorMsg }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <UButton
            size="lg"
            color="primary"
            class="w-full"
            @click="handleRetry"
          >
            Retry
          </UButton>
          <UButton
            size="lg"
            variant="outline"
            class="w-full"
            @click="handleGoBack"
          >
            Back to Review
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>
