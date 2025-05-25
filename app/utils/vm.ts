import type { ChainVM, Prefix } from '@kodadot1/static'
import { useChain } from '../composables/useChain'
import { vmOf } from './chain'

interface PickByVmOptions {
  key?: string
  vm?: ChainVM
  prefix?: Prefix
}

type CompleteVmMap<T> = Record<ChainVM, T>

function isCompleteVmMap<T>(map: Partial<Record<ChainVM, T>>): map is CompleteVmMap<T> {
  return Object.keys(map).length >= 2 // Hardcoded check for 2 VMs (SUB and EVM)
}

export function pickByVm<T>(map: CompleteVmMap<T>, options?: PickByVmOptions): T
export function pickByVm<T>(map: Partial<Record<ChainVM, T>>, options?: PickByVmOptions): T | undefined

export function pickByVm<T>(map: Partial<Record<ChainVM, T>>, { key, vm, prefix }: PickByVmOptions = {}): T | undefined {
  const { vm: currentVm } = useChain()
  const targetVm = prefix ? vmOf(prefix) : (vm ?? currentVm.value)

  const isComplete = isCompleteVmMap(map)

  const vmMap = map[targetVm]
  if (!vmMap) {
    if (isComplete) {
      throw new Error(`VM ${targetVm} not found in complete map, which should not happen`)
    }
    return undefined
  }

  if (key) {
    const result = (vmMap as Record<string, any>)[key]
    if (result === undefined && isComplete) {
      throw new Error(`Key ${key} not found in VM ${targetVm}`)
    }
    return result
  }

  return vmMap
}

export function execByVm<T>(map: CompleteVmMap<() => T>, options?: PickByVmOptions): T
export function execByVm<T>(map: Partial<Record<ChainVM, () => T>>, options?: PickByVmOptions): T | undefined

export function execByVm<T>(map: Partial<Record<ChainVM, () => T>>, options: PickByVmOptions = {}): T | undefined {
  if (isCompleteVmMap(map)) {
    const func = pickByVm<() => T>(map, options)
    return func()
  }

  const func = pickByVm<() => T>(map, options)
  return func ? func() : undefined
}
