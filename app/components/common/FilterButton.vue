<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const props = defineProps<{
  label?: string
  urlParam: string
  variant?: ButtonProps['variant']
  oppositeUrlParam?: string
}>()
const route = useRoute()
const router = useRouter()

const model = computed({
  get: () => route.query[props.urlParam] === 'true',
  set: (val: boolean) => {
    router.replace({
      query: { ...route.query, [props.urlParam]: String(val) },
    })
  },
})
</script>

<template>
  <UButton
    :variant="model ? undefined : 'outline'"
    :label="label"
    @click="model = !model"
  />
</template>
