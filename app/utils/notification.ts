export function successMessage(message?: string) {
  const toast = useToast()
  toast.add({ title: message || 'Success', color: 'success' })
}

export function warningMessage(message?: string) {
  const toast = useToast()
  toast.add({ title: message || 'Warning', color: 'warning' })
}

export function errorMessage(message?: string) {
  const toast = useToast()
  toast.add({ title: message || 'Error', color: 'error' })
}
