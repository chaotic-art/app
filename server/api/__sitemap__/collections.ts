import type { SitemapUrl } from '#sitemap/types'
import type { SitemapChain } from '~~/server/utils/sitemap/graphql'

import { createSitemapUrl, dedupeSitemapUrls, getErrorMessage, SITEMAP_CHAINS } from '~~/server/utils/sitemap'
import { fetchGraphql, getSitemapDenyList } from '~~/server/utils/sitemap/graphql'

const COLLECTIONS_SITEMAP_QUERY = `
  query SitemapCollections($first: Int!, $offset: Int, $denyList: [String!]) {
    collectionEntities(
      limit: $first
      offset: $offset
      orderBy: [blockNumber_DESC]
      where: {
        nfts_some: { burned_eq: false, issuer_not_in: $denyList }
        metadata_isNull: false
      }
    ) {
      id
    }
  }
`

const COLLECTIONS_SITEMAP_PAGE_SIZE = 500

interface CollectionsResponse {
  collectionEntities: Array<{
    id: string
  }>
}

async function fetchCollectionUrlsForChain(chain: SitemapChain): Promise<SitemapUrl[]> {
  const urls: SitemapUrl[] = []
  let offset = 0

  while (true) {
    const data = await fetchGraphql<CollectionsResponse>({
      chain,
      query: COLLECTIONS_SITEMAP_QUERY,
      variables: {
        denyList: getSitemapDenyList(chain),
        first: COLLECTIONS_SITEMAP_PAGE_SIZE,
        offset,
      },
    })

    for (const collection of data.collectionEntities) {
      const url = createSitemapUrl(`/${chain}/collection/${collection.id}`)
      if (url) {
        urls.push(url)
      }
    }

    if (data.collectionEntities.length < COLLECTIONS_SITEMAP_PAGE_SIZE) {
      break
    }

    offset += COLLECTIONS_SITEMAP_PAGE_SIZE
  }

  return urls
}

export default defineSitemapEventHandler(async () => {
  const urls = await Promise.all(
    SITEMAP_CHAINS.map(async (chain) => {
      try {
        return await fetchCollectionUrlsForChain(chain)
      }
      catch (error) {
        console.error(`[sitemap:collections] Failed for ${chain}: ${getErrorMessage(error)}`)
        return []
      }
    }),
  )

  return dedupeSitemapUrls(urls.flat())
})
