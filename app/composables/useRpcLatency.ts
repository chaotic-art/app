/**
 * RPC WebSocket latency measurement and thresholds.
 * Used by Settings RPC section, header RPC switcher, and auto-switch logic.
 */

export const DEFAULT_LATENCY_TIMEOUT_MS = 5000
export const SLOW_RPC_THRESHOLD_MS = 1000

/** Tailwind class for latency: muted (unknown), green (≤300ms), yellow (≤1s), red (slow/error). */
export function latencyColorClass(ms: number | null | undefined): string {
  if (ms === undefined)
    return 'text-muted'
  if (ms === null)
    return 'text-red-500'
  if (ms <= 300)
    return 'text-green-500'
  if (ms <= 1000)
    return 'text-yellow-500'
  return 'text-red-500'
}

/** Human-readable latency: '--' (unknown), 'err' (error), or 'Nms'. */
export function formatLatency(ms: number | null | undefined): string {
  if (ms === undefined)
    return '--'
  if (ms === null)
    return 'err'
  return `${ms}ms`
}

export function extractHostname(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  }
  catch {
    return url
  }
}

/**
 * Measure WebSocket connection latency for an RPC endpoint.
 * @param url - WebSocket URL (e.g. wss://...)
 * @param timeoutMs - Max wait time; defaults to DEFAULT_LATENCY_TIMEOUT_MS
 * @returns Latency in ms, or null on timeout/error
 */
export function measureLatency(
  url: string,
  timeoutMs: number = DEFAULT_LATENCY_TIMEOUT_MS,
): Promise<number | null> {
  return new Promise((resolve) => {
    const start = performance.now()
    let resolved = false
    let ws: WebSocket | undefined

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        if (ws) {
          ws.close()
        }
        resolve(null)
      }
    }, timeoutMs)

    try {
      ws = new WebSocket(url)

      ws.onopen = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          const latency = Math.round(performance.now() - start)
          resolve(latency)
        }
        ws?.close()
      }

      ws.onerror = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          resolve(null)
        }
        ws?.close()
      }
    }
    catch {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        if (ws) {
          ws.close()
        }
        resolve(null)
      }
    }
  })
}
