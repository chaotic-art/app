<script lang="ts" setup>
import { watchDebounced } from '@vueuse/core'
import { useCollectionForm } from '~/composables/create/useCollectionForm'

definePageMeta({
  title: 'Create Collection',
  layout: 'default',
})

// Use the collection form composable
const {
  state,
  logoFile,
  bannerFile,
  blockchains,
  validate,
  onSubmit,
  isWalletConnected,
  isEstimatingFee,
  handleCollectionOperation,
  balance,
  isFetchingBalance,
} = useCollectionForm()

const { $i18n } = useNuxtApp()

// Computed properties for cleaner logic
const isLoading = computed(() => isEstimatingFee.value || isFetchingBalance.value)
const hasInsufficientFunds = computed(() => balance.total !== 0n && balance.userBalance < balance.total)
const isReady = computed(() => balance.total !== 0n && !isLoading.value && !hasInsufficientFunds.value)

const isSubmitDisabled = computed(() => {
  return !isWalletConnected.value || hasInsufficientFunds.value || isLoading.value
})

const submitButtonText = computed(() => {
  if (!isWalletConnected.value)
    return 'Connect Wallet to Create Collection'
  if (isFetchingBalance.value)
    return $i18n.t('balance.checking')
  if (isEstimatingFee.value)
    return 'Calculating...'
  if (hasInsufficientFunds.value)
    return 'Insufficient Funds'
  return 'Create Collection'
})

// Auto-estimate fees when form data changes (debounced to prevent excessive API calls)
watchDebounced(
  [isWalletConnected, logoFile, () => state.name, () => state.description, () => state.royalties, () => state.maxNfts, () => state.maxNftsNumber, () => state.blockchain],
  ([connected, file, name, description, _royalties, _maxNfts, _maxNftsNumber]) => {
    if (connected && file && name && description) {
      handleCollectionOperation(state, 'estimate')
    }
  },
  { debounce: 1000, maxWait: 5000 },
)
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
    <UCard class="mb-8 relative">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Collection Information
        </h2>
      </template>

      <UForm :state="state" :validate="validate" class="space-y-6" @submit="onSubmit">
        <!-- Visual Assets -->
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Visual Assets
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Logo Upload -->
            <div class="w-full">
              <UFormField
                name="logo"
                label="Collection Logo"
                required
                help="Recommended: 400x400px, Max 5MB"
              >
                <UFileUpload
                  v-model="logoFile"
                  accept="image/*"
                  icon="i-heroicons-photo"
                  label="Drop logo here"
                  description="PNG, JPG, GIF or SVG (max. 5MB)"
                  color="neutral"
                  class="w-full aspect-square"
                />
              </UFormField>
            </div>

            <!-- Banner Upload -->
            <div class="w-full">
              <UFormField
                name="banner"
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
                  class="w-full aspect-square"
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
                name="name"
                label="Collection Name"
                required
                help="This will be the name of your collection"
              >
                <UInput
                  v-model="state.name"
                  placeholder="My Awesome Collection"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="w-full">
              <UFormField
                name="blockchain"
                label="Blockchain"
                required
                help="Choose the blockchain network for your collection"
              >
                <USelectMenu
                  v-model="state.blockchain"
                  :items="blockchains"
                  value-key="value"
                  placeholder="Select a blockchain"
                  class="w-full"
                />
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="w-full">
          <UFormField
            name="description"
            label="Description"
            required
            help="Describe your collection and what makes it unique"
          >
            <UTextarea
              v-model="state.description"
              placeholder="Tell people about your collection..."
              :rows="4"
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
                name="royalties"
                label="Creator Royalties (%)"
                help="Percentage you'll earn from secondary sales"
              >
                <UInput
                  v-model.number="state.royalties"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  placeholder="2.5"
                  class="w-full"
                />
              </UFormField>
            </div>

            <div class="w-full">
              <UFormField
                name="maxNfts"
                label="Maximum NFTs"
                help="Set the maximum number of NFTs in this collection"
              >
                <div class="space-y-3">
                  <USelectMenu
                    v-model="state.maxNfts"
                    :items="[
                      { label: 'Unlimited', value: 'unlimited' },
                      { label: 'Limited Number', value: 'limited' },
                    ]"
                    value-key="value"
                    placeholder="Select limit type"
                    class="w-full"
                  />

                  <UFormField
                    v-if="state.maxNfts === 'limited'"
                    name="maxNftsNumber"
                  >
                    <UInput
                      v-model.number="state.maxNftsNumber"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="1000"
                      class="w-full"
                    />
                  </UFormField>
                </div>
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Form Footer -->
        <div class="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <!-- Simple Fee & Balance -->
          <div class="flex items-center justify-between text-sm">
            <div class="flex flex-col font-mono">
              <span class="text-gray-600 dark:text-gray-400 flex gap-2">
                <span class="w-22">Est. Cost:</span>
                <USkeleton v-if="isEstimatingFee" class="w-22 h-4" />
                <span v-else-if="balance.total !== 0n" class="font-medium text-gray-900 dark:text-white">
                  {{ balance.totalFormatted }}
                </span>
                <span v-else class="text-gray-600 dark:text-gray-400">
                  ---
                </span>
              </span>

              <span class="text-gray-600 dark:text-gray-400 flex gap-2">
                <span class="w-22">Balance:</span>
                <USkeleton v-if="isFetchingBalance" class="w-22 h-4" />
                <span v-else class="font-medium text-gray-900 dark:text-white">
                  {{ balance.userBalanceFormatted }}
                </span>
              </span>
            </div>

            <div v-if="hasInsufficientFunds && !isLoading" class="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4" />
              <span class="text-xs font-medium">Insufficient</span>
            </div>
            <div v-else-if="isReady" class="flex items-center gap-1 text-green-600 dark:text-green-400">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
              <span class="text-xs font-medium">Ready</span>
            </div>
          </div>

          <!-- Submit Button -->
          <UButton
            type="submit"
            size="xl"
            class="w-full"
            :disabled="isSubmitDisabled"
            :variant="isSubmitDisabled ? 'soft' : 'solid'"
          >
            {{ submitButtonText }}
          </UButton>
        </div>
      </UForm>
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
