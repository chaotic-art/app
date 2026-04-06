import type { AssetHubChain, Chain, ChainVm, EvmChain, SubstrateChain } from '~/types/chain'
import { dotHubDenyList, ksmHubDenyList } from '@/utils/constants'

interface BaseChainConfig {
  indexerChain?: AssetHubChain
  name: string
  substrateSourceChain: SubstrateChain
  tokenSymbol: string
  tokenDecimals: number
  vm: ChainVm
  permissions: {
    interact: boolean
  }
}

interface SubstrateChainConfig extends BaseChainConfig {
  vm: 'SUB'
  ss58Format: number
}

interface EvmChainConfig extends BaseChainConfig {
  vm: 'EVM'
}

type ChainConfig = SubstrateChainConfig | EvmChainConfig

const exploreCollectionTypesByChain = {
  'ahpas': ['UNIQUES', 'NFTS'],
  'polkadot-testnet': ['ERC721', 'ERC1155'],
} as const

export const substrateChainConfig: Record<SubstrateChain, SubstrateChainConfig> = {
  ahp: {
    name: 'Polkadot Asset Hub',
    tokenDecimals: 10,
    tokenSymbol: 'DOT',
    ss58Format: 0,
    vm: 'SUB',
    permissions: { interact: true },
    substrateSourceChain: 'ahp',
    indexerChain: 'ahp',
  },
  ahk: {
    name: 'Kusama Asset Hub',
    tokenDecimals: 12,
    tokenSymbol: 'KSM',
    ss58Format: 2,
    vm: 'SUB',
    permissions: { interact: true },
    indexerChain: 'ahk',
    substrateSourceChain: 'ahk',
  },
  ahpas: {
    substrateSourceChain: 'ahpas',
    tokenDecimals: 10,
    tokenSymbol: 'PAS',
    ss58Format: 0,
    vm: 'SUB',
    permissions: { interact: true },
    indexerChain: 'ahpas',
    name: 'Paseo Asset Hub',
  },
  dot: {
    name: 'Polkadot',
    tokenDecimals: 10,
    tokenSymbol: 'DOT',
    ss58Format: 0,
    vm: 'SUB',
    permissions: { interact: false },
    substrateSourceChain: 'dot',
  },
  ksm: {
    name: 'Kusama',
    tokenDecimals: 12,
    tokenSymbol: 'KSM',
    ss58Format: 2,
    vm: 'SUB',
    permissions: { interact: false },
    substrateSourceChain: 'ksm',
  },
}

// This registry currently mixes static chain metadata with app-level routing/source mappings.
// If it keeps growing, split pure onchain/spec data from higher-level chain config.
// For substrate onchain runtime data, use getChainSpec() from utils/api/substrate.ts.
export const chainConfig: Record<Chain, ChainConfig> = {
  // substrate-backed chains
  ...substrateChainConfig,

  // polkadot hub (contracts) chains
  'polkadot': {
    name: 'Polkadot Hub',
    tokenDecimals: 18,
    tokenSymbol: 'DOT',
    vm: 'EVM',
    permissions: { interact: false },
    indexerChain: 'ahp',
    substrateSourceChain: 'ahp',
  },
  'kusama': {
    name: 'Kusama Asset Hub',
    tokenDecimals: 18,
    tokenSymbol: 'KSM',
    vm: 'EVM',
    permissions: { interact: false },
    indexerChain: 'ahk',
    substrateSourceChain: 'ahk',
  },
  'polkadot-testnet': {
    name: 'Polkadot TestNet',
    tokenDecimals: 18,
    tokenSymbol: 'PAS',
    vm: 'EVM',
    permissions: { interact: false },
    indexerChain: 'ahpas',
    substrateSourceChain: 'ahpas',
  },
}

// Type guard functions
export function isAssetHubChain(chain: string): chain is AssetHubChain {
  return ['ahp', 'ahk', 'ahpas'].includes(chain as AssetHubChain)
}

export function isChain(chain: string): chain is Chain {
  return chain in chainConfig
}

export function isEvmChain(chain: Chain): chain is EvmChain {
  return chainConfig[chain].vm === 'EVM'
}

export function isSubstrateChain(chain: Chain): chain is SubstrateChain {
  return chain in substrateChainConfig
}

export function isOdaChain(chain: Chain): chain is AssetHubChain | EvmChain {
  return chain !== 'dot' && chain !== 'ksm'
}

export function getSubstrateSourceChain(chain: Chain): SubstrateChain {
  return chainConfig[chain].substrateSourceChain
}

export function getAssetHubChain(chain: Chain): AssetHubChain | undefined {
  return chainConfig[chain].indexerChain
}

export function getIndexerChain(chain: Chain): AssetHubChain | undefined {
  return chainConfig[chain].indexerChain
}

export function canInteract(chain: Chain): boolean {
  return chainConfig[chain].permissions.interact
}

export function getGraphqlEndpointChain(chain: Chain): AssetHubChain | undefined {
  return getIndexerChain(chain)
}

export function getExploreCollectionTypes(chain: Chain) {
  // tmp solution remove once other indexers have also revm deployed
  if (!(chain in exploreCollectionTypesByChain)) {
    return undefined
  }

  return exploreCollectionTypesByChain[chain as keyof typeof exploreCollectionTypesByChain]
}

export function getDenyList(chain: AssetHubChain): string[] | undefined {
  switch (chain) {
    case 'ahk':
      return ksmHubDenyList
    case 'ahp':
      return dotHubDenyList
    default:
      return undefined
  }
}

export function isSubstrateChainName(chain: string): chain is SubstrateChain {
  return chain in substrateChainConfig
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
