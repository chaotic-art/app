import type { Prefix } from '@kodadot1/static'
import type { Ref } from 'vue'

export const isAssetHub = (prefix: Prefix) => prefix === 'ahk' || prefix === 'ahp'

export default function (prefix: Ref<Prefix>) {
  const isBase = computed(() => prefix.value === 'base')

  return {
    isBase,
    isAssetHub: computed(() => isAssetHub(prefix.value)),
    isEvm: computed(() => isEvm(prefix.value)),
    isSub: computed(() => isSub(prefix.value)),
  }
}
