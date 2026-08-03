<script setup lang="ts">
import type { Connector } from '@wagmi/core'
import { useChainId, useConnect, useConnection, useConnections, useConnectors, useDisconnect, useReconnect } from '@wagmi/vue'

const walletStore = useWalletStore()
const accountStore = useAccountStore()

const { wallets, selectedAccounts } = storeToRefs(walletStore)
const { accounts: authAccounts } = storeToRefs(accountStore)

const connectors = useConnectors()
const connections = useConnections()
const connection = useConnection()
const chainId = useChainId()
const { mutateAsync: connectAsync, error: connectError, isPending: isConnecting } = useConnect()
const { mutateAsync: disconnectAsync, error: disconnectError, isPending: isDisconnecting } = useDisconnect()
const { mutateAsync: reconnectAsync, error: reconnectError, isPending: isReconnecting } = useReconnect()

const walletCards = computed(() =>
  connectors.value
    .filter(connector => connector.id !== 'injected')
    .map(connector => ({
      icon: connector.icon ?? '/partners/logo-evm.svg',
      id: connector.id,
      installed: true,
      isActive: connection.connector.value?.id === connector.id,
      name: connector.name,
      type: connector.type,
    })),
)

const liveConnections = computed(() =>
  connections.value.map(({ accounts, chainId, connector }) => ({
    accounts: [...accounts],
    chainId,
    connectorId: connector.id,
    connectorName: connector.name,
  })),
)

const walletStoreSnapshot = computed(() =>
  wallets.value
    .filter(wallet => wallet.vm === 'EVM')
    .map(wallet => ({
      accountIds: wallet.accounts.map(account => account.id),
      id: wallet.id,
      isSelected: wallet.isSelected ?? false,
      name: wallet.name,
      state: wallet.state,
    })),
)

const currentConnection = computed(() => ({
  address: connection.address.value,
  addresses: connection.addresses.value ? [...connection.addresses.value] : [],
  appChainId: chainId.value,
  chainId: connection.chainId.value,
  connectorId: connection.connector.value?.id,
  connectorName: connection.connector.value?.name,
  isConnected: connection.isConnected.value,
  isConnecting: connection.isConnecting.value,
  isDisconnected: connection.isDisconnected.value,
  isReconnecting: connection.isReconnecting.value,
  status: connection.status.value,
}))

const ethereumPresence = computed(() => {
  if (!import.meta.client) {
    return {
      hasEthereum: false,
      providerCount: 0,
    }
  }

  const provider = (window as Window & { ethereum?: { providers?: unknown[] } }).ethereum
  const providers = Array.isArray(provider?.providers) ? provider.providers : []

  return {
    hasEthereum: Boolean(provider),
    providerCount: providers.length,
  }
})

async function connectWallet(connector: Connector) {
  await connectAsync({ connector })
}

async function disconnectWallet(connector: Connector) {
  await disconnectAsync({ connector })
}

async function reconnectWallets() {
  await reconnectAsync()
}
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-2">
      <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Wallet Runtime Debug
      </h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Live wagmi state, discovered connectors, and app wallet-store state.
      </p>
    </div>

    <div class="flex flex-wrap gap-3">
      <UButton
        :loading="isReconnecting"
        color="primary"
        @click="reconnectWallets"
      >
        Reconnect
      </UButton>
    </div>

    <div class="space-y-3">
      <h2 class="text-lg font-medium text-gray-900 dark:text-gray-100">
        Discovered Connectors
      </h2>

      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <UCard
          v-for="wallet in walletCards"
          :key="wallet.id"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <img
                :src="wallet.icon"
                :alt="wallet.name"
                class="h-10 w-10 rounded-lg bg-white object-contain p-1"
              >
              <div>
                <div class="font-medium text-gray-900 dark:text-gray-100">
                  {{ wallet.name }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400">
                  {{ wallet.id }}
                </div>
              </div>
            </div>

            <UBadge
              :color="wallet.isActive ? 'success' : 'neutral'"
              variant="soft"
            >
              {{ wallet.isActive ? 'active' : wallet.type }}
            </UBadge>
          </div>

          <div class="mt-4 flex gap-2">
            <UButton
              :loading="isConnecting"
              size="sm"
              @click="connectWallet(connectors.find(connector => connector.id === wallet.id)!)"
            >
              Connect
            </UButton>

            <UButton
              :loading="isDisconnecting"
              color="neutral"
              size="sm"
              variant="soft"
              @click="disconnectWallet(connectors.find(connector => connector.id === wallet.id)!)"
            >
              Disconnect
            </UButton>
          </div>
        </UCard>
      </div>
    </div>

    <div class="grid gap-4 lg:grid-cols-2">
      <UCard>
        <template #header>
          <div class="font-medium">
            Current Connection
          </div>
        </template>

        <pre class="overflow-x-auto text-xs whitespace-pre-wrap">{{ currentConnection }}</pre>
      </UCard>

      <UCard>
        <template #header>
          <div class="font-medium">
            Browser Injection
          </div>
        </template>

        <pre class="overflow-x-auto text-xs whitespace-pre-wrap">{{ ethereumPresence }}</pre>
      </UCard>

      <UCard>
        <template #header>
          <div class="font-medium">
            Wagmi Connections
          </div>
        </template>

        <pre class="overflow-x-auto text-xs whitespace-pre-wrap">{{ liveConnections }}</pre>
      </UCard>

      <UCard>
        <template #header>
          <div class="font-medium">
            App Wallet Store
          </div>
        </template>

        <pre class="overflow-x-auto text-xs whitespace-pre-wrap">{{ walletStoreSnapshot }}</pre>
      </UCard>

      <UCard>
        <template #header>
          <div class="font-medium">
            Selected Accounts
          </div>
        </template>

        <pre class="overflow-x-auto text-xs whitespace-pre-wrap">{{ selectedAccounts }}</pre>
      </UCard>

      <UCard>
        <template #header>
          <div class="font-medium">
            Account Store
          </div>
        </template>

        <pre class="overflow-x-auto text-xs whitespace-pre-wrap">{{ authAccounts }}</pre>
      </UCard>
    </div>

    <template v-if="connectError || disconnectError || reconnectError">
      <UAlert
        v-if="connectError"
        color="error"
        variant="soft"
        :title="connectError.name"
        :description="connectError.message"
      />

      <UAlert
        v-if="disconnectError"
        color="error"
        variant="soft"
        :title="disconnectError.name"
        :description="disconnectError.message"
      />

      <UAlert
        v-if="reconnectError"
        color="error"
        variant="soft"
        :title="reconnectError.name"
        :description="reconnectError.message"
      />
    </template>
  </div>
</template>
