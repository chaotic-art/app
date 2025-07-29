import type { ToMintNft } from '@/components/drop/types'

export type ToMassmintNFT = Omit<ToMintNft, 'priceUSD'> & {
  image: string
  metadata: string
  nft: number // nft id
  sn?: number // serial numbers
}
