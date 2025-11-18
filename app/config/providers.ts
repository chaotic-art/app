/**
 * Network providers configuration
 * Generated from @polkadot/apps-config endpoints
 *
 * This file is auto-generated. Do not edit manually.
 * Run 'node scripts/generate-providers.mjs' to regenerate.
 */

export const PROVIDERS = {
  // Polkadot Asset Hub (AHP)
  ahp: [
    'wss://sys.ibp.network/asset-hub-polkadot',
    'wss://asset-hub-polkadot.dotters.network',
    'wss://polkadot-asset-hub-rpc.polkadot.io',
  ] as const,

  // Kusama Asset Hub (AHK)
  ahk: [
    'wss://sys.ibp.network/asset-hub-kusama',
    'wss://asset-hub-kusama.dotters.network',
    'wss://kusama-asset-hub-rpc.polkadot.io',
  ] as const,

  // Polkadot Relay Chain (DOT)
  dot: [
    'wss://polkadot-rpc.publicnode.com',
    'wss://polkadot-public-rpc.blockops.network/ws',
    'wss://polkadot-rpc.n.dwellir.com',
    'wss://polkadot-rpc-tn.dwellir.com',
    'wss://rpc-polkadot.helixstreet.io',
    'wss://rpc.ibp.network/polkadot',
    'wss://polkadot.dotters.network',
    'wss://rpc-polkadot.luckyfriday.io',
    'wss://polkadot.api.onfinality.io/public-ws',
    'wss://polkadot.rpc.permanence.io',
    'wss://polkadot.public.curie.radiumblock.co/ws',
    'wss://spectrum-03.simplystaking.xyz/cG9sa2Fkb3QtMDMtOTFkMmYwZGYtcG9sa2Fkb3Q/LjwBJpV3dIKyWQ/polkadot/mainnet/',
    'wss://dot-rpc.stakeworld.io',
    'wss://polkadot.rpc.subquery.network/public/ws',
  ] as const,

  // Kusama Relay Chain (KSM)
  ksm: [
    'wss://kusama-rpc.publicnode.com',
    'wss://kusama-public-rpc.blockops.network/ws',
    'wss://kusama-rpc.n.dwellir.com',
    'wss://kusama-rpc-tn.dwellir.com',
    'wss://rpc-kusama.helixstreet.io',
    'wss://rpc.ibp.network/kusama',
    'wss://kusama.dotters.network',
    'wss://rpc-kusama.luckyfriday.io',
    'wss://kusama.api.onfinality.io/public-ws',
    'wss://kusama.public.curie.radiumblock.co/ws',
    'wss://ksm-rpc.stakeworld.io',
  ] as const,

  // Paseo Asset Hub (AHPAS) - Testnet
  ahpas: [
    'wss://asset-hub-paseo-rpc.n.dwellir.com',
    'wss://sys.ibp.network/asset-hub-paseo',
    'wss://asset-hub-paseo.dotters.network',
    'wss://pas-rpc.stakeworld.io/assethub',
    'wss://sys.turboflakes.io/asset-hub-paseo',
  ] as const,
} as const

export type ProviderChain = keyof typeof PROVIDERS
export type ProvidersConfig = typeof PROVIDERS
