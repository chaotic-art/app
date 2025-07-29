import type { Prefix } from '@/types'

const prefix = ref<Prefix>('ahp')

export default function () {
  const client = computed(() => prefix.value)

  return {
    prefix,
    client,
  }
}
