<script setup lang="ts">
import type { OnchainCollection } from '~/services/oda'
import { useCollectionEditForm } from '~/composables/create/useCollectionEditForm'
import { sanitizeIpfsUrl, toOriginalContentUrl } from '~/utils/ipfs'

const props = defineProps<{
  collectionId: string
  collection: OnchainCollection | null | undefined
}>()

const {
  state,
  logoFile,
  bannerFile,
  isWalletConnected,
  isInitialized,
  validate,
  onSubmit,
} = useCollectionEditForm(
  toRef(props, 'collectionId'),
  toRef(props, 'collection'),
)

const logoPreviewUrl = computed(() => {
  if (logoFile.value) {
    return URL.createObjectURL(logoFile.value)
  }
  const raw = props.collection?.metadata?.image
  return raw ? toOriginalContentUrl(sanitizeIpfsUrl(raw)) : ''
})

const bannerPreviewUrl = computed(() => {
  if (bannerFile.value) {
    return URL.createObjectURL(bannerFile.value)
  }
  const raw = props.collection?.metadata?.banner || props.collection?.metadata?.image
  return raw ? toOriginalContentUrl(sanitizeIpfsUrl(raw)) : ''
})

const submitButtonText = computed(() => {
  if (!isWalletConnected.value) {
    return 'Connect Wallet to Update'
  }
  return 'Update Collection'
})
</script>

<template>
  <div class="">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Collection Details
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Edit your collection information and visuals. Changes are stored on-chain.
      </p>
    </div>

    <UCard class="relative">
      <template #header>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          Collection Info
        </h2>
      </template>

      <div v-if="!collection && !isInitialized" class="flex justify-center py-12">
        <USkeleton class="h-64 w-full rounded-lg" />
      </div>

      <UForm
        v-else
        :state="state"
        :validate="(formState) => validate(formState)"
        class="space-y-6"
        @submit="onSubmit"
      >
        <UFormField
          name="name"
          label="Name"
          required
          help="This will be the name of your collection"
        >
          <UInput
            v-model="state.name"
            placeholder="My Awesome Collection"
            class="w-full"
          />
        </UFormField>

        <UFormField
          name="description"
          label="Description"
          required
          help="Describe your collection and what makes it unique"
        >
          <div class="space-y-1">
            <UTextarea
              v-model="state.description"
              placeholder="Tell people about your collection..."
              :rows="4"
              maxlength="500"
              class="w-full"
            />
            <div class="flex items-center justify-between gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div class="flex items-center gap-1.5 text-xs">
                <UIcon name="i-heroicons-document-text" class="w-3.5 h-3.5 shrink-0" />
                Supports markdown formatting.
              </div>
              <div class="text-xs">
                {{ state.description.length }} / 500
              </div>
            </div>
          </div>
        </UFormField>

        <UFormField
          name="logo"
          label="Logo"
          help="Recommended: 400x400px, max 5MB. Leave empty to keep current."
        >
          <UFileUpload
            v-slot="{ open }"
            v-model="logoFile"
            accept="image/*"
            native
            class="block"
          >
            <button
              type="button"
              class="group relative w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-muted border border-default flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              @click="() => open()"
            >
              <img
                v-if="logoPreviewUrl"
                :src="logoPreviewUrl"
                alt="Collection logo"
                class="w-full h-full object-cover"
              >
              <div
                v-if="logoPreviewUrl"
                class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              >
                <UIcon name="i-heroicons-arrow-path" class="w-7 h-7 text-white" />
              </div>
              <div
                v-if="!logoPreviewUrl"
                class="flex flex-col items-center gap-1 text-gray-400"
              >
                <UIcon name="i-heroicons-arrow-up-tray" class="w-6 h-6" />
                <span class="text-xs">Upload</span>
              </div>
            </button>
          </UFileUpload>
        </UFormField>

        <UFormField
          class="max-w-4xl"
          name="banner"
          label="Banner"
          help="Recommended: 1200x400px, max 10MB. Leave empty to keep current."
        >
          <UFileUpload
            v-slot="{ open }"
            v-model="bannerFile"
            accept="image/*"
            native
            class="block w-full"
          >
            <button
              type="button"
              class="group relative w-full aspect-3/1 min-h-28 rounded-lg overflow-hidden bg-muted border border-default flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              @click="() => open()"
            >
              <img
                v-if="bannerPreviewUrl"
                :src="bannerPreviewUrl"
                alt="Collection banner"
                class="w-full h-full object-cover"
              >
              <div
                v-if="bannerPreviewUrl"
                class="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              >
                <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 text-white" />
              </div>
              <div
                v-if="!bannerPreviewUrl"
                class="flex flex-col items-center gap-2 text-gray-400"
              >
                <UIcon name="i-heroicons-arrow-up-tray" class="w-10 h-10" />
                <span class="text-sm">Upload banner</span>
              </div>
            </button>
          </UFileUpload>
        </UFormField>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            Royalties
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UFormField
              name="royalties"
              label="Creator Royalties (%)"
              help="Percentage you earn from secondary sales"
            >
              <UInput
                v-model.number="state.royalties"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="0"
                class="w-full"
              />
            </UFormField>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <UButton
            type="submit"
            size="xl"
            :disabled="!isWalletConnected"
            :variant="isWalletConnected ? 'solid' : 'soft'"
          >
            {{ submitButtonText }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
