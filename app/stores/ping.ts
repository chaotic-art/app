import type { SupportedChain } from '~/plugins/sdk.client'
import { PROVIDERS } from '~/config/providers'

interface FastestEndpointOptions {
  timeoutMs?: number
  limit?: number
}

async function getFastestEndpointsForChain(
  endpoints: string[],
  { timeoutMs = 2000, limit = 3 }: FastestEndpointOptions = {},
): Promise<string[]> {
  if (!endpoints || endpoints.length === 0) {
    throw new Error('No WebSocket URLs provided')
  }

  const effectiveLimit = Math.max(0, Math.min(limit, endpoints.length))

  if (effectiveLimit === 0) {
    return []
  }

  return new Promise((resolve, reject) => {
    const connections: WebSocket[] = []
    const pending = new Set<number>()
    const fastestSet = new Set<string>()
    const fastestList: string[] = []
    let resolved = false
    let timeoutId: NodeJS.Timeout | undefined

    // Cleanup function to close all connections
    const cleanup = () => {
      clearTimeout(timeoutId)
      connections.forEach((ws) => {
        if (ws && ws.readyState !== WebSocket.CLOSED) {
          ws.close()
        }
      })
    }

    const finalize = () => {
      if (resolved) {
        return
      }
      resolved = true
      cleanup()
      resolve(fastestList.slice(0, Math.min(fastestList.length, effectiveLimit)))
    }

    const fail = (error: Error) => {
      if (resolved) {
        return
      }
      resolved = true
      cleanup()
      reject(error)
    }

    const evaluateState = () => {
      if (resolved) {
        return
      }

      if (fastestList.length >= effectiveLimit) {
        finalize()
        return
      }

      if (pending.size === 0) {
        if (fastestList.length > 0) {
          finalize()
        }
        else {
          fail(new Error('All WebSocket connections failed'))
        }
      }
    }

    timeoutId = setTimeout(() => {
      if (resolved) {
        return
      }

      if (fastestList.length > 0) {
        finalize()
      }
      else {
        fail(new Error(`Connection timeout after ${timeoutMs}ms`))
      }
    }, timeoutMs)

    endpoints.forEach((url, index) => {
      pending.add(index)

      try {
        const ws = new WebSocket(url)
        connections[index] = ws

        ws.onopen = () => {
          if (resolved) {
            ws.close()
            return
          }

          if (!fastestSet.has(url)) {
            fastestSet.add(url)
            fastestList.push(url)
          }

          pending.delete(index)

          if (fastestList.length >= effectiveLimit) {
            finalize()
          }
          else {
            ws.close()
            evaluateState()
          }
        }

        ws.onerror = () => {
          if (resolved) {
            return
          }

          pending.delete(index)
          evaluateState()
        }

        ws.onclose = () => {
          if (resolved) {
            return
          }

          pending.delete(index)
          evaluateState()
        }
      }
      catch {
        // Check if this was the last URL and no connections are pending
        pending.delete(index)
        evaluateState()
      }
    })
  })
}
export const usePingStore = defineStore('ping', () => {
  const endpoints = ref<Record<SupportedChain, string[]>>({
    ahp: [],
    dot: [],
    ksm: [],
    ahk: [],
    ahpas: [],
  })

  async function getFastestEndpoints(
    chains: SupportedChain[],
    options?: FastestEndpointOptions,
  ): Promise<Record<SupportedChain, string[]>> {
    if (!chains || chains.length === 0) {
      return {} as Record<SupportedChain, string[]>
    }

    try {
      const promises = chains.map(async (chain) => {
        try {
          const endpoints = PROVIDERS[chain]

          if (!Array.isArray(endpoints)) {
            return { chain, items: [] }
          }

          const items = await getFastestEndpointsForChain(endpoints, options)

          return { chain, items }
        }
        catch {
          return { chain, items: [] }
        }
      })

      const results = await Promise.allSettled(promises)

      const result = {} as Record<SupportedChain, string[]>

      results.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          const { chain, items } = promiseResult.value
          if (items.length > 0) {
            result[chain] = items
          }
        }
      })

      return result
    }
    catch {
      return {} as Record<SupportedChain, string[]>
    }
  }

  return {
    getFastestEndpoints,
    endpoints,
  }
})
