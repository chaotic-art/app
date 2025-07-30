<script setup lang="ts">
import type { ProfileFormData } from '@/components/profile/types'
import type { SignaturePair } from '@/types'
import ProfileForm from '@/components/profile/create/ProfileForm.vue'
import { deleteProfile } from '@/services/profile'

const props = defineProps<{
  address: string
}>()

const emit = defineEmits(['close', 'success', 'deleted'])

const { getSignaturePair } = useVerifyAccount()
const { profile, refetch: fetchProfile } = useFetchProfile(computed(() => props.address))

const signingMessage = ref(false)
const vOpen = ref(true)

function close() {
  vOpen.value = false
  emit('close')
}

async function handleProfileDelete(address: string) {
  try {
    const { signature, message } = await getSignaturePair()
    await deleteProfile({ address, message, signature })
    successMessage('Your profile has been cleared successfully. Start fresh!')
    emit('deleted')
    fetchProfile()
    close()
  }
  catch (error) {
    warningMessage(error!.toString())
    console.error(error)
  }
}

async function handleFormSubmission(profileData: ProfileFormData) {
  let signaturePair: undefined | SignaturePair

  try {
    signingMessage.value = true
    signaturePair = await getSignaturePair()
    signingMessage.value = false
    close()
  }
  catch (error) {
    reset()
    warningMessage(error!.toString())
    console.error(error)
  }

  if (!signaturePair) {
    return
  }

  try {
    await useUpdateProfile({
      profileData,
      signaturePair,
      hasProfile: Boolean(profile.value),
      useFarcaster: false,
    })

    profileUpdated()
  }
  catch (error) {
    warningMessage(error!.toString())
  }
}

function profileUpdated() {
  emit('success')
  fetchProfile()
  successMessage('Profile Updated')
  close()
}

function reset() {
  signingMessage.value = false
}
</script>

<template>
  <UModal
    v-model:open="vOpen"
    :ui="{
      content: 'max-w-md w-full',
    }"
  >
    <template #body>
      <ProfileForm
        :signing-message="signingMessage"
        :profile="profile"
        @submit="handleFormSubmission"
        @delete="handleProfileDelete"
      />
    </template>
  </UModal>
</template>
