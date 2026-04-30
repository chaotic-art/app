import type { Chain } from 'viem'
import type { EvmChain } from '~/types'
import { createPublicClient, defineChain, http as viemHttp } from 'viem'

interface ViemChainSpec {
  id: number
  slug: EvmChain
  name: string
  rpc: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    decimals: number
    symbol: string
  }
}

export const CHAIN_POLKADOT_TESTNET: ViemChainSpec = {
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
}

const CHAIN_POLKADOT_MAINNET: ViemChainSpec = {
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
}

const CHAIN_KUSAMA_MAINNET: ViemChainSpec = {
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
}

export const supportedChains: Record<EvmChain, ViemChainSpec> = {
  'kusama': CHAIN_KUSAMA_MAINNET,
  'polkadot': CHAIN_POLKADOT_MAINNET,
  'polkadot-testnet': CHAIN_POLKADOT_TESTNET,
}

/** Chains as viem Chain[] for wagmi and getPublicClient. */
export const chainsForWagmi: Chain[] = Object.values(supportedChains).map(chain =>
  defineChain({
    id: chain.id,
    name: chain.name,
    nativeCurrency: chain.nativeCurrency,
    rpcUrls: { default: { http: [chain.rpc] } },
    blockExplorers: { default: { name: chain.name, url: chain.explorerUrl } },
  }),
)

const publicClientCache = new Map<number, ReturnType<typeof createPublicClient>>()

export function getViemChainSpec(chain: EvmChain): ViemChainSpec {
  return supportedChains[chain]
}

/**
 * Public client for a given chain. Cached per chainId.
 * Requires an explicit chainId.
 */
export function getPublicClient(chainId: number) {
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
