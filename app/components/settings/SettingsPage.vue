<script setup lang="ts">
import type { SupportedChain } from '~/plugins/sdk.client'
import { PROVIDERS } from '~/config/providers'
import { chainSpec } from '~/utils/chain'

const LATENCY_TIMEOUT = 5000

const rpcStore = useRpcProviderStore()

const latencies = ref(new Map<string, number | null>())
const isMeasuring = ref(false)

const chainOrder: SupportedChain[] = ['ahp', 'ahk', 'dot', 'ksm', 'ahpas']

function extractHostname(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  }
  catch {
    return url
  }
}

function measureLatency(url: string): Promise<number | null> {
  return new Promise((resolve) => {
    const start = performance.now()
    let resolved = false

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve(null)
      }
    }, LATENCY_TIMEOUT)

    try {
      const ws = new WebSocket(url)

      ws.onopen = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          const latency = Math.round(performance.now() - start)
          resolve(latency)
        }
        ws.close()
      }

      ws.onerror = () => {
        if (!resolved) {
          resolved = true
          clearTimeout(timeout)
          resolve(null)
        }
        ws.close()
      }
    }
    catch {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve(null)
      }
    }
  })
}

async function testChainProviders(chain: SupportedChain) {
  const providers = PROVIDERS[chain]

  // Clear previous results for this chain
  for (const url of providers) {
    latencies.value.delete(url)
  }

  const promises = providers.map(async (url) => {
    const result = await measureLatency(url)
    latencies.value.set(url, result)
  })

  await Promise.allSettled(promises)
}

async function testAllProviders() {
  isMeasuring.value = true
  latencies.value = new Map()

  // Test one chain at a time to avoid too many concurrent WebSocket connections
  for (const chain of chainOrder) {
    await testChainProviders(chain)
  }

  isMeasuring.value = false
}

function latencyColorClass(url: string): string {
  const ms = latencies.value.get(url)
  if (ms === undefined) return 'text-muted'
  if (ms === null) return 'text-red-500'
  if (ms <= 300) return 'text-green-500'
  if (ms <= 1000) return 'text-yellow-500'
  return 'text-red-500'
}

function formatLatency(url: string): string {
  const ms = latencies.value.get(url)
  if (ms === undefined) return '--'
  if (ms === null) return 'err'
  return `${ms}ms`
}

function selectProvider(chain: SupportedChain, url: string) {
  rpcStore.setProvider(chain, url)
}

function isSelected(chain: SupportedChain, url: string): boolean {
  return rpcStore.getProvider(chain) === url
}
</script>

<template>
  <UContainer class="py-8">
    <div class="max-w-5xl mx-auto space-y-8">
      <!-- Page Header -->
      <div>
        <h1 class="text-3xl font-bold">
          Settings
        </h1>
      </div>

      <!-- RPC Providers Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            RPC Providers
          </h2>
          <UButton
            label="Test All"
            icon="i-lucide-activity"
            variant="soft"
            color="neutral"
            size="sm"
            :loading="isMeasuring"
            @click="testAllProviders"
          />
        </div>

        <p class="text-sm text-muted">
          Select a preferred RPC endpoint for each chain. Click "Test All" to measure latency.
        </p>

        <!-- Chain Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UCard
            v-for="chain in chainOrder"
            :key="chain"
          >
            <template #header>
              <div class="flex items-center gap-3">
                <span class="text-base font-semibold">
                  {{ chainSpec[chain].name }}
                </span>
                <UBadge
                  :label="chainSpec[chain].tokenSymbol"
                  variant="subtle"
                  color="neutral"
                  size="sm"
                />
              </div>
            </template>

            <div class="space-y-1">
              <button
                v-for="url in PROVIDERS[chain]"
                :key="url"
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                :class="isSelected(chain, url) ? 'bg-primary/10' : 'hover:bg-elevated'"
                @click="selectProvider(chain, url)"
              >
                <UIcon
                  name="i-lucide-circle"
                  :class="latencyColorClass(url)"
                  class="h-3 w-3 shrink-0"
                />
                <span class="flex-1 text-sm truncate text-left font-mono">
                  {{ extractHostname(url) }}
                </span>
                <span class="text-xs text-muted tabular-nums shrink-0">
                  {{ formatLatency(url) }}
                </span>
                <UIcon
                  v-if="isSelected(chain, url)"
                  name="i-lucide-check"
                  class="h-4 w-4 text-primary shrink-0"
                />
              </button>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>
