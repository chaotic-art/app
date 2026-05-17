import { getWsProvider as getPapiWsProvider } from 'polkadot-api/ws'

type WsProviderInput = string | string[] | { endpoints: string[] }

export function getWsProvider(input: WsProviderInput, config?: Parameters<typeof getPapiWsProvider>[1]) {
  const endpoint = typeof input === 'object' && !Array.isArray(input) ? input.endpoints : input
  return getPapiWsProvider(endpoint, config)
}
