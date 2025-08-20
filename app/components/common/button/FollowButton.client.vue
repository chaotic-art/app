<script lang="ts" setup>
import type { ButtonProps } from '@nuxt/ui'
import { useElementHover } from '@vueuse/core'
import { follow, isFollowing, unfollow } from '@/services/profile'
import { getss58AddressByPrefix } from '@/utils/account'

export interface ButtonConfig {
  label: string
  icon?: string
  onClick?: () => void
  classes?: string
  active?: boolean
  disabled?: boolean
  color?: ButtonProps['color']
}

const props = withDefaults(defineProps<{
  target: string
  height?: number
}>(), {
  height: 40,
})

const emit = defineEmits(['followAction'])
const { doAfterLogin } = useDoAfterlogin()
const showFollowing = ref(false)
const loading = ref(false)
const buttonRef = ref()

const { prefix } = usePrefix()
const { $i18n } = useNuxtApp()
const { accountId } = useAuth()
const { getSignaturePair } = useVerifyAccount()
const isHovered = useElementHover(buttonRef)
const toast = useToast()
const { data: isFollowingThisAccount, refresh: refreshFollowingStatus }
  = useAsyncData(`${accountId.value}/isFollowing/${props.target}`, () =>
    isFollowing(accountId.value, props.target))

const followConfig = computed<ButtonConfig>(() => ({
  label: $i18n.t('profile.follow'),
  icon: 'i-lucide-plus',
  onClick: async () => {
    doAfterLogin({
      onLoginSuccess: async () => {
        loading.value = true
        const signaturePair = await getSignaturePair().catch((e) => {
          toast.add({
            title: e.message,
            color: 'error',
          })
          loading.value = false
        })

        if (!signaturePair) {
          loading.value = false
          return
        }
        await follow({
          initiatorAddress: accountId.value,
          targetAddress: props.target,
          signature: signaturePair.signature,
          message: signaturePair.message,
        }).catch(() => {
          toast.add({
            title: 'Failed to follow',
            color: 'error',
          })
        })
        await refreshFollowingStatus()
        loading.value = false
        showFollowing.value = isFollowingThisAccount.value || false
        emit('followAction')
      },
    })
  },
}))

const unfollowConfig = computed<ButtonConfig>(() => ({
  label: $i18n.t('profile.unfollow'),
  color: 'error',
  onClick: () => {
    doAfterLogin({
      onLoginSuccess: async () => {
        loading.value = true

        const signaturePair = await getSignaturePair().catch((e) => {
          toast.add({
            title: e.message,
            color: 'error',
          })
          loading.value = false
        })

        if (!signaturePair) {
          loading.value = false
          return
        }

        await unfollow({
          initiatorAddress: accountId.value,
          targetAddress: props.target,
          signature: signaturePair.signature,
          message: signaturePair.message,
        })

        await refreshFollowingStatus()
        loading.value = false
        emit('followAction')
      },
    })
  },
}))

const followingConfig: ButtonConfig = {
  label: $i18n.t('profile.following'),
}

const buttonConfig = computed<ButtonConfig>(() => {
  if (loading.value) {
    return {
      label: isFollowingThisAccount.value
        ? $i18n.t('profile.unfollowing')
        : $i18n.t('profile.following'),
    }
  }

  if (
    showFollowing.value
    || (!isHovered.value && isFollowingThisAccount.value)
  ) {
    return { ...followingConfig, active: isHovered.value }
  }
  return isFollowingThisAccount.value
    ? unfollowConfig.value
    : followConfig.value
})

watch(isHovered, (newHover, oldHover) => {
  const curserExited = newHover === false && oldHover === true
  if (curserExited) {
    showFollowing.value = false
  }
})

defineExpose({ refresh: refreshFollowingStatus })

watch(accountId, () => {
  refreshFollowingStatus()
})
</script>

<template>
  <div ref="buttonRef">
    <UButton
      v-if="!accountId || getss58AddressByPrefix(accountId, prefix) !== getss58AddressByPrefix(target, prefix)"
      :loading="loading"
      variant="outline"
      :icon="buttonConfig.icon"
      :label="buttonConfig.label"
      :active="buttonConfig.active"
      :disabled="buttonConfig.disabled"
      test-id="profile-button-multi-action"
      class="rounded-full w-[7rem]"
      :color="buttonConfig.color"
      @click="buttonConfig.onClick"
    />
  </div>
</template>
