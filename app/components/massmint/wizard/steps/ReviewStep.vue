<script setup lang="ts">
import type { MassMintFile } from '~/components/massmint/types'
import type { useMassMintWizard } from '~/composables/massmint/useMassMintWizard'
import type { AssetHubChain } from '~/plugins/sdk.client'

const props = defineProps<{
  wizard: ReturnType<typeof useMassMintWizard>
  collectionId: string
  chain: AssetHubChain
}>()

const previewFile = ref<MassMintFile | null>(null)
const showCostDetails = ref(false)

const { currentChain, chainSymbol } = useChain()
const {
  itemDeposit,
  metadataDeposit,
  attributeDeposit,
  loading: depositLoading,
} = useDeposit(computed(() => currentChain.value))

const readyCount = computed(() =>
  props.wizard.uploadedFiles.value.filter(f => f.name?.trim() && f.description?.trim()).length,
)

const warningCount = computed(() =>
  props.wizard.uploadedFiles.value.filter(f => f.name?.trim() && !f.description?.trim()).length,
)

const errorCount = computed(() =>
  props.wizard.uploadedFiles.value.filter(f => !f.name?.trim()).length,
)

const totalFiles = computed(() => props.wizard.uploadedFiles.value.length)
const totalAttributes = computed(() =>
  props.wizard.uploadedFiles.value.reduce((sum, f) => sum + (f.attributes?.length ?? 0), 0),
)

// Per-item cost components
const formatDot = (raw: number) => (raw / 1e10).toFixed(4)

const perItemDeposit = computed(() => itemDeposit.value)
const perItemMetadata = computed(() => metadataDeposit.value)
const perItemAttribute = computed(() => attributeDeposit.value)

const totalItemDeposits = computed(() => perItemDeposit.value * totalFiles.value)
const totalMetadataDeposits = computed(() => perItemMetadata.value * totalFiles.value)
const totalAttributeDeposits = computed(() => perItemAttribute.value * totalAttributes.value)

const estimatedTotal = computed(() => {
  if (depositLoading.value)
    return null
  return totalItemDeposits.value + totalMetadataDeposits.value + totalAttributeDeposits.value
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- Validation summary - compact inline -->
    <div class="flex items-center gap-6 text-sm">
      <div class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-check-circle" class="w-5 h-5 text-green-500" />
        <span class="font-mono font-bold">{{ readyCount }}</span>
        <span class="text-muted-foreground">ready</span>
      </div>
      <div v-if="warningCount > 0" class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-amber-500" />
        <span class="font-mono font-bold">{{ warningCount }}</span>
        <span class="text-muted-foreground">no description</span>
      </div>
      <div v-if="errorCount > 0" class="flex items-center gap-1.5">
        <UIcon name="i-heroicons-x-circle" class="w-5 h-5 text-red-500" />
        <span class="font-mono font-bold">{{ errorCount }}</span>
        <span class="text-muted-foreground">missing name</span>
      </div>
    </div>

    <!-- Visual grid preview -->
    <div class="space-y-3">
      <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        <div
          v-for="file in wizard.uploadedFiles.value"
          :key="file.id"
          class="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          @click="previewFile = file"
        >
          <img
            v-if="file.file.type?.startsWith('image/')"
            :src="file.thumbnailUrl"
            :alt="file.name"
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center bg-muted">
            <UIcon name="i-heroicons-document" class="w-6 h-6 text-muted-foreground" />
          </div>

          <!-- Status badge -->
          <div
            v-if="!file.name?.trim()"
            class="absolute top-1 right-1"
          >
            <UIcon name="i-heroicons-x-circle" class="w-4 h-4 text-red-500" />
          </div>
          <div
            v-else-if="!file.description?.trim()"
            class="absolute top-1 right-1"
          >
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 text-amber-500" />
          </div>

          <div class="absolute bottom-0 left-0 right-0 bg-black/70 px-1.5 py-0.5">
            <p class="text-white text-[10px] truncate">
              {{ file.name || 'Missing name' }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Cost estimate -->
    <div class="border border-border rounded-lg overflow-hidden">
      <!-- Summary row -->
      <button
        class="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/30 transition-colors"
        @click="showCostDetails = !showCostDetails"
      >
        <div class="flex items-center gap-2">
          <UIcon
            name="i-heroicons-chevron-right"
            class="w-4 h-4 text-muted-foreground transition-transform"
            :class="showCostDetails ? 'rotate-90' : ''"
          />
          <span class="font-medium">Estimated Cost</span>
          <span class="text-muted-foreground">&middot; {{ totalFiles }} items</span>
        </div>
        <span v-if="depositLoading">
          <USkeleton class="h-4 w-28 rounded" />
        </span>
        <span v-else class="font-semibold font-mono">
          ~{{ formatDot(estimatedTotal ?? 0) }} {{ chainSymbol }}
        </span>
      </button>

      <!-- Collapsible details -->
      <div v-if="showCostDetails && !depositLoading" class="border-t border-border bg-muted/20 px-4 py-3 space-y-3">
        <!-- Per-item breakdown -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground">Item Deposit</span>
              <span class="text-xs text-muted-foreground/60">{{ formatDot(perItemDeposit) }} &times; {{ totalFiles }}</span>
            </div>
            <span class="font-mono text-sm">{{ formatDot(totalItemDeposits) }} {{ chainSymbol }}</span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground">Metadata Deposit</span>
              <span class="text-xs text-muted-foreground/60">{{ formatDot(perItemMetadata) }} &times; {{ totalFiles }}</span>
            </div>
            <span class="font-mono text-sm">{{ formatDot(totalMetadataDeposits) }} {{ chainSymbol }}</span>
          </div>

          <div v-if="totalAttributes > 0" class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-2">
              <span class="text-muted-foreground">Attribute Deposit</span>
              <span class="text-xs text-muted-foreground/60">{{ formatDot(perItemAttribute) }} &times; {{ totalAttributes }} traits</span>
            </div>
            <span class="font-mono text-sm">{{ formatDot(totalAttributeDeposits) }} {{ chainSymbol }}</span>
          </div>
        </div>

        <USeparator />

        <!-- Total -->
        <div class="flex items-center justify-between text-sm">
          <span class="font-medium">Total Deposit</span>
          <span class="font-semibold font-mono">~{{ formatDot(estimatedTotal ?? 0) }} {{ chainSymbol }}</span>
        </div>

        <p class="text-xs text-muted-foreground">
          Deposits are refundable when items are burned. Network fees (~0.001 {{ chainSymbol }}) are charged separately per transaction.
        </p>
      </div>
    </div>

    <div v-if="errorCount > 0" class="flex items-center gap-2 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
      <UIcon name="i-heroicons-x-circle" class="w-4 h-4 text-red-500 shrink-0" />
      <p class="text-sm text-red-600 dark:text-red-400">
        {{ errorCount }} item{{ errorCount !== 1 ? 's' : '' }} missing name — go back to Metadata to fix
      </p>
    </div>

    <FilePreviewModal
      :file="previewFile"
      :files="wizard.uploadedFiles.value"
      @close="previewFile = null"
      @update:file="previewFile = $event"
    />
  </div>
</template>
