import type { Prefix } from '@kodadot1/static'

export function useChain() {
  const prefix = ref<Prefix>('ahp')
  const vm = computed(() => vmOf(prefix.value))

  return {
    vm,
    prefix,
  }
}
