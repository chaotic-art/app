import type { Abi as ViemAbi } from 'viem'

export type SuccessFunctionMessage = (blockNumber: string) => string

export const NFTs = {
  MINT_DROP: 'mintDrop',
} as const

export type Abi = ViemAbi

export type ExecuteTransactionSuccessMessage
  = | string
    | SuccessFunctionMessage
