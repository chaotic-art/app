<script lang="ts" setup>
definePageMeta({
  title: 'Create NFT',
  layout: 'default',
})

// Form state
const form = ref({
  name: '',
  description: '',
  collection: '',
  blockchain: '',
  supply: 1,
  autoNumbering: false,
  properties: [{ trait: '', value: '' }],
  listDirectly: false,
  price: 0,
})

// Blockchains for select
const blockchains = [
  { label: 'Polkadot', value: 'polkadot' },
  { label: 'Kusama', value: 'kusama' },
  { label: 'Asset Hub Polkadot', value: 'ahp' },
  { label: 'Asset Hub Kusama', value: 'ahk' },
  { label: 'Ethereum', value: 'ethereum' },
  { label: 'Base', value: 'base' },
]

// Mock collections (in real app, this would be fetched from API)
const collections = [
  { label: 'My Art Collection', value: 'art-collection-1' },
  { label: 'Digital Portraits', value: 'portraits-2' },
  { label: 'Abstract Series', value: 'abstract-3' },
  { label: 'Create New Collection', value: 'new' },
]

// Currency mapping based on blockchain
const blockchainCurrencies: Record<string, string> = {
  polkadot: 'DOT',
  kusama: 'KSM',
  ethereum: 'ETH',
  base: 'ETH',
}

// Get currency based on selected blockchain
const selectedCurrency = computed(() => {
  return blockchainCurrencies[form.value.blockchain] || 'DOT'
})

// File upload state
const mediaFile = ref<File | null>(null)

// Loading state
const isSubmitting = ref(false)

// Router
const router = useRouter()

// Add new property
function addProperty() {
  form.value.properties.push({ trait: '', value: '' })
}

// Remove property
function removeProperty(index: number) {
  if (form.value.properties.length > 1) {
    form.value.properties.splice(index, 1)
  }
}

// Validation
function validateForm() {
  const errors: string[] = []

  if (!form.value.name.trim())
    errors.push('NFT name is required')
  if (!form.value.description.trim())
    errors.push('Description is required')
  if (!form.value.blockchain.trim())
    errors.push('Blockchain selection is required')
  if (form.value.supply < 1) {
    errors.push('Supply must be at least 1')
  }

  // File validation
  if (!mediaFile.value) {
    errors.push('NFT media file is required')
  }
  else {
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (mediaFile.value.size > maxSize) {
      errors.push('Media file size must be less than 50MB')
    }
  }

  // Properties validation (only if filled)
  form.value.properties.forEach((prop, index) => {
    if (prop.trait.trim() && !prop.value.trim()) {
      errors.push(`Property ${index + 1}: Value is required when trait is specified`)
    }
    if (!prop.trait.trim() && prop.value.trim()) {
      errors.push(`Property ${index + 1}: Trait name is required when value is specified`)
    }
  })

  // Listing validation
  if (form.value.listDirectly) {
    if (form.value.price <= 0) {
      errors.push('Price must be greater than 0 when listing for sale')
    }
    if (!form.value.blockchain.trim()) {
      errors.push('Blockchain selection is required when listing for sale')
    }
  }

  return errors
}

// Submit handler
async function handleSubmit() {
  const errors = validateForm()

  if (errors.length > 0) {
    console.error('Validation errors:', errors)
    return
  }

  isSubmitting.value = true

  try {
    // Filter out empty properties
    const validProperties = form.value.properties.filter(
      prop => prop.trait.trim() && prop.value.trim(),
    )

    // Prepare NFT data
    const nftData: any = {
      ...form.value,
      properties: validProperties,
      mediaFile: mediaFile.value,
    }

    // If auto numbering is enabled, show how names will be generated
    if (form.value.supply > 1 && form.value.autoNumbering) {
      nftData.generatedNames = Array.from({ length: form.value.supply }, (_, i) =>
        `${form.value.name} #${i + 1}`)
    }

    console.error('Creating NFT with data:', nftData)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Navigate back with success
    await navigateTo('/')
  }
  catch (error) {
    console.error('Error creating NFT:', error)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Create NFT
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Create a unique digital asset or artwork as an NFT
      </p>
    </div>

    <!-- Form -->
    <UCard class="mb-8">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          NFT Information
        </h2>
      </template>

      <div class="space-y-6">
        <!-- Media Upload -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Media Asset
          </h3>

          <div class="w-full">
            <UFormField
              label="NFT Media"
              required
              help="Upload your NFT image, video, audio, or 3D model"
            >
              <UFileUpload
                v-model="mediaFile"
                accept="image/*,video/*,audio/*,.glb,.gltf"
                icon="i-heroicons-photo"
                label="Drop your media here"
                description="PNG, JPG, GIF, SVG, MP4, MP3, GLB, GLTF (max. 50MB)"
                color="neutral"
                :disabled="isSubmitting"
                class="w-full min-h-40"
              />
            </UFormField>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Basic Information
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="w-full">
              <UFormField
                label="NFT Name"
                required
                help="Choose a name for your NFT"
              >
                <UInput
                  v-model="form.name"
                  placeholder="My Awesome NFT"
                  :disabled="isSubmitting"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="w-full">
              <UFormField
                label="Blockchain"
                required
                help="Choose the blockchain network for your NFT"
              >
                <USelectMenu
                  v-model="form.blockchain"
                  :items="blockchains"
                  value-key="value"
                  placeholder="Select a blockchain"
                  :disabled="isSubmitting"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="w-full">
          <UFormField
            label="Description"
            required
            help="Describe your NFT and what makes it special"
          >
            <UTextarea
              v-model="form.description"
              placeholder="Tell people about your NFT..."
              :rows="4"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Collection & Supply -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Collection & Supply
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="w-full">
              <UFormField
                label="Collection"
                help="Add this NFT to an existing collection (optional)"
              >
                <USelectMenu
                  v-model="form.collection"
                  :items="collections"
                  value-key="value"
                  placeholder="Select a collection"
                  :disabled="isSubmitting"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="w-full">
              <UFormField
                label="Supply"
                help="Number of identical copies to mint (1 for unique)"
              >
                <UInput
                  v-model.number="form.supply"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="1"
                  :disabled="isSubmitting"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>

          <!-- Auto Numbering (only show when supply > 1) -->
          <div v-if="form.supply > 1" class="space-y-3">
            <div class="flex items-center gap-3">
              <UCheckbox
                v-model="form.autoNumbering"
                :disabled="isSubmitting"
              />
              <div>
                <label class="text-sm font-medium text-gray-900 dark:text-white">
                  Automatically number NFTs
                </label>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Add numbering to NFT names (e.g., "{{ form.name || 'My NFT' }} #1", "{{ form.name || 'My NFT' }} #2")
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- List for Sale -->
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <UCheckbox
              v-model="form.listDirectly"
              :disabled="isSubmitting"
            />
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                List for sale immediately
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Put your NFT on the marketplace right after creation
              </p>
            </div>
          </div>

          <div v-if="form.listDirectly" class="space-y-4 pl-7">
            <!-- Price -->
            <div class="w-full max-w-md">
              <UFormField
                label="Price"
                required
                :help="`Set the fixed price for your NFT in ${selectedCurrency}`"
              >
                <div class="relative">
                  <UInput
                    v-model.number="form.price"
                    type="number"
                    min="0"
                    step="0.001"
                    placeholder="1.5"
                    :disabled="isSubmitting"
                    class="w-full pr-16"
                  />
                  <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {{ selectedCurrency }}
                  </div>
                </div>
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Properties/Traits -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              Properties (Optional)
            </h3>
            <UButton
              variant="ghost"
              size="sm"
              icon="i-heroicons-plus"
              :disabled="isSubmitting"
              @click="addProperty"
            >
              Add Property
            </UButton>
          </div>

          <div class="space-y-3">
            <div
              v-for="(property, index) in form.properties"
              :key="index"
              class="flex items-end gap-3"
            >
              <div class="flex-1">
                <UFormField :label="index === 0 ? 'Trait' : ''">
                  <UInput
                    v-model="property.trait"
                    placeholder="e.g., Color, Rarity, Style"
                    :disabled="isSubmitting"
                    class="w-full"
                  />
                </UFormField>
              </div>
              <div class="flex-1">
                <UFormField :label="index === 0 ? 'Value' : ''">
                  <UInput
                    v-model="property.value"
                    placeholder="e.g., Blue, Rare, Abstract"
                    :disabled="isSubmitting"
                    class="w-full"
                  />
                </UFormField>
              </div>
              <UButton
                v-if="form.properties.length > 1"
                variant="ghost"
                color="neutral"
                size="sm"
                icon="i-heroicons-trash"
                :disabled="isSubmitting"
                class="mb-0"
                @click="removeProperty(index)"
              />
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-between">
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="isSubmitting"
            @click="router.back()"
          >
            Cancel
          </UButton>

          <UButton
            :loading="isSubmitting"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            Create NFT
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Help Tips -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Tips for Creating Great NFTs
        </h3>
      </template>

      <div class="space-y-4 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-photo" class="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              High-quality media
            </p>
            <p>Use high-resolution images or quality media files for the best presentation</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              Compelling description
            </p>
            <p>Write a clear description that tells the story behind your NFT</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-tag" class="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              Meaningful properties
            </p>
            <p>Add relevant traits and properties that make your NFT unique and discoverable</p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
