import type { SupportedChain } from '~/plugins/sdk.client'
import { PROVIDERS } from '~/config/providers'

async function getFastestEndpointForChain(endpoints: string[], timeoutMs: number = 2000): Promise<string> {
  if (!endpoints || endpoints.length === 0) {
    throw new Error('No WebSocket URLs provided')
  }

  return new Promise((resolve, reject) => {
    const connections: WebSocket[] = []
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

    // Set up timeout
    timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true
        cleanup()
        reject(new Error(`Connection timeout after ${timeoutMs}ms`))
      }
    }, timeoutMs)

    endpoints.forEach((url, index) => {
      try {
        const ws = new WebSocket(url)
        connections[index] = ws

        ws.onopen = () => {
          if (!resolved) {
            resolved = true

            connections.forEach((otherWs, otherIndex) => {
              if (otherIndex !== index && otherWs && otherWs.readyState !== WebSocket.CLOSED) {
                otherWs.close()
              }
            })

            clearTimeout(timeoutId)
            resolve(url)
          }
          else {
            ws.close()
          }
        }

        ws.onerror = (error) => {
          // Only reject if no connection has succeeded and this is the last attempt
          const remainingConnections = connections.filter(conn =>
            conn && conn.readyState === WebSocket.CONNECTING,
          )

          if (!resolved && remainingConnections.length === 1) {
            // This was the last connection attempting, and it failed
            resolved = true
            cleanup()
            reject(new Error(`All WebSocket connections failed. Last error: ${error.message || 'Connection failed'}`))
          }
        }

        ws.onclose = () => {
          // Check if all connections have failed
          if (!resolved) {
            const hasOpenOrConnecting = connections.some(conn =>
              conn && (conn.readyState === WebSocket.CONNECTING || conn.readyState === WebSocket.OPEN),
            )

            if (!hasOpenOrConnecting) {
              resolved = true
              cleanup()
              reject(new Error('All WebSocket connections failed'))
            }
          }
        }
      }
      catch {
        // Check if this was the last URL and no connections are pending
        const validConnections = connections.filter(Boolean)
        if (!resolved && validConnections.length === 0 && index === endpoints.length - 1) {
          resolved = true
          cleanup()
          reject(new Error('Failed to create any WebSocket connections'))
        }
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

  async function getFastestEndpoint(chains: SupportedChain[]): Promise<Record<SupportedChain, string>> {
    if (!chains || chains.length === 0) {
      return {} as Record<SupportedChain, string>
    }

    try {
      const promises = chains.map(async (chain) => {
        try {
          const endpoints = PROVIDERS[chain]

          if (!Array.isArray(endpoints)) {
            return { chain, fastest: null }
          }

          const fastest = await getFastestEndpointForChain(endpoints)

          return { chain, fastest }
        }
        catch {
          return { chain, fastest: null }
        }
      })

      const results = await Promise.allSettled(promises)

      const result = {} as Record<SupportedChain, string>

      results.forEach((promiseResult) => {
        if (promiseResult.status === 'fulfilled') {
          const { chain, fastest } = promiseResult.value
          if (fastest) {
            result[chain] = fastest
          }
        }
      })

      return result
    }
    catch {
      return {} as Record<SupportedChain, string>
    }
  }

  return {
    getFastestEndpoint,
    endpoints,
  }
})
