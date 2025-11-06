import type { IPFSProviders } from '@/config/ipfs'
import { IPFS_REGEX, isCID, isHTTP } from '@kodadot1/minipfs'
import { getIPFSProvider } from '@/config/ipfs'

export const ipfsUrlPrefix = 'ipfs://ipfs/'

export function fastExtract(ipfsLink?: string): string {
  if (!ipfsLink) {
    return ''
  }

  if (ipfsLink.includes(ipfsUrlPrefix)) {
    return ipfsLink.replace(ipfsUrlPrefix, '')
  }

  return ipfsLink.replace('ipfs://', '')
}

export function sanitizeIpfsCid(url: string, provider?: IPFSProviders): string {
  return `${resolveProvider(provider)}ipfs/${url}`
}

function resolveProvider(key: IPFSProviders = 'chaotic'): string {
  return getIPFSProvider(key)
}

export function replaceIpfsGateway(url: string, provider?: IPFSProviders): string {
  const gateway = resolveProvider(provider)
  const replaceGateway = new URL(gateway)
  const currentGateway = new URL(url)
  currentGateway.hostname = replaceGateway.hostname

  return currentGateway.toString()
}

export function assetExternalUrl(url: string) {
  const kodaUrl = new URL(`/type/endpoint/${url}`, URLS.services.bucket)

  return kodaUrl.href.toString()
}

export function sanitizeIpfsUrl(ipfsUrl = '', provider?: IPFSProviders): string {
  if (!ipfsUrl) {
    return ''
  }

  const isChaoticUrl = isHTTP(ipfsUrl) && ipfsUrl.includes('chaotic.art')
  const isKodaImageUrl = URLS.services.bucket && ipfsUrl.includes(URLS.services.bucket)

  if (isChaoticUrl || isKodaImageUrl) {
    return ipfsUrl
  }

  const extract = fastExtract(ipfsUrl)

  if (isHTTP(extract) && extract.includes('/ipfs/')) {
    return replaceIpfsGateway(extract, provider)
  }

  if (isCID(extract) || IPFS_REGEX.test(ipfsUrl) || !isHTTP(extract)) {
    return sanitizeIpfsCid(extract, provider)
  }

  return assetExternalUrl(extract)
}

export function toOriginalContentUrl(baseurl: string) {
  if (!baseurl) {
    return ''
  }

  const url = new URL(baseurl)
  url.searchParams.append('original', 'true')
  return url.toString()
}

export function ipfsToCfImageUrl(ipfsUrl?: string, variant = 'public') {
  if (!ipfsUrl) {
    return ''
  }

  return `${URLS.providers.cf_images}${fastExtract(ipfsUrl)}/${variant}`
}
