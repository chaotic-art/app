import type { DocumentNode } from 'graphql'
import type { ResultOf, VariablesOf } from '~/graphql/client'
import type { AssetHubChain } from '~/plugins/sdk.client'
import consola from 'consola'
import isEqual from 'lodash/isEqual'

export default function useSubscriptionGraphql<TDoc extends DocumentNode, TData = ResultOf<TDoc>, TVariables = VariablesOf<TDoc>>({
  chain,
  query,
  variables,
  onChange,
  onError,
  pollingInterval = 6000,
  disabled,
  immediate = true,
}: {
  chain?: AssetHubChain
  query: TDoc
  variables?: TVariables
  onChange: (data: { data: TData }) => void
  onError?: (error: unknown) => void
  pollingInterval?: number
  disabled?: ComputedRef<boolean>
  immediate?: boolean
}) {
  const { currentChain } = useChain()
  const { $apolloClient } = useNuxtApp()
  const endpoint = chain || currentChain.value

  if (disabled?.value) {
    return () => {}
  }

  let lastQueryResult: TData | null = null
  let intervalId: number | null = null

  const isPolling = ref(false)

  async function pollData() {
    try {
      const { data } = await $apolloClient.query<TData>({
        query,
        variables: variables as any,
        fetchPolicy: 'network-only',
        context: {
          endpoint,
        },
      })

      const newResult = data

      if (!isEqual(newResult, lastQueryResult)) {
        if (!lastQueryResult ? immediate : true) {
          consola.log('[Graphql Subscription] New changes:', JSON.stringify(newResult))
          onChange({ data: newResult })
        }
        lastQueryResult = newResult
      }
    }
    catch (error) {
      consola.error('[Graphql Subscription] Polling error:', error)
      onError && onError(error)
    }
  }

  function startPolling() {
    if (!isPolling.value) {
      isPolling.value = true
      // fire immediately
      pollData()
      intervalId = setInterval(pollData, pollingInterval) as unknown as number
      consola.log('[Graphql Subscription] Started polling')
    }
  }

  function stopPolling() {
    if (isPolling.value && intervalId !== null) {
      clearInterval(intervalId)
      isPolling.value = false
      consola.log('[Graphql Subscription] Stopped polling')
    }
  }

  startPolling()

  // Clean up on component unmount
  onUnmounted(() => {
    stopPolling()
  })

  return stopPolling
}
