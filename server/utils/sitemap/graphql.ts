import type { SupportedChain } from '~~/app/plugins/sdk.client'

import { $fetch } from 'ofetch'

import { dotHubDenyList, ksmHubDenyList, URLS } from '~~/app/utils/constants'

export type SitemapChain = Extract<SupportedChain, 'ahp' | 'ahk'>

const DENY_LISTS: Record<SitemapChain, string[]> = {
  ahk: ksmHubDenyList,
  ahp: dotHubDenyList,
}

interface GraphqlError {
  message: string
}

interface GraphqlResponse<T> {
  data?: T
  errors?: GraphqlError[]
}

export function getSitemapGraphqlEndpoint(chain: SitemapChain): string {
  return URLS.graphql[chain]
}

export function getSitemapDenyList(chain: SitemapChain): string[] {
  return DENY_LISTS[chain]
}

export async function fetchGraphql<T>({
  chain,
  query,
  variables,
}: {
  chain: SitemapChain
  query: string
  variables: Record<string, unknown>
}): Promise<T> {
  const endpoint = getSitemapGraphqlEndpoint(chain)

  const response = await $fetch<GraphqlResponse<T>>(endpoint, {
    method: 'POST',
    body: {
      query,
      variables,
    },
    headers: {
      'content-type': 'application/json',
    },
  })

  if (response.errors?.length) {
    const message = response.errors.map(error => error.message).join('; ')
    throw new Error(`GraphQL request failed for ${chain} (${endpoint}): ${message}`)
  }

  if (!response.data) {
    throw new Error(`GraphQL request returned no data for ${chain} (${endpoint})`)
  }

  return response.data
}
