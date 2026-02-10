<script setup lang="ts">
import type { SupportedChain } from '~/plugins/sdk.client'
import { PROVIDERS } from '~/config/providers'
import { chainSpec } from '~/utils/chain'

const LATENCY_TIMEOUT = 5000

const rpcStore = useRpcProviderStore()

const latencies = ref(new Map<string, number | null>())
const isMeasuring = ref(false)

const chainOrder: SupportedChain[] = ['ahp', 'ahk', 'dot', 'ksm', 'ahpas']

const activeChain = ref<SupportedChain>('ahp')

const chainTabs = computed(() =>
  chainOrder.map(chain => ({
    label: chainSpec[chain].name,
    value: chain,
  })),
)

const chainSelectItems = computed(() =>
  chainOrder.map(chain => ({
    label: chainSpec[chain].name,
    value: chain,
  })),
)

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
    let ws: WebSocket | undefined

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        if (ws) {
          ws.close()
        }
        resolve(null)
      }
    }, LATENCY_TIMEOUT)

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

function formatLatency(url: string): string {
  const ms = latencies.value.get(url)
  if (ms === undefined)
    return '--'
  if (ms === null)
    return 'err'
  return `${ms}ms`
}

function selectProvider(chain: SupportedChain, url: string) {
  rpcStore.setProvider(chain, url)
}

function isSelected(chain: SupportedChain, url: string): boolean {
  return rpcStore.getProvider(chain) === url
}

function isProviderError(url: string): boolean {
  return latencies.value.get(url) === null
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

        <!-- Mobile: Select dropdown -->
        <div class="block md:hidden space-y-3">
          <USelect
            v-model="activeChain"
            :items="chainSelectItems"
            class="w-full"
            size="md"
          />

          <div class="space-y-1">
            <button
              v-for="url in PROVIDERS[activeChain]"
              :key="url"
              :disabled="isProviderError(url)"
              class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
              :class="[
                isProviderError(url)
                  ? 'opacity-40 cursor-not-allowed'
                  : isSelected(activeChain, url)
                    ? 'bg-primary/10 cursor-pointer'
                    : 'hover:bg-elevated cursor-pointer',
              ]"
              @click="selectProvider(activeChain, url)"
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
                v-if="isSelected(activeChain, url)"
                name="i-lucide-check"
                class="h-4 w-4 text-primary shrink-0"
              />
            </button>
          </div>
        </div>

        <!-- Desktop: Tabs -->
        <UTabs
          v-model="activeChain"
          :items="chainTabs"
          color="neutral"
          variant="link"
          class="hidden md:flex w-full"
        >
          <template #content="{ item }">
            <div class="space-y-1 pt-2">
              <button
                v-for="url in PROVIDERS[item.value as SupportedChain]"
                :key="url"
                :disabled="isProviderError(url)"
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                :class="[
                  isProviderError(url)
                    ? 'opacity-40 cursor-not-allowed'
                    : isSelected(item.value as SupportedChain, url)
                      ? 'bg-primary/10 cursor-pointer'
                      : 'hover:bg-elevated cursor-pointer',
                ]"
                @click="selectProvider(item.value as SupportedChain, url)"
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
                  v-if="isSelected(item.value as SupportedChain, url)"
                  name="i-lucide-check"
                  class="h-4 w-4 text-primary shrink-0"
                />
              </button>
            </div>
          </template>
        </UTabs>
      </div>
    </div>
  </UContainer>
</template>
