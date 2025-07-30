import type { Prefix } from '@kodadot1/static'

const prefix = ref<Prefix>('ahp')

export default function () {
  const client = computed(() => prefix.value)

  return {
    prefix,
    client,
  }
}
