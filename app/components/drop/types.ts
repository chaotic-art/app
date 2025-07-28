export interface MinimumFundsProp {
  amount: number
  description: string
  hasAmount: boolean
  isLoading: boolean
}

export interface MintButtonProp {
  label: string
  disabled: boolean
}

export interface HolderOfCollection {
  id: string
  isHolder: boolean
  isLoading: boolean
  hasAvailable: boolean
  amount: {
    total: number
    available: number
  }
}

export interface ToMintNft {
  name: string
  collectionName: string
  price: string
  priceUSD: string
}

export interface MintedNFT {
  id: string
  chain: string
  name: string
  image: string
  collection: { id: string, name: string, max?: number }
  metadata: string
  mimeType?: string
}

export interface MintingSession {
  txHash?: string
  items: MintedNFT[]
  isLoading: boolean
  failed: boolean
  status: TransactionStatus
}
