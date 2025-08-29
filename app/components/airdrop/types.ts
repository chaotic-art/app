export enum DistributionMode {
  ONE_PER_ADDRESS = 'ONE_PER_ADDRESS',
  RANDOM = 'RANDOM',
}

export interface ActionAirdrop {
  addresses: string[]
  nfts: {
    sn: number
    collectionId: number
  }[]
  distributionMode: DistributionMode
}
