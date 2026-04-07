import type { SitemapUrl } from '#sitemap/types'

import type { SitemapChain } from './graphql'

export const SITEMAP_CHAINS: SitemapChain[] = ['ahp', 'ahk']
export const DROPS_SITEMAP_CHAINS: SitemapChain[] = ['ahp']

export function createSitemapUrl(loc: string, lastmod?: string): SitemapUrl | null {
  if (!loc.startsWith('/')) {
    return null
  }

  return lastmod ? { loc, lastmod } : { loc }
}

export function dedupeSitemapUrls(urls: SitemapUrl[]): SitemapUrl[] {
  const seen = new Set<string>()

  return urls.filter((url) => {
    if (!url.loc || seen.has(url.loc)) {
      return false
    }

    seen.add(url.loc)
    return true
  })
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}
