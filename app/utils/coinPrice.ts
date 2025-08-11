import type { Prefix } from '@kodadot1/static'
import { $fetch } from 'ofetch'
import { useFiatStore } from '@/stores/fiat'
import { decimalsOf, tokenSymbolOf } from '@/utils/chain'
import { URLS } from '@/utils/constants'

export const COINGECKO_BASE_URL = URLS.providers.coingecko
export const KODAPRICE_BASE_URL = URLS.providers.kodaprice

let status = 0
const baseApi = {
  headers: {
    'Content-Type': 'application/json',
  },
  ignoreResponseError: true,
  async onRequest() {
    status = 0
  },
  async onResponse({ response }: { response: Response }) {
    status = response.status
  },
}

const coingeckoApi = $fetch.create({
  ...baseApi,
  baseURL: COINGECKO_BASE_URL,
  credentials: 'omit',
})

const kodapriceApi = $fetch.create({
  ...baseApi,
  baseURL: KODAPRICE_BASE_URL,
})

// types from https://price.kodadot.workers.dev/price/kusama
// or https://api.coingecko.com/api/v3/simple/price?ids=kusama&vs_currencies=usd
interface GetPrice {
  [key: string]: {
    usd: number
  }
}

export async function getPrice(id: string): Promise<GetPrice> {
  const emptyPrice = { [id]: { usd: 0 } }

  // fetch kodaprice
  const dataKodaprice = await kodapriceApi(`/price/${id}`)
  if (status === 200) {
    return dataKodaprice
  }

  // fallback to coingecko
  const dataCoingecko = await coingeckoApi('/simple/price', {
    params: {
      ids: id,
      vs_currencies: 'usd',
    },
  })
  if (status === 200) {
    return dataCoingecko
  }

  return emptyPrice
}

export type Token = 'KSM' | 'DOT' | 'ETH'
export type TokenName = 'kusama' | 'polkadot' | 'ethereum'
// tokenMap but reversed
const tokenMap: Record<Token, TokenName> = {
  KSM: 'kusama',
  DOT: 'polkadot',
  ETH: 'ethereum',
}

export async function getApproximatePriceOf(id: string): Promise<number> {
  const coinId = tokenMap[id as Token]

  const data = await getPrice(coinId)

  if (data) {
    const value: number = data[coinId]?.usd ?? 0
    return value
  }

  return 0
}

export default kodapriceApi

/**
 * Calculate USD value from token amount and chain
 * @param tokenAmount - Raw token amount (string or number)
 * @param chain - Chain prefix (e.g., 'ahp', 'ahk')
 * @returns Formatted USD string or '--' if no value
 */
export function calculateTokenUSD(tokenAmount: string | number | undefined, chain: Prefix): string {
  if (!tokenAmount)
    return '--'

  const fiatStore = useFiatStore()
  const tokenValue = Number(tokenAmount) * 10 ** -decimalsOf(chain)
  const currentTokenValue = fiatStore.getCurrentTokenValue(tokenSymbolOf(chain))
  const usdValue = tokenValue * Number(currentTokenValue)

  return usdValue > 0 ? `$${usdValue.toFixed(2)}` : '--'
}
