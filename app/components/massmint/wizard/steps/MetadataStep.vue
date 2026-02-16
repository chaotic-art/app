<script setup lang="ts">
import type { MassMintFile } from '~/components/massmint/types'
import type { useMassMintWizard } from '~/composables/massmint/useMassMintWizard'
import Papa from 'papaparse'
import MassMintItemPanel from '~/components/massmint/wizard/MassMintItemPanel.vue'
import { useTemplateGenerator } from '~/composables/massmint/useTemplateGenerator'
import { MetadataPath } from '~/types/bulkOperations'

const props = defineProps<{
  wizard: ReturnType<typeof useMassMintWizard>
  existingItemCount: number
}>()

const { downloadCsvTemplate } = useTemplateGenerator()

// Local reference to wizard to avoid prop mutation linting errors
// (we're mutating .value of refs within wizard, which is acceptable in Vue)
const wizard = props.wizard

const templateFileInput = ref<HTMLInputElement>()
const editingFile = ref<MassMintFile | null>(null)
const itemPanelRef = ref<InstanceType<typeof MassMintItemPanel> | null>(null)

function openFilePanel(file: MassMintFile) {
  if (editingFile.value && editingFile.value.id !== file.id) {
    const allowed = itemPanelRef.value?.canSwitchFile(() => {
      editingFile.value = file
    })
    if (!allowed)
      return
  }
  editingFile.value = file
}

function handlePanelSave(data: { name: string, description: string, attributes: Array<{ trait_type: string, value: string }> }) {
  if (!editingFile.value)
    return
  editingFile.value.name = data.name
  editingFile.value.description = data.description
  editingFile.value.attributes = data.attributes.length > 0 ? data.attributes : undefined
}

function closeFilePanel() {
  editingFile.value = null
}

const sharedDescriptionApplied = ref(false)
const sharedDescriptionAppliedCount = ref(0)
const lastAppliedDescription = ref('')

function handleApplySharedDescription() {
  const desc = wizard.sharedDescription.value.trim()
  if (!desc)
    return

  let count = 0
  wizard.uploadedFiles.value.forEach((file) => {
    const current = file.description?.trim() ?? ''
    if (!current || current === lastAppliedDescription.value) {
      file.description = desc
      count++
    }
  })

  lastAppliedDescription.value = desc
  sharedDescriptionAppliedCount.value = count
  sharedDescriptionApplied.value = true
}

watch(() => wizard.sharedDescription.value, () => {
  sharedDescriptionApplied.value = false
})

function handleDownloadTemplate() {
  downloadCsvTemplate(wizard.uploadedFiles.value)
  wizard.templateDownloaded.value = true
}

function handleTemplateUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file)
    return

  wizard.templateFileName.value = file.name
  wizard.templateFileSize.value = file.size

  const reader = new FileReader()
  reader.onload = (event) => {
    const content = event.target?.result as string
    parseTemplateFile(file.name, content)
    wizard.templateUploaded.value = true
  }
  reader.readAsText(file)
  input.value = ''
}

function handleRemoveTemplate() {
  wizard.templateUploaded.value = false
  wizard.templateFileName.value = ''
  wizard.templateFileSize.value = 0
  // Clear descriptions that were set from the template
  wizard.uploadedFiles.value.forEach((file) => {
    file.description = undefined
  })
}

function parseTemplateFile(fileName: string, content: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()

  if (ext === 'csv') {
    parseCsvContent(content)
  }
  else if (ext === 'json') {
    parseJsonContent(content)
  }
  else if (ext === 'txt') {
    parseTxtContent(content)
  }
  else {
    errorMessage('Unsupported template format. Use CSV, JSON, or TXT.')
  }
}

function parseCsvContent(content: string) {
  const parseResult = Papa.parse<string[]>(content, {
    header: false,
    skipEmptyLines: true,
    transformHeader: header => header.trim().toLowerCase(),
  })

  if (parseResult.errors.length > 0) {
    errorMessage(`CSV parsing error: ${parseResult.errors[0]?.message || 'Invalid CSV format'}`)
    return
  }

  const rows = parseResult.data
  if (rows.length < 2) {
    errorMessage('CSV file is empty — no data rows found')
    return
  }

  const header = rows[0]!.map(h => h.trim().toLowerCase())
  const nameIdx = header.indexOf('name')
  const descIdx = header.indexOf('description')
  const priceIdx = header.indexOf('price')
  const filenameIdx = header.indexOf('filename')

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i]!
    const filename = filenameIdx >= 0 && filenameIdx < cols.length ? cols[filenameIdx]?.trim() : undefined
    const name = nameIdx >= 0 && nameIdx < cols.length ? cols[nameIdx]?.trim() : undefined
    const description = descIdx >= 0 && descIdx < cols.length ? cols[descIdx]?.trim() : undefined
    const price = priceIdx >= 0 && priceIdx < cols.length ? cols[priceIdx]?.trim() : undefined

    // Remove formula injection protection prefix if present (added during export)
    const cleanName = name && /^'[=+\-@]/.test(name) ? name.slice(1) : name
    const cleanDescription = description && /^'[=+\-@]/.test(description) ? description.slice(1) : description

    const file = filename
      ? wizard.uploadedFiles.value.find(f => f.file.name === filename)
      : wizard.uploadedFiles.value[i - 1]

    if (file) {
      if (cleanName)
        file.name = cleanName
      if (cleanDescription)
        file.description = cleanDescription
      if (price !== undefined && price !== '' && Number(price) >= 0)
        file.price = Number(price)
    }
  }
}

function parseJsonContent(content: string) {
  try {
    const data = JSON.parse(content)
    const entries = Array.isArray(data) ? data : Object.values(data)

    entries.forEach((entry: any, index: number) => {
      const file = wizard.uploadedFiles.value[index]
      if (file && entry) {
        if (entry.name)
          file.name = entry.name
        if (entry.description)
          file.description = entry.description
        if (entry.price !== undefined && entry.price !== '' && Number(entry.price) >= 0)
          file.price = Number(entry.price)
      }
    })
  }
  catch {
    errorMessage('Invalid JSON format')
  }
}

function parseTxtContent(content: string) {
  const lines = content.trim().split('\n').filter(l => l.trim())

  lines.forEach((line, index) => {
    const file = wizard.uploadedFiles.value[index]
    if (file) {
      const parts = line.split('::').map(p => p.trim())
      if (parts[0])
        file.name = parts[0]
      if (parts[1])
        file.description = parts[1]
    }
  })
}

const startingNumberHint = computed(() => {
  if (props.existingItemCount > 0) {
    return `Collection has ${props.existingItemCount} items. Numbering starts at #${props.existingItemCount + 1}`
  }
  return ''
})

watch(() => wizard.metadataPath.value, (path) => {
  if (path === MetadataPath.UNIFORM) {
    wizard.applyUniformNames()
  }
})

watch([() => wizard.uniformName.value, () => wizard.startingNumber.value], () => {
  if (wizard.metadataPath.value === MetadataPath.UNIFORM) {
    wizard.applyUniformNames()
  }
})
</script>

<template>
  <div class="max-w-4xl mx-auto p-6 space-y-6">
    <!-- Heading -->
    <div>
      <h2 class="text-lg font-semibold">
        Set Metadata for Your NFTs
      </h2>
      <p class="text-sm text-muted-foreground mt-1">
        Every NFT needs a name. Choose how you'd like to assign names and descriptions to your items.
      </p>
    </div>

    <!-- Path selection -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        class="p-4 border rounded-xl text-left transition-all"
        :class="wizard.metadataPath.value === MetadataPath.TEMPLATE
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border hover:border-primary/50'"
        @click="wizard.metadataPath.value = MetadataPath.TEMPLATE"
      >
        <div class="flex items-center gap-2 mb-1">
          <UIcon name="i-heroicons-table-cells" class="w-5 h-5 text-primary" />
          <h3 class="font-semibold">
            Template File
          </h3>
        </div>
        <p class="text-sm text-muted-foreground">
          Unique name & description per item via CSV spreadsheet
        </p>
      </button>

      <button
        class="p-4 border rounded-xl text-left transition-all"
        :class="wizard.metadataPath.value === MetadataPath.UNIFORM
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border hover:border-primary/50'"
        @click="wizard.metadataPath.value = MetadataPath.UNIFORM"
      >
        <div class="flex items-center gap-2 mb-1">
          <UIcon name="i-heroicons-hashtag" class="w-5 h-5 text-primary" />
          <h3 class="font-semibold">
            Uniform Name + Number
          </h3>
        </div>
        <p class="text-sm text-muted-foreground">
          Sequential numbering, e.g. "Cosmic Explorer #1", "#2"...
        </p>
      </button>
    </div>

    <!-- Template path -->
    <div v-if="wizard.metadataPath.value === MetadataPath.TEMPLATE" class="space-y-5">
      <!-- Collapsible explainer -->
      <details class="group border border-border rounded-lg">
        <summary class="flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm font-medium select-none">
          <UIcon name="i-heroicons-chevron-right" class="w-4 h-4 text-muted-foreground transition-transform group-open:rotate-90" />
          <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-primary" />
          How the CSV template works
        </summary>
        <div class="px-4 pb-4 text-sm text-muted-foreground space-y-2">
          <div class="overflow-x-auto">
            <table class="text-xs border-collapse w-full">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left py-1.5 pr-4 font-semibold text-foreground">
                    Column
                  </th>
                  <th class="text-left py-1.5 pr-4 font-semibold text-foreground">
                    Required
                  </th>
                  <th class="text-left py-1.5 font-semibold text-foreground">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-border/50">
                  <td class="py-1.5 pr-4 font-mono">
                    filename
                  </td>
                  <td class="py-1.5 pr-4 text-muted-foreground">
                    Auto-filled
                  </td>
                  <td class="py-1.5">
                    Matches each row to the uploaded file. Don't change this.
                  </td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="py-1.5 pr-4 font-mono">
                    name
                  </td>
                  <td class="py-1.5 pr-4 text-red-500">
                    Required
                  </td>
                  <td class="py-1.5">
                    Display name of the NFT.
                  </td>
                </tr>
                <tr class="border-b border-border/50">
                  <td class="py-1.5 pr-4 font-mono">
                    description
                  </td>
                  <td class="py-1.5 pr-4 text-muted-foreground">
                    Optional
                  </td>
                  <td class="py-1.5">
                    Short description of the item.
                  </td>
                </tr>
                <tr>
                  <td class="py-1.5 pr-4 font-mono">
                    price
                  </td>
                  <td class="py-1.5 pr-4 text-muted-foreground">
                    Optional
                  </td>
                  <td class="py-1.5">
                    List price in DOT. Empty = no listing.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Open in Google Sheets, Excel, or any text editor. Also accepts JSON and TXT formats.
          </p>
        </div>
      </details>

      <!-- Step 1: Download -->
      <div class="flex items-start gap-3">
        <div
          class="flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-bold transition-colors"
          :class="wizard.templateDownloaded.value
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-primary/10 text-primary'"
        >
          <UIcon v-if="wizard.templateDownloaded.value" name="i-heroicons-check" class="w-3.5 h-3.5" />
          <span v-else>1</span>
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-sm mb-2">
            Download template
          </h4>

          <!-- Downloaded state -->
          <div v-if="wizard.templateDownloaded.value" class="flex items-center gap-3">
            <div class="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
              <span class="font-mono text-xs">template.csv</span>
            </div>
            <UButton
              variant="link"
              size="xs"
              icon="i-heroicons-arrow-down-tray"
              @click="handleDownloadTemplate"
            >
              Download again
            </UButton>
          </div>

          <!-- Default state -->
          <UButton
            v-else
            variant="outline"
            size="sm"
            icon="i-heroicons-arrow-down-tray"
            @click="handleDownloadTemplate"
          >
            Download CSV
          </UButton>
        </div>
      </div>

      <!-- Step 2: Upload -->
      <div class="flex items-start gap-3">
        <div
          class="flex items-center justify-center w-7 h-7 rounded-full shrink-0 text-xs font-bold transition-colors"
          :class="wizard.templateUploaded.value
            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
            : 'bg-primary/10 text-primary'"
        >
          <UIcon v-if="wizard.templateUploaded.value" name="i-heroicons-check" class="w-3.5 h-3.5" />
          <span v-else>2</span>
        </div>
        <div class="flex-1">
          <h4 class="font-medium text-sm mb-2">
            Upload filled template
            <span class="text-xs text-muted-foreground font-normal ml-1">CSV, JSON, or TXT</span>
          </h4>

          <input
            ref="templateFileInput"
            type="file"
            accept=".csv,.json,.txt"
            class="hidden"
            @change="handleTemplateUpload"
          >

          <!-- Uploaded state: file card -->
          <div v-if="wizard.templateUploaded.value">
            <div class="flex items-center gap-3 p-2.5 border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <UIcon name="i-heroicons-document-check" class="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate font-mono">
                  {{ wizard.templateFileName.value }}
                </p>
                <p class="text-xs text-muted-foreground font-mono">
                  {{ formatFileSize(wizard.templateFileSize.value) }}
                </p>
              </div>
              <div class="flex items-center gap-1">
                <UButton
                  variant="ghost"
                  size="xs"
                  icon="i-heroicons-arrow-path"
                  @click="templateFileInput?.click()"
                >
                  Replace
                </UButton>
                <UButton
                  variant="ghost"
                  size="xs"
                  color="error"
                  icon="i-heroicons-x-mark"
                  @click="handleRemoveTemplate"
                />
              </div>
            </div>
          </div>

          <!-- Default state -->
          <UButton
            v-else
            variant="outline"
            size="sm"
            icon="i-heroicons-arrow-up-tray"
            @click="templateFileInput?.click()"
          >
            Upload Template
          </UButton>
        </div>
      </div>

      <MetadataPreviewTable
        :files="wizard.uploadedFiles.value"
        @file-click="openFilePanel($event)"
      />
    </div>

    <!-- Uniform path -->
    <div v-else class="space-y-5">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="text-sm font-medium block mb-1">Base Name</label>
          <UInput
            v-model="wizard.uniformName.value"
            placeholder="e.g., Cosmic Explorer"
            size="lg"
          />
        </div>
        <div>
          <label class="text-sm font-medium block mb-1">Starting Number</label>
          <UInput
            v-model.number="wizard.startingNumber.value"
            type="number"
            :min="1"
            size="lg"
          />
          <p v-if="startingNumberHint" class="text-xs text-amber-600 dark:text-amber-400 mt-1">
            {{ startingNumberHint }}
          </p>
        </div>
      </div>

      <!-- Preview grid -->
      <div v-if="wizard.uniformName.value" class="space-y-2">
        <p class="text-sm font-medium">
          Preview
        </p>
        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div
            v-for="file in wizard.uploadedFiles.value.slice(0, 12)"
            :key="file.id"
            class="aspect-square rounded-lg overflow-hidden border border-border relative cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
            @click="openFilePanel(file)"
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
            <div class="absolute bottom-0 left-0 right-0 bg-black/70 px-2 py-1">
              <p class="text-white text-[10px] truncate">
                {{ file.name }}
              </p>
            </div>
          </div>
        </div>
        <p v-if="wizard.uploadedFiles.value.length > 12" class="text-xs text-muted-foreground">
          ...and {{ wizard.uploadedFiles.value.length - 12 }} more
        </p>
      </div>

      <MetadataPreviewTable
        :files="wizard.uploadedFiles.value"
        @file-click="openFilePanel($event)"
      />
    </div>

    <!-- Shared description -->
    <div class="space-y-2">
      <label class="text-sm font-medium block">Shared Description</label>
      <UTextarea
        v-model="wizard.sharedDescription.value"
        placeholder="Applies to all items without an individual description"
        :rows="2"
        class="w-full"
      />

      <div class="flex items-center gap-3">
        <UButton
          size="sm"
          :disabled="!wizard.sharedDescription.value.trim() || sharedDescriptionApplied"
          icon="i-heroicons-check"
          @click="handleApplySharedDescription"
        >
          Apply to All
        </UButton>

        <div v-if="sharedDescriptionApplied" class="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
          <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
          <span>Applied to {{ sharedDescriptionAppliedCount }} item{{ sharedDescriptionAppliedCount !== 1 ? 's' : '' }}</span>
        </div>
      </div>
    </div>

    <MassMintItemPanel
      ref="itemPanelRef"
      :file="editingFile"
      @save="handlePanelSave"
      @close="closeFilePanel"
    />
  </div>
</template>
