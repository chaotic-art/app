<script lang="ts" setup>
import { useNftForm } from '~/composables/form/useNftForm'
import { useWalletStore } from '~/stores/wallet'
import { sanitizeIpfsUrl } from '~/utils/ipfs'

definePageMeta({
  title: 'Create NFT',
  layout: 'default',
})

// Wallet connection check
const walletStore = useWalletStore()
const { getConnectedSubAccount } = storeToRefs(walletStore)
const isWalletConnected = computed(() => Boolean(getConnectedSubAccount.value))

// Use the NFT form composable
const {
  state,
  mediaFile,
  blockchains,
  collections,
  collectionsLoading,
  selectedCurrency,
  selectedCollection,
  validate,
  onSubmit,
  addProperty,
  removeProperty,
  isLoading,
} = useNftForm()

// Router for navigation
const router = useRouter()
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
    <UForm
      :state="state"
      :validate="validate"
      class="mb-8"
      @submit="onSubmit"
    >
      <UCard>
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
                name="media"
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
                  :disabled="isLoading"
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
                  name="name"
                  label="NFT Name"
                  required
                  help="Choose a name for your NFT"
                >
                  <UInput
                    v-model="state.name"
                    placeholder="My Awesome NFT"
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
                  help="Choose the blockchain network for your NFT"
                >
                  <USelect
                    v-model="state.blockchain"
                    :items="blockchains"
                    placeholder="Select a blockchain"
                    :disabled="isLoading"
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
              help="Describe your NFT and what makes it special"
            >
              <UTextarea
                v-model="state.description"
                placeholder="Tell people about your NFT..."
                :rows="4"
                :disabled="isLoading"
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
                  name="collection"
                  label="Collection"
                  required
                  help="Select the collection for this NFT"
                >
                  <USelectMenu
                    v-model="state.collection"
                    :items="collections"
                    value-key="value"
                    placeholder="Select a collection"
                    :search-input="{ placeholder: 'Search collections...' }"
                    :disabled="isLoading || collectionsLoading"
                    :loading="collectionsLoading"
                    class="w-full"
                    :ui="{
                      item: 'font-mono',
                    }"
                  />
                </UFormField>
              </div>

              <div class="w-full">
                <UFormField
                  name="supply"
                  label="Supply"
                  help="Number of identical copies to mint (1 for unique)"
                >
                  <UInput
                    v-model.number="state.supply"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    :disabled="isLoading"
                    class="w-full"
                  />
                </UFormField>
              </div>
            </div>

            <!-- Selected Collection Info -->
            <div v-if="selectedCollection" class="space-y-3">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                Selected Collection
              </h4>

              <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div class="flex items-center gap-3">
                  <div class="size-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <img
                      v-if="selectedCollection.image"
                      :src="sanitizeIpfsUrl(selectedCollection.image)"
                      :alt="selectedCollection.name"
                      class="w-full h-full object-cover"
                    >
                    <div v-else class="w-full h-full flex items-center justify-center">
                      <UIcon name="i-heroicons-photo" class="text-sm text-gray-400" />
                    </div>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <h5 class="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {{ selectedCollection.name }}
                      </h5>
                      <span class="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded font-mono flex-shrink-0">
                        #{{ selectedCollection.value }}
                      </span>
                    </div>
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ selectedCollection.description }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Auto Numbering (only show when supply > 1) -->
            <div v-if="state.supply > 1" class="space-y-3">
              <div class="flex items-center gap-3">
                <UCheckbox
                  v-model="state.autoNumbering"
                  :disabled="isLoading"
                />
                <div>
                  <label class="text-sm font-medium text-gray-900 dark:text-white">
                    Automatically number NFTs
                  </label>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    Add numbering to NFT names (e.g., "{{ state.name || 'My NFT' }} #1", "{{ state.name || 'My NFT' }} #2")
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- List for Sale -->
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <UCheckbox
                v-model="state.listDirectly"
                :disabled="isLoading"
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

            <div v-if="state.listDirectly" class="space-y-4 pl-7">
              <!-- Price -->
              <div class="w-full max-w-md">
                <UFormField
                  name="price"
                  label="Price"
                  required
                  :help="`Set the fixed price for your NFT in ${selectedCurrency}`"
                >
                  <div class="relative">
                    <UInput
                      v-model.number="state.price"
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder="1.5"
                      :disabled="isLoading"
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
                :disabled="isLoading"
                @click="addProperty"
              >
                Add Property
              </UButton>
            </div>

            <div class="space-y-3">
              <div
                v-for="(property, index) in state.properties"
                :key="index"
                class="flex items-end gap-3"
              >
                <div class="flex-1">
                  <UFormField :label="index === 0 ? 'Trait' : ''" :name="`properties.${index}.trait`">
                    <UInput
                      v-model="property.trait"
                      placeholder="e.g., Color, Rarity, Style"
                      :disabled="isLoading"
                      class="w-full"
                    />
                  </UFormField>
                </div>
                <div class="flex-1">
                  <UFormField :label="index === 0 ? 'Value' : ''" :name="`properties.${index}.value`">
                    <UInput
                      v-model="property.value"
                      placeholder="e.g., Blue, Rare, Abstract"
                      :disabled="isLoading"
                      class="w-full"
                    />
                  </UFormField>
                </div>
                <UButton
                  v-if="state.properties.length > 1"
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  icon="i-heroicons-trash"
                  :disabled="isLoading"
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
              {{ !isWalletConnected ? 'Connect Wallet to Create NFT' : 'Create NFT' }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UForm>

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
