export enum BulkOperationType {
  MASS_MINT = 'MASS_MINT',
  AIRDROP = 'AIRDROP',
  LIST = 'LIST',
  DELIST = 'DELIST',
  TRANSFER = 'TRANSFER',
  EDIT = 'EDIT',
}

export enum MassMintStep {
  UPLOAD = 0,
  METADATA = 1,
  REVIEW = 2,
  MINT = 3,
}

export enum MintingState {
  PRE_SIGN = 'PRE_SIGN',
  SIGNING = 'SIGNING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum MetadataPath {
  TEMPLATE = 'TEMPLATE',
  UNIFORM = 'UNIFORM',
}

export interface BulkOperationItem {
  id: string
  chain: string
  tokenId?: number
  collectionId?: string
  name?: string
  image?: string
}

export interface StepConfig {
  label: string
  icon?: string
}
