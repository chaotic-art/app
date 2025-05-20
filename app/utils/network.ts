import type { Prefix } from '@kodadot1/static'
import { vmOf } from './chain'

export const isEvm = (prefix: Prefix) => vmOf(prefix) === 'EVM'
export const isSub = (prefix: Prefix) => vmOf(prefix) === 'SUB'
