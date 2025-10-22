const DEFAULT_IPFS_PROVIDER = 'https://ipfs.io/'
export const CF_IMAGE_URL = 'https://imagedelivery.net/Im3azVCMHMp2rDcvZOACIg/'

export type ProviderKeyType = IPFSProviders
export type IPFSProviders
  = | 'pinata'
    | 'ipfs'
    | 'dweb'
    | 'kodadot'
    | 'image'
    | 'nftStorage'

export const chaoticBucket = 'https://bucket.chaotic.art/'

const ipfsProviders: Partial<Record<IPFSProviders, string>> = {
  pinata: 'https://kodadot.mypinata.cloud/',
  ipfs: DEFAULT_IPFS_PROVIDER,
  dweb: 'https://dweb.link/',
  image: chaoticBucket,
  nftStorage: 'https://nftstorage.link/',
}

export function getIPFSProvider(providerName: IPFSProviders): string {
  return ipfsProviders[providerName] || (ipfsProviders.image as string)
}
