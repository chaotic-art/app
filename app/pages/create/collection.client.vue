<script lang="ts" setup>
import { useCollectionForm } from '~/composables/form/useCollectionForm'
import { useWalletStore } from '~/stores/wallet'

definePageMeta({
  title: 'Create Collection',
  layout: 'default',
})

// Wallet connection check
const walletStore = useWalletStore()
const { getConnectedSubAccount } = storeToRefs(walletStore)
const isWalletConnected = computed(() => Boolean(getConnectedSubAccount.value))

// Use the collection form composable
const {
  state,
  logoFile,
  bannerFile,
  blockchains,
  validate,
  onSubmit,
  isLoading,
} = useCollectionForm()

// Router
const router = useRouter()
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
      <!-- Loading Overlay -->
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg"
      >
        <div class="flex flex-col items-center gap-3">
          <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-600 dark:text-gray-400 animate-spin" />
          <p class="text-sm font-medium text-gray-600 dark:text-gray-400">
            Creating collection...
          </p>
        </div>
      </div>

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
                  :disabled="isLoading"
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
                  :disabled="isLoading"
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
                  :disabled="isLoading"
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
                <UTooltip text="Currently only Asset Hub Polkadot is supported">
                  <USelectMenu
                    v-model="state.blockchain"
                    :items="blockchains"
                    value-key="value"
                    placeholder="Select a blockchain"
                    :disabled="true"
                    class="w-full"
                  />
                </UTooltip>
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
              :disabled="isLoading"
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
                  :disabled="isLoading"
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
                    :disabled="isLoading"
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
                      :disabled="isLoading"
                      class="w-full"
                    />
                  </UFormField>
                </div>
              </UFormField>
            </div>
          </div>
        </div>

        <!-- Form Footer -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <UButton
            variant="ghost"
            color="neutral"
            :disabled="isLoading"
            @click="router.back()"
          >
            Cancel
          </UButton>

          <UButton
            type="submit"
            :loading="isLoading"
            :disabled="isLoading || !isWalletConnected"
          >
            {{ !isWalletConnected ? 'Connect Wallet to Create Collection' : 'Create Collection' }}
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
