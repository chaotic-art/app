import type { Royalty } from './royalty'
import type { Extrinsic } from './transactionExecutor'
import type { SubApi } from '@/plugins/api.client'
import { asBalanceTransfer } from '@/utils/papi'
import { pubKeyToAddress } from './account'
import correctFormat from './ss58Format'

const BACKUP_PUBKEY = '0x9866ec0c1204773a4b95a1b374d838b5820f704a65deeaafb97f4ab96c351158' // payout bot
export const CHAOTIC_DAO = 'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY'
export const CHAOTIC_BOT = 'Gn84LKb5HSxc3SACayxCzKQcWESRMcT1VUCqeZURfGj6ASi'
const OFFSET_DAO = 'J9PSLHKjtJ9eEAX4xmCe8xNipRxNiYJTbnyfKXXRkhMmuq8'
export const BASE_FEE = 0.5 // 50 cents
export const SUPPORT_FEE_PERCENT = 0.03 // percent / 100

export function round(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100
}

export type SupportTokens = 'KSM' | 'DOT'

export async function cost(api: SubApi, fee: number = BASE_FEE, token?: SupportTokens = 'KSM'): Promise<number> {
  const tokenPrice = await getApproximatePriceOf(token)

  if (tokenPrice === 0) {
    return 0
  }

  console.log('[SUPPORT] 💋💋💋', fee / tokenPrice, token)
  const decimals: number = getTokenDecimals(api)
  return Math.round((fee / tokenPrice) * 10 ** decimals)
}

export async function supportTx(api: SubApi, multiplyWith = 1, token?: SupportTokens = 'KSM'): Promise<Extrinsic> {
  return asBalanceTransfer(
    api,
    await resolveSupportAddress(api),
    await cost(api, BASE_FEE * multiplyWith, token),
  )
}

export async function feeTx(api: SubApi, price: string) {
  return asBalanceTransfer(api, await resolveSupportAddress(api), price)
}

export function getPercentSupportFee(price: number | string) {
  // it has to be an integer
  return Math.floor(Number(price) * SUPPORT_FEE_PERCENT)
}

export async function somePercentFromTX(api: SubApi, price: number | string) {
  const fee = getPercentSupportFee(price)
  return asBalanceTransfer(api, await resolveSupportAddress(api), fee)
}

export function royaltyFee(price: string | number, royaltyPercent: number) {
  return Math.floor(Number(price) * (royaltyPercent / 100))
}

export function payRoyaltyTx(api: SubApi, price: number | string, royalty: Royalty) {
  const fee = royaltyFee(price, royalty.amount)
  return asBalanceTransfer(api, royalty.address, fee)
}

function getTokenDecimals(api: SubApi): number {
  return 12
  const { chainDecimals } = api.registry
  return chainDecimals[0] || 12
}

async function getSS58Format(api: SubApi): Promise<number> {
  const chainSS58 = await api.constants.System.SS58Prefix()
  return correctFormat(chainSS58)
}

export async function resolveSupportAddress(api: SubApi) {
  const ss58Format = await getSS58Format(api)
  console.log('[SUPPORT] ss58Format', ss58Format)
  return Number(ss58Format) === 2 ? CHAOTIC_DAO : pubKeyToAddress(BACKUP_PUBKEY)
}

export function resolveOffsetAddress(api: SubApi) {
  const ss58Format = getSS58Format(api)
  return Number(ss58Format) === 2 ? OFFSET_DAO : pubKeyToAddress(BACKUP_PUBKEY)
}

export async function offsetTx(api: SubApi, price: number) {
  return asBalanceTransfer(
    api,
    await resolveSupportAddress(api),
    await cost(api, price),
  )
}

export async function canSupport(api: SubApi, enabled: boolean, multiplyWith = 1, token: SupportTokens = 'KSM'): Promise<[] | [Extrinsic]> {
  return enabled ? [await supportTx(api, multiplyWith, token)] : []
}

export async function canOffset(api: SubApi, enabled: boolean, token: SupportTokens): Promise<[] | [Extrinsic]> {
  return canSupport(api, enabled, 2, token)
}
