<script lang="ts" setup>
import type { DropItem } from '@/types'

const props = defineProps<{
  drop?: DropItem
}>()
const { $i18n } = useNuxtApp()

const mintButtonLabel = computed(() => {
  if (props.drop?.isMintedOut) {
    return $i18n.t('drop.seeListing')
  }
  return $i18n.t('drop.mint')
})

function handleMintButtonClick(_event: MouseEvent) {
  if (props.drop?.isMintedOut) {
    navigateTo(
      `/${props.drop?.chain}/collection/${props.drop?.collection}`,
    )
    return
  }
  navigateTo(`/${props.drop?.chain}/drops/${props.drop?.alias}`)
}
</script>

<template>
  <UButton class="bg-black text-white rounded-full px-6 py-3 md:px-4 md:py-[10px] text-sm hover:bg-gray-900 transition w-full md:w-auto cursor-pointer" @click="handleMintButtonClick">
    {{ mintButtonLabel }}
  </UButton>
</template>
