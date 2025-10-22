export const CF_IMAGE_URL = 'https://imagedelivery.net/Im3azVCMHMp2rDcvZOACIg/'
export const CHAOTIC_BUCKET_URL = 'https://bucket.chaotic.art/'

export type IPFSProviders = 'ipfs' | 'image'

const ipfsProviders: Partial<Record<IPFSProviders, string>> = {
  ipfs: 'https://ipfs.io/',
  image: CHAOTIC_BUCKET_URL,
}

export function getIPFSProvider(providerName: IPFSProviders): string {
  return ipfsProviders[providerName] || (ipfsProviders.ipfs as string)
}
