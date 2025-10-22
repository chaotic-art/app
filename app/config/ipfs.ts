export const CF_IMAGE_URL = 'https://imagedelivery.net/Im3azVCMHMp2rDcvZOACIg/'
export const CHAOTIC_BUCKET_URL = 'https://c94688c1-bucket.dotlab.workers.dev/'

export type IPFSProviders = 'ipfs' | 'chaotic'

const ipfsProviders: Partial<Record<IPFSProviders, string>> = {
  ipfs: 'https://ipfs.io/',
  chaotic: CHAOTIC_BUCKET_URL,
}

export function getIPFSProvider(providerName: IPFSProviders): string {
  return ipfsProviders[providerName] || (ipfsProviders.chaotic as string)
}
