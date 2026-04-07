import type { SitemapUrl } from '#sitemap/types'
import type { SitemapChain } from '~~/server/utils/sitemap/graphql'
import type { GenartDropItem } from '~/types/genart'

import { $fetch } from 'ofetch'

import { GENART_WORKERS_URL } from '~~/server/utils/endpoint'
import { createSitemapUrl, dedupeSitemapUrls, DROPS_SITEMAP_CHAINS, getErrorMessage } from '~~/server/utils/sitemap'

interface GenArtDropsResponse {
  data?: GenartDropItem[]
  success?: boolean
}

async function fetchDropUrlsForChain(chain: SitemapChain): Promise<SitemapUrl[]> {
  const response = await $fetch<GenArtDropsResponse>(`${GENART_WORKERS_URL}/drops`, {
    query: {
      chain,
      limit: 200,
    },
  })

  if (!response.success || !Array.isArray(response.data)) {
    throw new Error(`Drop source returned an invalid response for ${chain}`)
  }

  return response.data.flatMap((drop) => {
    if (!drop.alias) {
      return []
    }

    const url = createSitemapUrl(`/${chain}/drops/${drop.alias}`)
    return url ? [url] : []
  })
}

export default defineSitemapEventHandler(async () => {
  const urls = await Promise.all(
    DROPS_SITEMAP_CHAINS.map(async (chain) => {
      try {
        return await fetchDropUrlsForChain(chain)
      }
      catch (error) {
        console.error(`[sitemap:drops] Failed for ${chain}: ${getErrorMessage(error)}`)
        return []
      }
    }),
  )

  return dedupeSitemapUrls(urls.flat())
})
