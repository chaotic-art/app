import type { Prefix } from '@kodadot1/static'
import { chainPrefixes } from '~/utils/prefix'

export default defineNuxtRouteMiddleware((route) => {
  const { setPrefix: setUrlPrefix, prefix: urlPrefix } = usePrefix()

  const prefixInPath = (route.params.chain || route.path.split('/')[1]) as Prefix
  const isAnyChainPrefixInPath = chainPrefixes.includes(prefixInPath)

  if (
    urlPrefix.value !== prefixInPath
    && prefixInPath
    && isAnyChainPrefixInPath
  ) {
    setUrlPrefix(prefixInPath)
  }

  // TODO: walletStore.switchChain(urlPrefix.value)
})
