<script setup lang="ts">
import type { SupportedChain } from '~/plugins/sdk.client'
import { extractHostname, formatLatency, latencyColorClass, measureLatency, SLOW_RPC_THRESHOLD_MS } from '~/composables/useRpcLatency'
import { PROVIDERS } from '~/config/providers'
import { chainSpec } from '~/utils/chain'

function isSupportedChain(chain: string | undefined): chain is SupportedChain {
  return !!chain && chain in PROVIDERS
}

const { currentChain } = useChain()
const rpcStore = useRpcProviderStore()
const currentBlock = useCurrentBlock()
const isOpen = ref(false)
const selectedUrl = computed(() => {
  const chain = currentChain.value
  return isSupportedChain(chain) ? rpcStore.getProvider(chain) : undefined
})

const chainName = computed(() => {
  const chain = currentChain.value
  return isSupportedChain(chain) ? (chainSpec?.[chain]?.name ?? 'Unknown') : 'Unknown'
})

const providerUrls = computed(() => {
  const chain = currentChain.value
  return isSupportedChain(chain) ? PROVIDERS[chain] : []
})

const latencies = shallowRef(new Map<string, number | null>())
const isMeasuring = ref(false)

/** Current provider latency from store (set by auto-switch or panel measurement). */
const currentLatency = computed(() => {
  const chain = currentChain.value
  return isSupportedChain(chain) ? rpcStore.lastLatencyByChain[chain] : undefined
})

/** Connection status for pill: 'live' | 'degraded' | 'offline'. */
const connectionStatus = computed(() => {
  const lat = currentLatency.value
  if (lat === undefined)
    return 'live'
  if (lat === null)
    return 'offline'
  if (lat > SLOW_RPC_THRESHOLD_MS)
    return 'degraded'
  return 'live'
})

const statusLabel = computed(() => {
  switch (connectionStatus.value) {
    case 'offline':
      return '● Offline'
    case 'degraded':
      return '● Degraded'
    default:
      return '● Live'
  }
})

const statusColorClass = computed(() => {
  switch (connectionStatus.value) {
    case 'offline':
      return 'text-red-500'
    case 'degraded':
      return 'text-yellow-500'
    default:
      return 'text-green-500'
  }
})

const tooltipText = computed(() => {
  const url = selectedUrl.value
  const lat = currentLatency.value
  const host = url ? extractHostname(url) : '—'
  const latStr = formatLatency(lat)
  const block = currentBlock.value
  const blockStr = block ? `Block #${block.toLocaleString()}` : 'Block #—'
  return `Connected • ${latStr} • ${host} • ${blockStr}`
})

async function measureCurrentChain() {
  const urls = providerUrls.value
  const chain = currentChain.value
  if (!urls.length || !isSupportedChain(chain))
    return
  isMeasuring.value = true
  const newLatencies = new Map<string, number | null>()

  const promises = urls.map(async (url) => {
    const result = await measureLatency(url)
    newLatencies.set(url, result)
  })

  await Promise.all(promises)
  latencies.value = newLatencies
  triggerRef(latencies)
  const selected = selectedUrl.value
  if (selected !== undefined) {
    rpcStore.setLastLatency(chain, newLatencies.get(selected) ?? null)
  }
  isMeasuring.value = false
}

watch(isOpen, (open) => {
  if (open)
    measureCurrentChain()
})

function handleSelect(url: string, close?: () => void) {
  if (isProviderError(url))
    return
  const chain = currentChain.value
  if (isSupportedChain(chain)) {
    rpcStore.setProvider(chain, url)
    const lat = latencies.value.get(url)
    rpcStore.setLastLatency(chain, lat ?? null)
  }
  close?.()
}

function isSelected(url: string): boolean {
  return selectedUrl.value === url
}

function isProviderError(url: string): boolean {
  return latencies.value.get(url) === null
}
</script>

<template>
  <div v-if="providerUrls.length">
    <UPopover v-model:open="isOpen">
      <UTooltip :text="tooltipText" :content="{ side: 'right' }">
        <UButton
          variant="ghost"
          color="neutral"
          size="sm"
          class="rounded-full gap-1.5 px-3 py-1.5 text-xs font-medium border border-border bg-elevated/80 backdrop-blur"
          aria-label="Connection status – Select RPC provider"
        >
          <span :class="statusColorClass">
            {{ statusLabel }}
          </span>
        </UButton>
      </UTooltip>

      <template #content="{ close }">
        <div class="p-3 min-w-64 max-w-sm">
          <div class="flex items-center justify-between gap-2 mb-2">
            <span class="text-sm font-medium text-foreground">
              RPC Provider
            </span>
            <div class="flex items-center gap-1">
              <span class="text-xs text-muted">
                {{ chainName }}
              </span>
              <UButton
                icon="i-lucide-refresh-cw"
                color="neutral"
                variant="ghost"
                size="xs"
                :loading="isMeasuring"
                aria-label="Refresh latency"
                @click="measureCurrentChain"
              />
            </div>
          </div>
          <p class="text-xs text-muted mb-3">
            Select endpoint. Latency is measured when opened; use refresh to re-measure. Green = fast, yellow = medium, red = slow.
          </p>
          <div
            v-if="isMeasuring && latencies.size === 0"
            class="flex items-center gap-2 py-2 text-muted text-sm"
          >
            <UIcon name="i-lucide-loader-circle" class="h-4 w-4 animate-spin" />
            Measuring latency...
          </div>
          <ul class="space-y-0.5 max-h-72 overflow-y-auto">
            <li
              v-for="url in providerUrls"
              :key="url"
            >
              <button
                type="button"
                :aria-label="`Select ${extractHostname(url)} - ${formatLatency(latencies.get(url))}`"
                :disabled="isProviderError(url)"
                class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :class="[
                  isProviderError(url)
                    ? 'cursor-not-allowed'
                    : isSelected(url)
                      ? 'bg-primary/10 text-foreground cursor-pointer'
                      : 'hover:bg-elevated text-foreground cursor-pointer',
                ]"
                @click="handleSelect(url, close)"
              >
                <UIcon
                  name="i-lucide-circle"
                  class="h-2.5 w-2.5 shrink-0"
                  :class="latencyColorClass(latencies.get(url))"
                />
                <span class="flex-1 min-w-0 truncate text-sm font-mono">
                  {{ extractHostname(url) }}
                </span>
                <span
                  class="text-xs tabular-nums shrink-0"
                  :class="latencyColorClass(latencies.get(url))"
                >
                  {{ formatLatency(latencies.get(url)) }}
                </span>
                <UIcon
                  v-if="isSelected(url)"
                  name="i-lucide-check"
                  class="h-4 w-4 text-primary shrink-0"
                />
              </button>
            </li>
          </ul>
        </div>
      </template>
    </UPopover>
  </div>
</template>
