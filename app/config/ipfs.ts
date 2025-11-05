export type IPFSProviders = 'ipfs' | 'chaotic'

const ipfsProviders: Partial<Record<IPFSProviders, string>> = {
  ipfs: 'https://ipfs.io/',
  chaotic: URLS.services.bucket,
}

export function getIPFSProvider(providerName: IPFSProviders): string {
  return ipfsProviders[providerName] || (ipfsProviders.chaotic as string)
}
