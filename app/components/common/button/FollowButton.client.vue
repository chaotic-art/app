<script lang="ts" setup>
import type { ButtonConfig } from './ButtonConfig.vue'
import { useElementHover } from '@vueuse/core'
import { follow, isFollowing, unfollow } from '@/services/profile'
import { getss58AddressByPrefix } from '@/utils/account'

const props = defineProps<{
  target: string
}>()

const emit = defineEmits(['followAction'])
// const { doAfterLogin } = useDoAfterlogin()
const showFollowing = ref(false)
const loading = ref(false)
const buttonRef = ref()

const { prefix } = usePrefix()
const { $i18n } = useNuxtApp()
const { accountId } = useAuth()
const { getSignaturePair } = useVerifyAccount()
const isHovered = useElementHover(buttonRef)
const toast = useToast()
const {
  walletConnectModalOpen,
} = storeToRefs(usePreferencesStore())
const { data: isFollowingThisAccount, refresh: refreshFollowingStatus }
  = useAsyncData(`${accountId.value}/isFollowing/${props.target}`, () =>
    isFollowing(accountId.value, props.target))

const followConfig = computed<ButtonConfig>(() => ({
  label: $i18n.t('profile.follow'),
  icon: 'i-lucide-plus',
  onClick: async () => {
    if (!accountId.value) {
      walletConnectModalOpen.value = true
      return
    }
    // doAfterLogin({
    //   onLoginSuccess: async () => {
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
    // },
    // })
  },
  classes: 'hover:bg-transparent! hover:border-black dark:hover:border-white',
}))

const unfollowConfig = computed<ButtonConfig>(() => ({
  label: $i18n.t('profile.unfollow'),
  onClick: async () => {
    if (!accountId.value) {
      walletConnectModalOpen.value = true
      return
    }
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
  classes: 'hover:bg-transparent! hover:border-red-500 hover:text-red-500 hover:bg-red-500/10',
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
</script>

<template>
  <div ref="buttonRef">
    <ButtonConfig
      v-if="getss58AddressByPrefix(accountId || '', prefix) !== getss58AddressByPrefix(target, prefix)"
      :loading="loading"
      :button="{
        ...buttonConfig,
        classes: `px-6 py-2 rounded-full cursor-pointer border border-gray-300 dark:border-neutral-700 bg-background-color-secondary text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-neutral-700 ${buttonConfig.classes}`,
      }"
      test-id="profile-button-multi-action"
      @click.stop
    />
  </div>
</template>
