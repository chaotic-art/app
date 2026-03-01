import { watchDebounced } from '@vueuse/core'

interface UseDebouncedSyncedInputOptions {
  debounce?: number
}

export function useDebouncedSyncedInput(
  source: Readonly<Ref<string>>,
  onDebouncedChange: (value: string) => void,
  options: UseDebouncedSyncedInputOptions = {},
) {
  const { debounce = 300 } = options
  const input = ref(source.value)

  function onInput(value: string) {
    input.value = value
  }

  watch(source, (value) => {
    if (value !== input.value) {
      input.value = value
    }
  })

  watchDebounced(input, (value) => {
    if (value !== source.value) {
      onDebouncedChange(value)
    }
  }, { debounce })

  return {
    input,
    onInput,
  }
}
