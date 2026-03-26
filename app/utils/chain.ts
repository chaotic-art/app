import type { AssetHubChain, SupportedChain } from '~/plugins/sdk.client'
import type { Chain, ChainVm, EvmChain } from '~/types/chain'

interface ChainSpec {
  name: string
  tokenSymbol: string
  tokenDecimals: number
  ss58Format?: number
  vm: ChainVm
}

// this is static config. for substrate onchain data use getChainSpec() from utils/api/substrate.ts
export const chainSpec: Record<Chain, ChainSpec> = {
  // substrate
  'ahp': {
    name: 'Polkadot Asset Hub',
    tokenDecimals: 10,
    tokenSymbol: 'DOT',
    ss58Format: 0,
    vm: 'SUB',
  },
  'ahk': {
    name: 'Kusama Asset Hub',
    tokenDecimals: 12,
    tokenSymbol: 'KSM',
    ss58Format: 2,
    vm: 'SUB',
  },
  'ahpas': {
    name: 'Paseo Asset Hub',
    tokenDecimals: 10,
    tokenSymbol: 'PAS',
    ss58Format: 0,
    vm: 'SUB',
  },
  'dot': {
    name: 'Polkadot',
    tokenDecimals: 10,
    tokenSymbol: 'DOT',
    ss58Format: 0,
    vm: 'SUB',
  },
  'ksm': {
    name: 'Kusama',
    tokenDecimals: 12,
    tokenSymbol: 'KSM',
    ss58Format: 2,
    vm: 'SUB',
  },

  // polkadot hub (contracts) chains
  'polkadot': {
    name: 'Polkadot Hub',
    tokenDecimals: 18,
    tokenSymbol: 'DOT',
    vm: 'EVM',
  },
  'kusama': {
    name: 'Kusama Asset Hub',
    tokenDecimals: 18,
    tokenSymbol: 'KSM',
    vm: 'EVM',
  },
  'polkadot-testnet': {
    name: 'Polkadot TestNet',
    tokenDecimals: 18,
    tokenSymbol: 'PAS',
    vm: 'EVM',
  },
}

// Type guard functions
export function isAssetHubChain(chain: string): chain is AssetHubChain {
  return ['ahp', 'ahk', 'ahpas'].includes(chain as AssetHubChain)
}

export function isEvmChain(chain: Chain): chain is EvmChain {
  return chainSpec[chain].vm === 'EVM'
}

export function isSupportedChain(chain: string): chain is SupportedChain {
  return chain in chainSpec
}

export const chainToPrecisionMap: Record<Chain, number> = {
  // substrate chains
  'ksm': 4,
  'ahk': 6,
  'ahp': 5,
  'dot': 4,
  'ahpas': 5,

  // contract chains
  'polkadot': 4,
  'kusama': 4,
  'polkadot-testnet': 4,
}
