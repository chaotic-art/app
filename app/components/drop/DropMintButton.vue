<script lang="ts" setup>
import type { DropItem } from '@/types'
import { useNow } from '@vueuse/core'
import { parseCETDate } from '@/components/drop/utils'
import useDropMint from '~/composables/drop/useDropMint'

const props = withDefaults(
  defineProps<{
    drop?: DropItem
    isDropPage?: boolean
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  {
    size: 'md',
  },
)

const { drop: storeDrop, amountToMint, previewItem } = storeToRefs(useDropStore())
const { $i18n } = useNuxtApp()
const { mint } = useDropMint()
const { isLogIn } = useAuth()
const now = useNow({ interval: 10_000 })

const drop = computed(() => props.isDropPage ? storeDrop.value : props.drop)

const isLive = computed(() => {
  const startAt = parseCETDate(drop.value?.start_at || '')
  return startAt < now.value
})

const label = computed(() => {
  if (drop.value?.isMintedOut) {
    return $i18n.t('drop.seeListing')
  }

  if (!isLive.value) {
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
    || !drop.value.active // drop is disabled
    || !isLive.value // drop start time is greater than now
    || (props.isDropPage ? !previewItem.value : false) // no image
    // || loading.value // still loading
  ) {
    return false
  }

  return true
})

function openMintModal() {
  // open modal from landing page
  if (props.drop && storeDrop.value.alias !== props.drop.alias && !props.isDropPage) {
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
    :size="size"
    class="rounded-full"
    :disabled="!enabled"
    @click.stop="handleMint"
  >
    {{ label }}
  </UButton>
</template>
