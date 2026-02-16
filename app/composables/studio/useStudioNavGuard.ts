export function useStudioNavGuard() {
  const store = useBulkOperationsStore()
  const router = useRouter()
  const showWarning = ref(false)
  let pendingRoute: string | null = null

  onBeforeRouteLeave((to, _from, next) => {
    if (store.isActive) {
      showWarning.value = true
      pendingRoute = to.fullPath
      next(false)
    }
    else {
      next()
    }
  })

  function confirmLeave() {
    showWarning.value = false
    store.reset()
    if (pendingRoute) {
      const route = pendingRoute
      pendingRoute = null
      router.push(route)
    }
  }

  function cancelLeave() {
    showWarning.value = false
    pendingRoute = null
  }

  return {
    showWarning,
    confirmLeave,
    cancelLeave,
  }
}
