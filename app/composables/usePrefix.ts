import type { Prefix } from '@kodadot1/static'

const prefix = ref<Prefix>('ahp')

export default function () {
  return {
    prefix,
  }
}
