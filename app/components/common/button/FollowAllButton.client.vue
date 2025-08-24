<script setup lang="ts">
import { follow } from '@/services/profile'

interface Props {
  artists: string[]
}

const props = defineProps<Props>()

const { doAfterLogin } = useDoAfterlogin()
const { accountId } = useAuth()
const { getSignaturePair } = useVerifyAccount()
const toast = useToast()
const loading = ref(false)

function followAllArtists() {
  if (!props.artists?.length || !accountId.value)
    return

  doAfterLogin({
    onLoginSuccess: async () => {
      loading.value = true

      try {
        const signaturePair = await getSignaturePair().catch((e) => {
          toast.add({
            title: e.message,
            color: 'error',
          })
          loading.value = false
          return null
        })

        if (!signaturePair) {
          loading.value = false
          return
        }

        const followPromises = props.artists.map(artist =>
          follow({
            initiatorAddress: accountId.value!,
            targetAddress: artist,
            signature: signaturePair.signature,
            message: signaturePair.message,
          }).catch(() => {
            console.error(`Failed to follow ${artist}`)
            return { success: false, artist }
          }),
        )

        const results = await Promise.allSettled(followPromises)
        const successful = results.filter(result =>
          result.status === 'fulfilled' && result.value?.success !== false,
        ).length

        if (successful > 0) {
          toast.add({
            title: `Successfully followed ${successful} artists`,
            color: 'success',
          })
        }
        else {
          toast.add({
            title: 'You already follow all artists',
            color: 'error',
          })
        }
      }
      catch {
        toast.add({
          title: 'Failed to follow artists',
          color: 'error',
        })
      }
      finally {
        loading.value = false
      }
    },
  })
}
</script>

<template>
  <UButton
    v-if="artists && artists.length > 0"
    :loading="loading"
    :disabled="loading"
    variant="outline"
    icon="i-lucide-user-star"
    :label="$t('profile.followAll')"
    class="rounded-full px-6"
    @click="followAllArtists"
  />
</template>
