<script lang="ts" setup>
import type { DropItem } from '@/types'
import { useNow } from '@vueuse/core'
import { parseCETDate } from '@/components/drop/utils'
import useDropMint from '~/composables/drop/useDropMint'

const props = withDefaults(
  defineProps<{
    drop?: DropItem
    isDropPage?: boolean
    size?: 'md' | 'sm'
  }>(),
  {
    size: 'md',
  },
)

const sizeClassMap = {
  sm: 'px-6 py-3 md:px-4 md:py-[10px] text-sm',
  md: 'px-4 py-2 md:px-6 md:py-3',
}

const { drop: storeDrop, amountToMint, previewItem } = storeToRefs(useDropStore())
const { $i18n } = useNuxtApp()
const { mint } = useDropMint()
const { isLogIn } = useAuth()
const now = useNow()

const drop = computed(() => props.isDropPage ? storeDrop.value : props.drop)

const isMintNotLive = computed(() => {
  const startAt = drop.value?.start_at
  return startAt ? parseCETDate(startAt) > now.value : false
})

const label = computed(() => {
  if (drop.value?.isMintedOut) {
    return $i18n.t('drop.seeListing')
  }

  if (isMintNotLive.value) {
    return $i18n.t('drop.mintingNotLive')
  }

  if (!isLogIn.value && props.isDropPage) {
    return $i18n.t('general.connectWallet')
  }

  return $i18n.t('drop.mint')
})

const enabled = computed(() => {
  if (drop.value?.isMintedOut) {
    return true
  }

  if (
    !drop.value // drop not loaded
    || !amountToMint.value // number of drop to be mint is 0
    || Boolean(drop.value.disabled) // drop is disabled
    || isMintNotLive.value // drop start time is greater than now
    || (props.isDropPage ? !previewItem.value : false) // no image
    // || loading.value // still loading
  ) {
    return false
  }

  return true
})

function openMintModal() {
  // open modal from landing page
  if (props.drop && storeDrop.value.id !== props.drop.id && !props.isDropPage) {
    storeDrop.value = props.drop
  }

  mint()
}

function handleMint() {
  if (!drop.value) {
    return
  }

  if (drop.value.isMintedOut) {
    navigateTo(`/${drop.value.chain}/collection/${drop.value.collection}`)
    return
  }

  openMintModal()
}
</script>

<template>
  <UButton
    :class="sizeClassMap[size]"
    :disabled="!enabled"
    @click.stop="handleMint"
  >
    {{ label }}
  </UButton>
</template>
