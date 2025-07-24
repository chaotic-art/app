export default () => {
  const { $api } = useNuxtApp()
  const { prefix } = usePrefix()

  const api = computed(() => {
    return $api(prefix.value)
  })

  return {
    api,
  }
}
