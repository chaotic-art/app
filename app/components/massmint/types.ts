export enum Status {
  Ok = 'Ok',
  Incomplete = 'Incomplete',
  Description = 'Description',
  Price = 'Price',
  Optional = 'Optional',
}

export interface NFT {
  id: number
  imageUrl: string
  name?: string
  file: File
  description?: string
  price?: number
  status?: Status
  attributes?: Array<{
    trait_type: string
    value: string
  }>
  sortedIndex?: number
}

export interface NFTToMint {
  name: string
  file: File
  description?: string
  price?: number
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

export interface NFTS { [id: string]: NFT }
