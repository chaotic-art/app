// TODO: remove this file
import type { ChainProperties, ChainVM, Prefix } from '@kodadot1/static'
import { CHAINS } from '@kodadot1/static'

export function chainPropListOf(prefix: Prefix): ChainProperties {
  return CHAINS[prefix]
}

export function vmOf(prefix: Prefix): ChainVM {
  return chainPropListOf(prefix).vm
}

export default function useVm() {
  const { prefix } = usePrefix()

  const vm = computed(() => vmOf(prefix.value))

  return {
    vm,
  }
}
