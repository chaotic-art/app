import type { AssetHubChain, SupportedChain } from '~/plugins/sdk.client'

// this is static config. for onchain data use getChainSpec() from utils/api/substrate.ts
export const chainSpec: Record<SupportedChain, { name: string, tokenDecimals: number, tokenSymbol: string, ss58Format: number }> = {
  ahp: {
    name: 'Polkadot Asset Hub',
    tokenDecimals: 10,
    tokenSymbol: 'DOT',
    ss58Format: 0,
  },
  ahk: {
    name: 'Kusama Asset Hub',
    tokenDecimals: 12,
    tokenSymbol: 'KSM',
    ss58Format: 2,
  },
  ahpas: {
    name: 'Paseo Asset Hub',
    tokenDecimals: 10,
    tokenSymbol: 'PAS',
    ss58Format: 0,
  },
  dot: {
    name: 'Polkadot',
    tokenDecimals: 10,
    tokenSymbol: 'DOT',
    ss58Format: 0,
  },
  ksm: {
    name: 'Kusama',
    tokenDecimals: 12,
    tokenSymbol: 'KSM',
    ss58Format: 2,
  },
}

// Type guard functions
export function isAssetHubChain(chain: string): chain is AssetHubChain {
  return ['ahp', 'ahk', 'ahpas'].includes(chain as AssetHubChain)
}

export function isSupportedChain(chain: string): chain is SupportedChain {
  return chain in chainSpec
}
