<script lang="ts" setup>
definePageMeta({
  title: 'Create Collection',
  layout: 'default',
})

// Form state
const form = ref({
  name: '',
  description: '',
  blockchain: '',
  royalties: 0,
  maxNfts: 'unlimited',
  maxNftsNumber: 1000,
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

// File upload states
const logoFile = ref<File | null>(null)
const bannerFile = ref<File | null>(null)

// Loading state
const isSubmitting = ref(false)

// Router
const router = useRouter()

// Validation
function validateForm() {
  const errors: string[] = []

  if (!form.value.name.trim())
    errors.push('Collection name is required')
  if (!form.value.description.trim())
    errors.push('Description is required')
  if (!form.value.blockchain.trim())
    errors.push('Blockchain selection is required')
  if (form.value.royalties < 0) {
    errors.push('Royalties must be 0% or higher')
  }
  if (form.value.maxNfts === 'limited' && (!form.value.maxNftsNumber || form.value.maxNftsNumber < 1)) {
    errors.push('Maximum NFTs must be at least 1 when limited')
  }

  // File validation
  if (logoFile.value) {
    const maxLogoSize = 5 * 1024 * 1024 // 5MB
    if (logoFile.value.size > maxLogoSize) {
      errors.push('Logo file size must be less than 5MB')
    }
    if (!logoFile.value.type.startsWith('image/')) {
      errors.push('Logo must be an image file')
    }
  }

  if (bannerFile.value) {
    const maxBannerSize = 10 * 1024 * 1024 // 10MB
    if (bannerFile.value.size > maxBannerSize) {
      errors.push('Banner file size must be less than 10MB')
    }
    if (!bannerFile.value.type.startsWith('image/')) {
      errors.push('Banner must be an image file')
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
    console.error('Creating collection with data:', {
      ...form.value,
      logoFile: logoFile.value,
      bannerFile: bannerFile.value,
    })

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Navigate back with success
    await navigateTo('/')
  }
  catch (error) {
    console.error('Error creating collection:', error)
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
        Create Collection
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Create a collection to group your NFTs together and make them discoverable
      </p>
    </div>

    <!-- Form -->
    <UCard class="mb-8">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Collection Information
        </h2>
      </template>

      <div class="space-y-6">
        <!-- Visual Assets -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Visual Assets
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Logo Upload -->
            <div class="w-full">
              <UFormField
                label="Collection Logo"
                help="Recommended: 400x400px, Max 5MB"
              >
                <UFileUpload
                  v-model="logoFile"
                  accept="image/*"
                  icon="i-heroicons-photo"
                  label="Drop logo here"
                  description="PNG, JPG, GIF or SVG (max. 5MB)"
                  color="neutral"
                  :disabled="isSubmitting"
                  class="w-full min-h-32"
                />
              </UFormField>
            </div>

            <!-- Banner Upload -->
            <div class="w-full">
              <UFormField
                label="Collection Banner"
                help="Recommended: 1200x400px, Max 10MB"
              >
                <UFileUpload
                  v-model="bannerFile"
                  accept="image/*"
                  icon="i-heroicons-photo"
                  label="Drop banner here"
                  description="PNG, JPG, GIF or SVG (max. 10MB)"
                  color="neutral"
                  :disabled="isSubmitting"
                  class="w-full min-h-32"
                />
              </UFormField>
            </div>
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
                label="Collection Name"
                required
                help="This will be the name of your collection"
              >
                <UInput
                  v-model="form.name"
                  placeholder="My Awesome Collection"
                  :disabled="isSubmitting"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="w-full">
              <UFormField
                label="Blockchain"
                required
                help="Choose the blockchain network for your collection"
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
            help="Describe your collection and what makes it unique"
          >
            <UTextarea
              v-model="form.description"
              placeholder="Tell people about your collection..."
              :rows="4"
              :disabled="isSubmitting"
              class="w-full"
            />
          </UFormField>
        </div>

        <!-- Blockchain Settings -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Blockchain Settings
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="w-full">
              <UFormField
                label="Creator Royalties (%)"
                help="Percentage you'll earn from secondary sales"
              >
                <UInput
                  v-model.number="form.royalties"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="2.5"
                  :disabled="isSubmitting"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="w-full">
              <UFormField
                label="Maximum NFTs"
                help="Set the maximum number of NFTs in this collection"
              >
                <div class="space-y-3">
                  <USelectMenu
                    v-model="form.maxNfts"
                    :items="[
                      { label: 'Unlimited', value: 'unlimited' },
                      { label: 'Limited Number', value: 'limited' },
                    ]"
                    value-key="value"
                    placeholder="Select limit type"
                    :disabled="isSubmitting"
                    class="w-full"
                  />

                  <UInput
                    v-if="form.maxNfts === 'limited'"
                    v-model.number="form.maxNftsNumber"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1000"
                    :disabled="isSubmitting"
                    class="w-full"
                  />
                </div>
              </UFormField>
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
            Create Collection
          </UButton>
        </div>
      </template>
    </UCard>

    <!-- Help Tips -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Tips for Creating a Great Collection
        </h3>
      </template>

      <div class="space-y-4 text-sm text-gray-600 dark:text-gray-400">
        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              Choose a memorable name
            </p>
            <p>Pick a name that's easy to remember and represents your collection well</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-photo" class="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              High-quality visuals
            </p>
            <p>Use high-resolution images for your logo and banner to make a great first impression</p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
          <div>
            <p class="font-medium text-gray-900 dark:text-white">
              Clear description
            </p>
            <p>Explain what your collection is about and what makes it unique or valuable</p>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>
