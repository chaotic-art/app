import { useDebounceFn } from '@vueuse/core'

interface ModalTrackerOptions {
  isOpen: Ref<boolean>
  onClose?: () => void
  onOpen?: () => void
  onChange?: () => void
  closeDebounceMs?: number
}

export function useModalIsOpenTracker(options: ModalTrackerOptions) {
  const { isOpen, onChange, onOpen, onClose, closeDebounceMs = 500 } = options

  const debouncedOnClose = onClose ? useDebounceFn(onClose, closeDebounceMs) : undefined

  watch(isOpen, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      if (onChange) {
        onChange()
      }

      if (newValue && onOpen) {
        onOpen()
      }

      if (!newValue && debouncedOnClose) {
        debouncedOnClose()
      }
    }
  })
}
