import type { Prefix } from '@kodadot1/static'

const prefix = ref<Prefix>('ahp')

export function useChain() {
  const vm = computed(() => vmOf(prefix.value))

  return {
    vm,
    prefix,
  }
}
