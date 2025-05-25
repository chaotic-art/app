interface EvmChainAccount {
  address: string
  vm: 'EVM'
}

interface SubstrateChainAccount {
  address: string
  ss58: number
  vm: 'SUB'
}

export type ChainAccount = EvmChainAccount | SubstrateChainAccount
export * from './drop'
