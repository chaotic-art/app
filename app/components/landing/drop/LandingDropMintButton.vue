<script lang="ts" setup>
import type { DropItem } from '@/types'
import { getDropAttributes } from '@/components/drop/utils'
import useDropMint from '~/composables/drop/useDropMint'

const props = defineProps<{
  drop?: DropItem
  isMintedOut?: boolean
}>()

const { drop } = storeToRefs(useDropStore())
const { $i18n } = useNuxtApp()
const { mint } = useDropMint()

const dropAttributes = ref<DropItem>()

const mintButtonLabel = computed(() => {
  if (props.isMintedOut) {
    return $i18n.t('drop.seeListing')
  }
  return $i18n.t('drop.mint')
})

function openMintModal() {
  if (!dropAttributes.value) {
    return
  }

  if (drop.value.id !== dropAttributes.value.id) {
    drop.value = dropAttributes.value
  }

  mint()
}

async function handleMintButtonClick() {
  if (!props.drop) {
    return
  }

  if (props.isMintedOut) {
    navigateTo(`/${props.drop.chain}/collection/${props.drop.collection}`)
    return
  }

  openMintModal()
}

const isDisabled = computed(() => !dropAttributes.value && !props.isMintedOut)

watchEffect(async () => {
  if (props.drop && !props.isMintedOut) {
    dropAttributes.value = await getDropAttributes(props.drop.alias)
  }
})
</script>

<template>
  <UButton
    class="bg-black text-white rounded-full px-6 py-3 md:px-4 md:py-[10px] text-sm hover:bg-gray-900 transition w-fit md:w-auto cursor-pointer"
    :disabled="isDisabled"
    @click.stop="handleMintButtonClick"
  >
    {{ mintButtonLabel }}
  </UButton>
</template>
