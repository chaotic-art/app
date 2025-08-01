<script setup lang="ts">
import type { ProfileFormData } from '@/components/profile/types'
import type { Profile } from '@/services/profile'
import { useNow } from '@vueuse/core'
import SelectImageField from '@/components/profile/create/SelectImageField.vue'
import { toSubstrateAddress } from '@/services/profile'
import { addHttpToUrl } from '@/utils/format/url'

const props = defineProps<{
  profile?: Profile | null
  signingMessage: boolean
}>()

const emit = defineEmits<{
  (e: 'submit', value: ProfileFormData): void
  (e: 'delete', address: string): void
}>()

const socialLinks = [
  {
    name: 'farcaster',
    icon: 'i-simple-icons-farcaster',
    model: 'farcasterHandle',
    placeholder: 'Farcaster Handle',
  },
  {
    name: 'website',
    icon: 'i-heroicons-globe-alt',
    model: 'website',
    placeholder: 'Website',
  },
  {
    name: 'twitter',
    icon: 'i-simple-icons-x',
    model: 'twitterHandle',
    placeholder: 'Twitter Handle',
  },
]

const DELETE_CONFIRM_SAFETY_DELAY = 3000

const deleteConfirm = ref<Date>()

const now = useNow()
const { $i18n } = useNuxtApp()
const { accountId } = useAuth()

const isDeleteConfirmSafetyDelay = computed(() =>
  deleteConfirm.value
    ? now.value.getTime() - deleteConfirm.value.getTime()
    < DELETE_CONFIRM_SAFETY_DELAY
    : false,
)

const deleteConfirmSafetyDelayText = computed(() => {
  if (isDeleteConfirmSafetyDelay.value && deleteConfirm.value) {
    return $i18n.t('profiles.waitSeconds', [
      Math.ceil(
        (deleteConfirm.value.getTime()
          + DELETE_CONFIRM_SAFETY_DELAY
          - now.value.getTime())
        / 1000,
      ),
    ])
  }

  return ''
})

const deleteConfirmText = computed(() =>
  !deleteConfirm.value
    ? $i18n.t('profiles.delete')
    : $i18n.t('profiles.deleteConfirm'),
)

const substrateAddress = computed(() => toSubstrateAddress(accountId.value))
const form = reactive<ProfileFormData>({
  address: substrateAddress.value,
  name: '',
  description: '',
  image: null,
  imagePreview: undefined,
  banner: null,
  bannerPreview: undefined,
  farcasterHandle: undefined,
  twitterHandle: undefined,
  website: undefined,
})
const userProfile = computed(() => props.profile)
const missingImage = computed(() => (form.imagePreview ? false : !form.image))
const submitDisabled = computed(
  () =>
    !form.name
    || !form.description
    || missingImage.value
    || props.signingMessage,
)

function validatingFormInput(model: string) {
  switch (model) {
    case 'farcasterHandle':
      if (form.farcasterHandle?.startsWith('/')) {
        form.farcasterHandle = form.farcasterHandle.slice(1)
      }
      break
    case 'website':
      if (form.website && !/^https?:\/\//i.test(form.website)) {
        form.website = addHttpToUrl(form.website)
      }
      break
  }
}

function deleteProfile() {
  if (deleteConfirm.value) {
    emit('delete', substrateAddress.value)
  }
  else {
    deleteConfirm.value = new Date()
  }
}

watchEffect(async () => {
  const profile = userProfile.value
  const getProfileSocial = (platform: string) =>
    profile?.socials.find(s => s.platform === platform)

  // Use Farcaster data if useFarcaster is true and data is available, otherwise fallback to profile data
  form.name = profile?.name ?? ''
  form.description = profile?.description ?? ''
  form.imagePreview = profile?.image
  form.bannerPreview = profile?.banner ?? undefined // Banner preview assumed to always come from the profile

  // Conditional for Farcaster handle based on the useFarcaster prop
  form.farcasterHandle = getProfileSocial('Farcaster')?.handle

  // Social handles are fetched from profile regardless of the Farcaster usage
  form.twitterHandle = getProfileSocial('Twitter')?.handle
  form.website = getProfileSocial('Website')?.handle
})
</script>

<template>
  <div class="flex flex-col gap-8">
    <!-- Profile Header Section -->
    <div class="flex flex-col gap-4">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Setting your profile for
      </h2>
      <UserInfo
        :address="accountId"
        :avatar-size="48"
      />
    </div>

    <form
      class="flex flex-col gap-8"
      @submit.prevent
    >
      <!-- Name Section -->
      <div class="flex flex-col gap-3">
        <label class="text-xl font-bold text-gray-900 dark:text-white">
          Your Name
        </label>
        <UInput
          v-model="form.name"
          data-testid="create-profile-input-name"
          required
          placeholder="Enter Your Name"
          class="h-12 text-base"
          :class="{ 'border-red-500': !form.name }"
        />
      </div>

      <!-- Bio Section -->
      <div class="flex flex-col gap-3">
        <label class="text-xl font-bold text-gray-900 dark:text-white">
          Short Bio
        </label>
        <div class="relative">
          <UTextarea
            v-model="form.description"
            required
            :maxlength="200"
            placeholder="introduce yourself in a few words"
            class=" w-full text-base resize-none"
            :class="{ 'border-red-500': !form.description }"
          />
        </div>
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-simple-icons-markdown"
              class="w-4 h-4"
            />
            <span>Markdown Supported</span>
          </div>
          <span>{{ form.description.length }} / 200</span>
        </div>
      </div>

      <!-- Profile Picture Section -->
      <div class="flex flex-col gap-3">
        <label class="text-xl font-bold text-gray-900 dark:text-white">
          Upload profile picture
        </label>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Recommended: 400x400px, up to 2MB (JPG, PNG)
        </p>
        <SelectImageField
          v-model="form.image"
          :preview="form.imagePreview"
          :max-size-in-mb="2"
          @clear="form.imagePreview = undefined"
        />
      </div>

      <!-- Cover Image Section -->
      <div class="flex flex-col gap-3">
        <label class="text-xl font-bold text-gray-900 dark:text-white">
          Upload Cover Image
        </label>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Recommended: 1440x360px (4:1 aspect ratio), up to 5MB (JPG, PNG)
        </p>
        <SelectImageField
          v-model="form.banner"
          :preview="form.bannerPreview"
          :max-size-in-mb="5"
          @clear="form.bannerPreview = undefined"
        />
      </div>

      <!-- Social Links Section -->
      <div class="flex flex-col gap-4">
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          Link socials
        </h3>
        <div class="flex flex-col gap-4">
          <div
            v-for="social in socialLinks"
            :key="social.name"
          >
            <UInput
              v-model="form[social.model as keyof ProfileFormData] as string"
              class="flex-1 border-0 w-full text-base"
              :icon="social.icon"
              size="xl"
              :placeholder="social.placeholder"
              @blur="validatingFormInput(social.model)"
            />
          </div>
        </div>
      </div>
    </form>

    <!-- Action Buttons -->
    <div class="flex flex-col gap-4 pt-4">
      <UButton
        :disabled="submitDisabled"
        color="primary"
        :label="
          signingMessage
            ? 'Sign Transactions'
            : $t('profiles.finishCustomization')
        "
        size="lg"
        class="w-full h-12 flex items-center justify-center font-medium"
        @click="emit('submit', form)"
      />

      <template v-if="userProfile">
        <span
          v-if="isDeleteConfirmSafetyDelay"
          class="flex items-center justify-center text-red-500 text-sm"
        >
          {{ deleteConfirmSafetyDelayText }}
        </span>

        <UButton
          v-else
          color="neutral"
          variant="ghost"
          class="w-full flex items-center justify-center text-gray-500 hover:text-red-500 text-sm"
          :class="[
            deleteConfirm ? 'text-red-500' : 'text-gray-500',
          ]"
          @click="deleteProfile"
        >
          <div class="flex items-center justify-center gap-2">
            <span>{{ deleteConfirmText }}</span>
            <UIcon
              v-if="!deleteConfirm"
              name="i-heroicons-arrow-path"
              class="w-4 h-4"
            />
          </div>
        </UButton>
      </template>
    </div>
  </div>
</template>
