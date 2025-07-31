interface ModalTrackerOptions {
  isOpen: Ref<boolean>
  onClose?: boolean
  onChange?: () => void
}

export function useModalIsOpenTracker(options: ModalTrackerOptions) {
  const { isOpen, onChange } = options

  watch(isOpen, (newValue, oldValue) => {
    if (newValue !== oldValue && onChange) {
      onChange()
    }
  })
}
