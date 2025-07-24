import type { Ref } from 'vue'
import type { Abi, ExecuteTransactionSuccessMessage } from './base'
import type { SubApi } from '@/plugins/api.client'

interface BaseExecuteTransactionParams {
  arg: any[]
  successMessage?: ExecuteTransactionSuccessMessage
  errorMessage?: string | (() => string)
}

export type ExecuteSubstrateTransactionParams = {
  cb: (...params: any[]) => any
} & BaseExecuteTransactionParams

export type ExecuteEvmTransactionParams = {
  address: string
  functionName: string
  abi: Abi
  value?: string
} & BaseExecuteTransactionParams

export type ExecuteTransactionParams
  = | ExecuteSubstrateTransactionParams
    | ExecuteEvmTransactionParams

export type ExecuteTransaction = (p: ExecuteTransactionParams) => void

// Base union mint parameters for transaction execution
interface BaseUnionMintParams<T> {
  item: T
  isLoading: Ref<boolean>
  status: Ref<string>
  executeTransaction: ExecuteTransaction
}

export type BaseSubstrateMintParams<T, S = SubApi> = {
  api: S // Allow specific spific chain typed api
} & BaseUnionMintParams<T>

export type BaseEvmMintParams<T> = BaseUnionMintParams<T>

export type BaseMintParams<T>
  = | BaseSubstrateMintParams<T>
    | BaseEvmMintParams<T>
