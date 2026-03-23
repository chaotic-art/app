import type { Chain } from 'viem'
import { createPublicClient, defineChain, http as viemHttp } from 'viem'

export const CHAIN_POLKADOT_TESTNET = {
  id: 420420417,
  slug: 'polkadot-testnet',
  name: 'Polkadot Hub TestNet',
  rpc: 'https://eth-rpc-testnet.polkadot.io/',
  explorerUrl: 'https://polkadot.testnet.routescan.io/',
  nativeCurrency: {
    name: 'Polkadot',
    decimals: 18,
    symbol: 'PAS',
  },
} as const

export const CHAIN_POLKADOT_MAINNET = {
  id: 420420419,
  slug: 'polkadot',
  name: 'Polkadot Hub',
  rpc: 'https://eth-rpc.polkadot.io/',
  explorerUrl: 'https://blockscout.polkadot.io/',
  nativeCurrency: {
    name: 'Polkadot',
    decimals: 18,
    symbol: 'DOT',
  },
} as const

export const CHAIN_KUSAMA_MAINNET = {
  id: 420420418,
  slug: 'kusama',
  name: 'Kusama Hub',
  rpc: 'https://eth-rpc-kusama.polkadot.io/',
  explorerUrl: 'https://blockscout-kusama.polkadot.io/',
  nativeCurrency: {
    name: 'Kusama',
    decimals: 18,
    symbol: 'KSM',
  },
} as const

export const supportedChains = [
  CHAIN_POLKADOT_TESTNET,
  CHAIN_POLKADOT_MAINNET,
  CHAIN_KUSAMA_MAINNET,
] as const

/** Chains as viem Chain[] for wagmi and getPublicClient. */
export const chainsForWagmi: Chain[] = supportedChains.map(c =>
  defineChain({
    id: c.id,
    name: c.name,
    nativeCurrency: c.nativeCurrency,
    rpcUrls: { default: { http: [c.rpc] } },
    blockExplorers: { default: { name: c.name, url: c.explorerUrl } },
  }),
)

const publicClientCache = new Map<number, ReturnType<typeof createPublicClient>>()

/**
 * Public client for a given chain. Cached per chainId.
 * Defaults to testnet when no chainId is passed. For mainnet use getPublicClient(mainnetChainId).
 */
export function getPublicClient(chainId: number = supportedChains[0].id) {
  let client = publicClientCache.get(chainId)
  if (!client) {
    const chain = chainsForWagmi.find(c => c.id === chainId)

    if (!chain)
      throw new Error(`Unsupported chainId: ${chainId}`)

    client = createPublicClient({
      chain,
      transport: viemHttp(),
    })
    publicClientCache.set(chainId, client)
  }
  return client
}
