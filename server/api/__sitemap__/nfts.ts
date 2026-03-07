import type { SitemapUrl } from '#sitemap/types'
import type { SitemapChain } from '~~/server/utils/sitemap/graphql'

import { createSitemapUrl, dedupeSitemapUrls, getErrorMessage, SITEMAP_CHAINS } from '~~/server/utils/sitemap'
import { fetchGraphql, getSitemapDenyList } from '~~/server/utils/sitemap/graphql'

const NFTS_SITEMAP_QUERY = `
  query SitemapNfts($first: Int!, $offset: Int, $denyList: [String!], $orderBy: [NFTEntityOrderByInput!]) {
    nftEntities(
      limit: $first
      offset: $offset
      orderBy: $orderBy
      where: {
        issuer_not_in: $denyList
        burned_eq: false
        metadata_isNull: false
      }
    ) {
      id
    }
  }
`

const NFTS_SITEMAP_PAGE_SIZE = 250
const NFTS_SITEMAP_LIMIT_PER_CHAIN = 1000

interface NftsResponse {
  nftEntities: Array<{
    id: string
  }>
}

const NFTS_SITEMAP_ORDER = ['blockNumber_DESC', 'sn_DESC']

async function fetchNftUrlsForChain(chain: SitemapChain): Promise<SitemapUrl[]> {
  const urls: SitemapUrl[] = []
  let offset = 0

  while (urls.length < NFTS_SITEMAP_LIMIT_PER_CHAIN) {
    const data = await fetchGraphql<NftsResponse>({
      chain,
      query: NFTS_SITEMAP_QUERY,
      variables: {
        denyList: getSitemapDenyList(chain),
        first: NFTS_SITEMAP_PAGE_SIZE,
        offset,
        orderBy: NFTS_SITEMAP_ORDER,
      },
    })

    const remaining = NFTS_SITEMAP_LIMIT_PER_CHAIN - urls.length

    for (const nft of data.nftEntities.slice(0, remaining)) {
      const url = createSitemapUrl(`/${chain}/gallery/${nft.id}`)
      if (url) {
        urls.push(url)
      }
    }

    if (data.nftEntities.length < NFTS_SITEMAP_PAGE_SIZE) {
      break
    }

    offset += NFTS_SITEMAP_PAGE_SIZE
  }

  return urls
}

export default defineSitemapEventHandler(async () => {
  const urls = await Promise.all(
    SITEMAP_CHAINS.map(async (chain) => {
      try {
        return await fetchNftUrlsForChain(chain)
      }
      catch (error) {
        console.error(`[sitemap:nfts] Failed for ${chain}: ${getErrorMessage(error)}`)
        return []
      }
    }),
  )

  return dedupeSitemapUrls(urls.flat())
})
