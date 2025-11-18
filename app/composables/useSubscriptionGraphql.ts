import type { DocumentNode } from 'graphql'
import type { ResultOf, VariablesOf } from '~/graphql/client'
import type { AssetHubChain } from '~/plugins/sdk.client'
import isEqual from 'lodash/isEqual'

export default function useSubscriptionGraphql<
  TDoc extends DocumentNode,
  TData = ResultOf<TDoc>,
  TVariables = VariablesOf<TDoc>,
>({
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
  let intervalId: NodeJS.Timeout | null = null

  const isPolling = ref(false)

  async function pollData() {
    try {
      const { data } = await $apolloClient.query<TData, any>({
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
          onChange({ data: newResult })
        }
        lastQueryResult = newResult
      }
    }
    catch (error) {
      console.error('[Graphql Subscription] Polling error:', error)
      onError && onError(error)
    }
  }

  function startPolling() {
    if (!isPolling.value) {
      isPolling.value = true
      // fire immediately
      pollData()
      intervalId = setInterval(pollData, pollingInterval)
    }
  }

  function stopPolling() {
    if (isPolling.value && intervalId !== null) {
      clearInterval(intervalId)
      isPolling.value = false
    }
  }

  startPolling()

  // Clean up on component unmount
  onUnmounted(() => {
    stopPolling()
  })

  return stopPolling
}
