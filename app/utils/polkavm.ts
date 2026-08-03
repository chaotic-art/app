import { CHAIN_POLKADOT_TESTNET, getPublicClient } from '~/utils/viem'

export const POLKAVM_TEST_CHAINS = [
  {
    chainId: CHAIN_POLKADOT_TESTNET.id,
    explorerUrl: CHAIN_POLKADOT_TESTNET.explorerUrl,
    label: CHAIN_POLKADOT_TESTNET.name,
    slug: CHAIN_POLKADOT_TESTNET.slug,
  },
] as const

export type PolkaVmSlug = typeof POLKAVM_TEST_CHAINS[number]['slug']

export const DEFAULT_POLKAVM_SLUG: PolkaVmSlug = CHAIN_POLKADOT_TESTNET.slug

export function getPolkaVmChain(slug: PolkaVmSlug = DEFAULT_POLKAVM_SLUG) {
  return POLKAVM_TEST_CHAINS.find(chain => chain.slug === slug) ?? POLKAVM_TEST_CHAINS[0]
}

export function getPolkaVmPublicClient(slug: PolkaVmSlug = DEFAULT_POLKAVM_SLUG) {
  return getPublicClient(getPolkaVmChain(slug).chainId)
}
