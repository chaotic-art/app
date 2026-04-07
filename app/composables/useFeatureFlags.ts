export default function useFeatureFlags() {
  const route = useRoute()

  const usePolkaVmTestnet = computed(() => route.query.testnet === 'true')

  return {
    usePolkaVmTestnet,
  }
}
